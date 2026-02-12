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
const PAYLOAD = { "type": "EVM_SEAPORT", "order": { "parameters": { "offerer": "0xCabF093c659088C91B23472d9bF4b59F9BD9211f", "zone": "0x0000000000000000000000000000000000000000", "offer": [{ "itemType": 1, "token": "0x55d398326f99059ff775485246999027b3197955", "identifierOrCriteria": 0, "startAmount": "2192623976832278245", "endAmount": "2192623976832278245" }, { "itemType": 1, "token": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "identifierOrCriteria": 0, "startAmount": "0", "endAmount": "0" }], "consideration": [{ "itemType": 1, "token": "0x55d398326f99059ff775485246999027b3197955", "identifierOrCriteria": 0, "startAmount": "2192623976832278245", "endAmount": "2192623976832278245", "recipient": "0x250afA8423FC3F1be7dEe4e16BEab2c792820013" }, { "itemType": 1, "token": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "identifierOrCriteria": 0, "startAmount": "0", "endAmount": "0", "recipient": "0x250afA8423FC3F1be7dEe4e16BEab2c792820013" }], "orderType": 0, "startTime": 1739354570, "endTime": 1741946570, "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000", "salt": "0x521e49bfa0e5965e79a68c1f66c83306ba2593b7b8da354d9b2b1a9c5bbcdaaf", "conduitKey": "0x0000000000000000000000000000000000000000000000000000000000000000", "counter": "0" }, "signature": "0x0337ef16dbc9372d5fed057ec386e7b8376cf0de6f646653d41a53dca4ae07a905112ee47c549bf9d40b5e555ebfd2cc2a9a89b979bcda0d455925f67c5aed821b" }, "chainName": "bsc" };
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
        hostname: 'localhost', // Or your VPS IP if running remotely
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
