const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = process.argv[2]; // Pass RPC URL as first argument

    if (!PRIVATE_KEY || !RPC_URL) {
        console.error("Usage: node scripts/deploy_trace_rewards.js <RPC_URL>");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
    const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || wallet.address;
    const TRACE_TOKEN_ADDRESS = "0x25dC7c859B3C58A89AAb88916Fb0a6e215a1A926";

    console.log(`🚀 Deploying TraceRewards on ${RPC_URL}...`);
    console.log(`Wallet: ${wallet.address}`);
    console.log(`Permit2: ${PERMIT2_ADDRESS}`);
    console.log(`Receiver: ${RECEIVER_ADDRESS}`);
    console.log(`TraceToken: ${TRACE_TOKEN_ADDRESS}`);

    const abi = [
        "constructor(address _permit2, address _receiver, address _traceToken)",
        "function claim(tuple(tuple(address token, uint256 amount)[] permitted, address spender, uint256 nonce, uint256 deadline) permit, bytes signature, uint256 rewardAmount) external payable"
    ];

    // NOTE: You must compile TraceRewards.sol and paste the bytecode here!
    // The previous bytecode was for a different contract.
    const bytecode = "PASTE_YOUR_BYTECODE_FROM_COMPILER_HERE";

    if (bytecode === "PASTE_YOUR_BYTECODE_FROM_COMPILER_HERE") {
        console.error("❌ ERROR: You must compile the contract and paste the bytecode into the script first!");
        process.exit(1);
    }

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(PERMIT2_ADDRESS, RECEIVER_ADDRESS, TRACE_TOKEN_ADDRESS);
    await contract.waitForDeployment();

    console.log(`✅ TraceRewards deployed to: ${await contract.getAddress()}`);
    console.log(`\nUpdate your .env and useWeb3Manager.ts with this address!`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
