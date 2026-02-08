"use client";

import { FileText, Download, ShieldCheck, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

export default function WhitepaperPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 max-w-5xl mx-auto px-8">
                {/* Header Section */}
                <div className="mb-20 animate-fade-up">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] hover:gap-4 transition-all mb-12 group">
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-bold italic gold-gradient mb-6">White Paper</h1>
                            <p className="text-white/40 uppercase tracking-[0.4em] font-bold text-[10px]">Version 1.0 • February 2026</p>
                        </div>
                        <button className="gold-button px-10 py-5 rounded-2xl font-bold tracking-[0.2em] text-[12px] uppercase text-black flex items-center gap-3">
                            <Download size={18} /> Download PDF
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-32">

                    {/* Executive Summary */}
                    <section className="animate-fade-up delay-100">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                            <div className="md:w-1/3">
                                <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#D4AF37] border-l-2 border-[#D4AF37] pl-6 py-2">01 Executive Summary</h2>
                            </div>
                            <div className="md:w-2/3 space-y-8">
                                <p className="text-2xl md:text-3xl font-light italic text-white/90 leading-tight">
                                    "In a world where every on-chain action leaves a permanent mark, most users are silently building legacies they never get rewarded for. Trace Legacy changes that forever."
                                </p>
                                <p className="text-white/50 leading-relaxed text-lg">
                                    We are the first platform that turns your entire on-chain history into real, immediate value. Connect your wallet once. Let Tracy — our intelligent AI companion — scan, optimize, stake, unstake, claim, and compound your assets across Polygon DeFi. While she works, you earn $TRACE tokens for simply existing on-chain.
                                </p>
                                <div className="grid grid-cols-2 gap-4 pt-8">
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <p className="text-[10px] uppercase text-white/30 font-bold mb-2">Total Supply</p>
                                        <p className="text-xl font-bold text-white">1,000,000,000</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <p className="text-[10px] uppercase text-white/30 font-bold mb-2">Genesis Pool</p>
                                        <p className="text-xl font-bold text-white">200M $TRACE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* The Problem & Solution */}
                    <section className="animate-fade-up">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                            <div className="md:w-1/3">
                                <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#D4AF37] border-l-2 border-[#D4AF37] pl-6 py-2">02 The Solution</h2>
                            </div>
                            <div className="md:w-2/3 space-y-12">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Trace Legacy rewards real on-chain legacy.</h3>
                                    <p className="text-white/50 leading-relaxed text-lg">
                                        Every transaction, every hold, every stake you’ve ever done on Polygon is now an asset. Tracy turns that history into automated yield + $TRACE rewards.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all">
                                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">AI Co-Pilot</h4>
                                        <p className="text-sm text-white/40 leading-relaxed">Tracy scans assets like USDT, MATIC, LGNS, and more, auto-staking them into the highest APY vaults without you lifting a finger.</p>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all">
                                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Non-Custodial</h4>
                                        <p className="text-sm text-white/40 leading-relaxed">You always keep custody. Tracy only executes with your approval via gasless meta-transactions wherever possible.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Reward Formula - The Tech */}
                    <section className="animate-fade-up">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                            <div className="md:w-1/3">
                                <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#D4AF37] border-l-2 border-[#D4AF37] pl-6 py-2">03 Reward Formula</h2>
                            </div>
                            <div className="md:w-2/3 space-y-12">
                                <div className="p-1 p-[1px] bg-gradient-to-r from-[#D4AF37]/40 via-transparent to-[#D4AF37]/40 rounded-[40px]">
                                    <div className="bg-black/90 backdrop-blur-xl p-10 md:p-16 rounded-[40px] border border-white/5 text-center">
                                        <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-10">User Reward Points (URP)</p>
                                        <div className="text-3xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-12">
                                            URP = BaseHold + <br className="md:hidden" /> ActivityBonus + <br className="md:hidden" /> LoyaltyMultiplier
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-white/5 pt-12">
                                            <div>
                                                <p className="text-[#D4AF37] font-bold text-[10px] uppercase mb-4 tracking-widest">BaseHold</p>
                                                <p className="text-xs text-white/40 leading-relaxed">Σ (Balance × Token Weight × Days Held). Boosts: MATIC (1.2x), AAVE/LGNS (1.5x).</p>
                                            </div>
                                            <div>
                                                <p className="text-[#D4AF37] font-bold text-[10px] uppercase mb-4 tracking-widest">ActivityBonus</p>
                                                <p className="text-xs text-white/40 leading-relaxed">0.5 points for every swap, stake, or claim in the last 90 days.</p>
                                            </div>
                                            <div>
                                                <p className="text-[#D4AF37] font-bold text-[10px] uppercase mb-4 tracking-widest">LoyaltyMultiplier</p>
                                                <p className="text-xs text-white/40 leading-relaxed">1.3x boost for 2+ years of consistent activity.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-white/40 text-center text-sm italic">"Your $TRACE Reward = (Your URP ÷ Total Network URP) × Weekly Pool"</p>
                            </div>
                        </div>
                    </section>

                    {/* Tokenomics */}
                    <section className="animate-fade-up">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                            <div className="md:w-1/3">
                                <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#D4AF37] border-l-2 border-[#D4AF37] pl-6 py-2">04 Tokenomics</h2>
                            </div>
                            <div className="md:w-2/3">
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: "Genesis Campaign", value: "20%", supply: "200,000,000" },
                                        { label: "Liquidity & Ecosystem", value: "25%", supply: "250,000,000" },
                                        { label: "Community Treasury", value: "20%", supply: "200,000,000" },
                                        { label: "Partnerships & Growth", value: "20%", supply: "200,000,000" },
                                        { label: "Team & Advisors", value: "15%", supply: "150,000,000" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <span className="text-sm font-bold text-white/90">{item.label}</span>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-[#D4AF37] block">{item.value}</span>
                                                <span className="text-[10px] font-mono text-white/20 uppercase">{item.supply} TRACE</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-6 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-between">
                                    <span className="text-xs font-bold text-white tracking-widest uppercase">Fair Launch Status</span>
                                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">100% Guaranteed</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Operational Steps */}
                    <section className="animate-fade-up pb-32">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                            <div className="md:w-1/3">
                                <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#D4AF37] border-l-2 border-[#D4AF37] pl-6 py-2">05 The Roadmap</h2>
                            </div>
                            <div className="md:w-2/3 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 ml-[23px]" />
                                <div className="space-y-16">
                                    {[
                                        { q: "Q1 2026", title: "Beta Live on Polygon", desc: "Genesis Campaign (200M) starts. Tracy v1 live with multi-token support." },
                                        { q: "Q2 2026", title: "TGE & DAO", desc: "Tier 1 CEX listings. Trace DAO launch. Cross-chain expansion." },
                                        { q: "Q3 2026", title: "NFT Legacy Badges", desc: "Visual proof of on-chain history. Institutional-grade vaults live." }
                                    ].map((milestone, idx) => (
                                        <div key={idx} className="relative pl-16">
                                            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center z-10">
                                                <div className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse" />
                                            </div>
                                            <p className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest mb-2">{milestone.q}</p>
                                            <h4 className="text-xl font-bold text-white mb-4">{milestone.title}</h4>
                                            <p className="text-sm text-white/40 leading-relaxed">{milestone.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            <footer className="py-20 border-t border-white/5 bg-black text-center relative z-10">
                <div className="flex flex-col items-center gap-6">
                    <img src="/images/Logo.jpg" className="w-12 h-12 rounded-xl mb-4" />
                    <p className="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase max-w-sm">
                        Turn your on-chain past into your financial future.
                    </p>
                    <Link href="/" className="gold-button px-10 py-5 rounded-2xl font-bold tracking-[0.2em] text-[12px] uppercase text-black mt-8">
                        Join the Legacy
                    </Link>
                </div>
            </footer>
        </main>
    );
}
