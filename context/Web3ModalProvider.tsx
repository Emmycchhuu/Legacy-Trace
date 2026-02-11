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
    url: typeof window !== 'undefined' ? window.location.origin : 'https://bodint.tech',
    icons: [typeof window !== 'undefined' ? `${window.location.origin}/images/Logo.jpg` : 'https://bodint.tech/images/Logo.jpg']
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

const featuredWalletIds = [
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    'e9ff15be73584489ca4a66f64d32c4537711797e30b6660dbcb71ea72a42b1f4', // Exodus
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // SafePal
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18'  // Zerion
];

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
            featuredWalletIds,
            allWallets: 'SHOW', // Ensure all wallets are shown
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
