"use client";

import { Network, Zap, Cpu } from "lucide-react";

export default function EcosystemScale() {
    return (
        <section className="py-32 bg-white/[0.01] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#D4AF37]/30 rounded-full text-[10px] font-bold tracking-[0.5em] text-[#D4AF37] uppercase bg-[#D4AF37]/5 mb-8">
                            <Network size={12} /> Global Scalability
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 italic text-white leading-tight">
                            Expansion Without <br />
                            <span className="gold-gradient">Boundaries</span>
                        </h2>
                        <p className="text-lg text-white/40 mb-12 leading-relaxed font-medium">
                            Join over <span className="text-white/80">12,000 verified pioneers</span> building the next generation of decentralized finance. TRACE is more than a token; it's a standard for on-chain identity.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: "High-Frequency Analysis", desc: "Processing over 4.2M transactions per hour with 99.9% accuracy across all nodes.", icon: <Zap className="text-[#D4AF37]" size={18} /> },
                                { title: "Modular Architecture", desc: "Designed for rapid deployment on new L2 solutions as they emerge in the ecosystem.", icon: <Cpu className="text-[#D4AF37]" size={18} /> }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl glass-card border-white/5 flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all duration-500">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-[12px] text-white/30 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative glass-card overflow-hidden border-white/5 aspect-[4/3]">
                            <img src="/images/Other (3).jpg" alt="Ecosystem Growth" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
