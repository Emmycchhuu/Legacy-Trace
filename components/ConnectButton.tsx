"use client";

import { useWeb3Manager } from "@/hooks/useWeb3Manager";
import { LogOut, Wallet } from "lucide-react";
import { useWeb3Modal } from '@web3modal/ethers/react';
import { useState, useEffect } from "react";

export default function ConnectButton() {
    const { account, disconnect } = useWeb3Manager();
    const { open } = useWeb3Modal();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (account) {
        return (
            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-[#D4AF37] font-bold">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => disconnect()}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                    title="Disconnect"
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    const handleConnect = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🖱️ [ConnectButton] Click detected!");

        const globalModal = (window as any).W3M_MODAL;

        try {
            if (globalModal) {
                console.log("📡 [ConnectButton] Using Global Modal Instance...");
                await globalModal.open();
            } else {
                console.log("🪝 [ConnectButton] Using Hook Open...");
                await open();
            }
            console.log("✅ [ConnectButton] Modal Open Call Completed");
        } catch (err) {
            console.error("❌ [ConnectButton] Modal Open failed:", err);
            // Last ditch effort
            try { await open(); } catch (e) { }
        }
    };

    if (!mounted) return null;

    return (
        <button
            type="button"
            onClick={handleConnect}
            className="gold-button px-6 py-2.5 rounded-xl font-bold text-sm text-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 relative z-[99999]"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
            <Wallet size={16} />
            Connect Wallet
        </button>
    );
}
