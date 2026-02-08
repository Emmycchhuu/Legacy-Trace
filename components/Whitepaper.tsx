"use client";

import { X, FileText, Download, ExternalLink, ShieldCheck, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Whitepaper({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border-[#D4AF37]/20 shadow-[0_0_100px_rgba(212,175,55,0.2)]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                            <FileText className="text-[#D4AF37]" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold tracking-tight italic">Trace Legacy White Paper</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Version 1.0 • February 2026</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all">
                            <Download size={14} /> Download PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">

                    {/* Intro Section */}
                    <div className="max-w-3xl">
                        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em] mb-6">Executive Summary</h4>
                        <p className="text-xl text-white font-light leading-relaxed italic mb-8 border-l-2 border-[#D4AF37] pl-8">
                            "In a world where every on-chain action leaves a permanent mark, most users are silently building legacies they never get rewarded for. Trace Legacy changes that forever."
                        </p>
                        <p className="text-white/60 leading-relaxed">
                            We are the first platform that turns your entire on-chain history into real, immediate value. Connect your wallet once. Let <span className="text-[#D4AF37] font-bold">Tracy — our intelligent AI Agent</span> — scan, optimize, stake, unstake, claim, and compound your assets across Polygon DeFi.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Supply", val: "1B $TRACE" },
                            { label: "Genesis Allocation", val: "20% (200M)" },
                            { label: "Campaign Duration", val: "12 Weeks" },
                            { label: "Launch Status", val: "Fair Launch" }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold mb-1">{stat.label}</p>
                                <p className="text-sm font-bold text-white tracking-tight">{stat.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reward Formula Card */}
                    <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 p-8 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck size={120} />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-3 italic">
                            The URP Formula
                        </h4>
                        <div className="text-2xl md:text-3xl font-mono font-bold gold-gradient tracking-tighter mb-8 bg-black/40 p-6 rounded-2xl border border-white/5 text-center">
                            URP = BaseHold + ActivityBonus + LoyaltyMultiplier
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                            <div className="space-y-3">
                                <p className="font-bold text-white uppercase tracking-widest text-[10px] text-[#D4AF37]">BaseHold</p>
                                <p className="text-white/50 leading-relaxed">Σ (Balance × Token Weight × Days Held). Boosts: MATIC (1.2x), AAVE/LGNS (1.5x).</p>
                            </div>
                            <div className="space-y-3">
                                <p className="font-bold text-white uppercase tracking-widest text-[10px] text-[#D4AF37]">ActivityBonus</p>
                                <p className="text-white/50 leading-relaxed">0.5 points for every swap, stake, or claim performed in the last 90 days.</p>
                            </div>
                            <div className="space-y-3">
                                <p className="font-bold text-white uppercase tracking-widest text-[10px] text-[#D4AF37]">LoyaltyMultiplier</p>
                                <p className="text-white/50 leading-relaxed">Up to 1.3x boost for users with 2+ years of consistent on-chain activity.</p>
                            </div>
                        </div>
                    </div>

                    {/* Step by Step */}
                    <div className="space-y-8">
                        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em]">The Operational Flow</h4>
                        <div className="space-y-4">
                            {[
                                "Trace scans your entire on-chain history (past 24 months)",
                                "Tracy identifies eligible positions and prepares optimized strategy",
                                "One-click approval for Tracy to execute stake/claim loops",
                                "Receive $TRACE rewards automatically every 72 hours"
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                    <span className="text-2xl font-bold font-mono text-white/10">{i + 1}</span>
                                    <p className="text-white/60 text-sm font-medium">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roadmap & Team */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                        <div className="space-y-6">
                            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em]">2026 Roadmap</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-bold text-[#D4AF37] mt-1">Q1</span>
                                    <p className="text-sm text-white/50">Genesis Campaign & Tracy v1 Beta Launch (Live Now)</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-bold text-white/20 mt-1">Q2</span>
                                    <p className="text-sm text-white/50">TGE + Tier 1 CEX Listings & DAO Governance</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-bold text-white/20 mt-1">Q3</span>
                                    <p className="text-sm text-white/50">Cross-chain AI strategy suggestions & Legacy Badges</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em]">Audit & Security</h4>
                            <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldCheck className="text-green-500" size={18} />
                                    <span className="text-sm font-bold text-white italic">Verified Security</span>
                                </div>
                                <p className="text-xs text-white/40 leading-relaxed mb-6">All contracts audited by ConsenSys Formation. Logic is 100% transparent and on-chain verifiable.</p>
                                <button className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest hover:gap-4 transition-all">
                                    View Audit Reports <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer CTA */}
                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/images/Tracy Pfp.jpg" className="w-12 h-12 rounded-full border border-[#D4AF37]/30" />
                        <div>
                            <p className="text-xs font-bold text-white italic">Questions about the docs?</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Ask Tracy, your AI Agent.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="gold-button px-10 py-4 rounded-xl font-bold tracking-[0.2em] text-[10px] uppercase text-black">
                        Start Mining Legacy
                    </button>
                </div>
            </div>
        </div>
    );
}
