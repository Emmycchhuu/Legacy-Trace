"use client";

import { useState, useEffect } from "react";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

console.log("🚀 [W3M] Module Evaluation starting...");

// 1. Get projectId with an emergency fallback to the user's ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '189db288ce5f2b17340fc7b48ce06742';

// 2. Set chains
const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
};

const bsc = {
    chainId: 56,
    name: 'BNB Smart Chain',
    currency: 'BNB',
    explorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://binance.llamarpc.com'
};

const polygon = {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon.llamarpc.com'
};

const base = {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://base.llamarpc.com'
};

// 3. Create a metadata object
const metadata = {
    name: 'Legacy Trace',
    description: 'Authenticate your on-chain history.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://legacytrace.com', // Use actual origin
    icons: ['https://legacytrace.com/favicon.ico']
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    metadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: false,
    rpcUrl: mainnet.rpcUrl,
    defaultChainId: 1,
});

// 5. Global Singleton Guard
let modalInstance: any = null;

const initializeModal = () => {
    if (modalInstance) return modalInstance;
    if (typeof window === 'undefined') return null;

    try {
        console.log("📡 [W3M] Initializing Modal with Project ID:", projectId.slice(0, 6) + "...");
        modalInstance = createWeb3Modal({
            ethersConfig,
            chains: [mainnet, bsc, polygon, base],
            projectId,
            enableAnalytics: false,
            allowUnsupportedChain: true,
            themeMode: 'dark',
            themeVariables: {
                '--w3m-accent': '#D4AF37',
                '--w3m-border-radius-master': '1px',
                '--w3m-z-index': 99999
            }
        });
        (window as any).W3M_MODAL = modalInstance;
        console.log("✅ [W3M] Initialization Successful");
        return modalInstance;
    } catch (e) {
        console.error("❌ [W3M] Initialization Failed:", e);
        return null;
    }
};

// Immediate attempt on module load
initializeModal();

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [status, setStatus] = useState<"WAITING" | "INITIALIZED" | "FAILED">("WAITING");

    useEffect(() => {
        setMounted(true);
        const modal = initializeModal();
        if (modal) {
            setStatus("INITIALIZED");
        } else {
            setStatus("FAILED");
        }

        // Session cleanup
        const hasCleaned = sessionStorage.getItem('w3m_session_cleaned_v5');
        if (!hasCleaned) {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('wc@2') || key.includes('walletconnect') || key.includes('W3M_')) {
                    localStorage.removeItem(key);
                }
            });
            sessionStorage.setItem('w3m_session_cleaned_v5', 'true');
        }
    }, []);

    if (!mounted) return <>{children}</>;

    return (
        <>
            {children}
            {/* Direct Diagnostic Badge - Only visible during debug */}
            <div className="fixed bottom-4 left-4 z-[999999] pointer-events-none">
                <div className={`px-3 py-1 rounded-full text-[8px] font-bold border ${status === "INITIALIZED" ? "bg-green-500/10 border-green-500/50 text-green-400" :
                    status === "FAILED" ? "bg-red-500/10 border-red-500/50 text-red-400" :
                        "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                    }`}>
                    W3M: {status}
                </div>
            </div>
        </>
    );
}
