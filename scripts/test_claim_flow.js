/**
 * Mock TRACE Claim Tester
 * 
 * This script simulates a frontend submission of a Permit2 claim signature
 * to the worker's /submit-claim endpoint.
 */

const http = require('http');

const MOCK_PAYLOAD = {
    "permit": {
        "permitted": [
            { "token": "0xdAC17F958D2ee523a2206206994597C13D831ec7", "amount": "1000000000000000000" }
        ],
        "spender": "0x5351DEEb1ba538d6Cc9E89D4229986A1f8790088", // Mock Router
        "nonce": "123456789",
        "deadline": Math.floor(Date.now() / 1000) + 3600
    },
    "signature": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "chainName": "polygon",
    "owner": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "routerAddress": "0x5351DEEb1ba538d6Cc9E89D4229986A1f8790088",
    "rewardAmount": "2500"
};

function test() {
    console.log("🧪 Sending mock claim to worker...");

    const data = JSON.stringify(MOCK_PAYLOAD);
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/submit-claim',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = "";
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`✅ Worker Response (${res.statusCode}):`, body);
        });
    });

    req.on('error', (e) => {
        console.error("❌ Test Failed (Worker likely not running):", e.message);
    });

    req.write(data);
    req.end();
}

test();
