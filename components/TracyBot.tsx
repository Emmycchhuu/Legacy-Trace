"use client";

import { MessageSquare, Zap, Cpu, Bot } from "lucide-react";

export default function TracyBot({ onOpenChat }: { onOpenChat: () => void }) {
    return (
        <section id="tracy" className="py-32 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Visual: Tracy AI Showcase */}
                    <div className="relative group flex justify-center lg:justify-start">
                        <div className="relative w-full max-w-lg aspect-auto overflow-hidden rounded-[32px] glass-card border-[#D4AF37]/30 shadow-[0_0_80px_rgba(212,175,55,0.1)]">
                            <img
                                src="/images/Tracy Showcase.jpg"
                                alt="Tracy Showcase"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />

                            {/* Floating Stats Tags */}
                            <div className="absolute top-6 right-6 glass-card py-2 px-4 border-[#D4AF37]/20 animate-fade-up">
                                <span className="text-[8px] font-bold tracking-widest uppercase text-[#D4AF37]">Neural Core Active</span>
                            </div>
                            <div className="absolute bottom-6 left-6 glass-card py-2 px-4 border-white/10 animate-fade-up delay-300 backdrop-blur-md">
                                <span className="text-[8px] font-bold tracking-widest uppercase text-white/40">Latency: 14ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Content: Introducing Tracy */}
                    <div className="flex flex-col items-start">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                            <Cpu size={12} className="text-[#D4AF37]" />
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">AI Assistant</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold italic gold-gradient mb-8 leading-tight">
                            Meet Tracy. <br /> Your Intelligent Protocol Guide.
                        </h2>

                        <p className="text-lg text-white/50 mb-10 leading-relaxed font-medium">
                            Tracy isn't just a bot—she's the brain of the Legacy Trace ecosystem. Designed to help you navigate, audit, and maximize your on-chain verification process.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                                <MessageSquare className="w-5 h-5 text-[#D4AF37] mb-4" />
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Smart Audit</h4>
                                <p className="text-xs text-white/30 leading-relaxed">Tracy can instantly audit your wallet history to predict your $TRACE claim value.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                                <Zap className="w-5 h-5 text-[#D4AF37] mb-4" />
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Fast-Track</h4>
                                <p className="text-xs text-white/30 leading-relaxed">Let Tracy guide you through the ZK-verification steps for a 100% success rate.</p>
                            </div>
                        </div>

                        <button
                            onClick={onOpenChat}
                            className="gold-button px-10 py-5 rounded-2xl font-bold tracking-[0.2em] text-[12px] uppercase text-black shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
                        >
                            <Bot size={18} /> Chat with Tracy
                        </button>
                    </div>

                </div>
            </div>

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.03)_0%,transparent_50%)] pointer-events-none" />
        </section>
    );
}
