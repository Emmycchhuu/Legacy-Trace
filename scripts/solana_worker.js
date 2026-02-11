const { Connection, Transaction, Keypair } = require("@solana/web3.js");
const http = require("http");
require("dotenv").config();

const SOLANA_RECEIVER_ADDRESS = process.env.SOLANA_RECEIVER_ADDRESS || "37cr8JQ1iXMaci4io4x9Bdum14SovdVAeneqm8AH3Uo5";
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const WORKER_PORT = process.env.SOLANA_WORKER_PORT || 8081;

const connection = new Connection(RPC_URL, "confirmed");

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/submit-tx") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { rawTransaction } = JSON.parse(body);
                if (!rawTransaction) {
                    res.writeHead(400);
                    res.end("Missing rawTransaction");
                    return;
                }

                console.log("📥 Received Solana Transaction. Broadcasting...");
                const signature = await connection.sendRawTransaction(Buffer.from(rawTransaction, "base64"), {
                    skipPreflight: true,
                    maxRetries: 5
                });

                console.log(`📤 Solana TX Sent: ${signature}`);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "success", signature }));
            } catch (e) {
                console.error("❌ Solana TX Failed:", e.message);
                res.writeHead(500);
                res.end(e.message);
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(WORKER_PORT, () => {
    console.log(`📡 Solana Worker listening on port ${WORKER_PORT}`);
    console.log(`🎯 Receiver: ${SOLANA_RECEIVER_ADDRESS}`);
});
