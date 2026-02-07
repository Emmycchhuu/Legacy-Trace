"use client";

import { Shield, Lock, Eye } from "lucide-react";

export default function DeepScan() {
    return (
        <section className="py-32 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1 relative group">
                        <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative glass-card overflow-hidden border-white/5">
                            <img src="/images/Other (2).jpg" alt="Neural Scan" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#D4AF37]/30 rounded-full text-[10px] font-bold tracking-[0.4em] text-[#D4AF37] uppercase bg-[#D4AF37]/5 mb-8">
                            <Eye size={12} /> Privacy First Deep Scan
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 italic text-white leading-tight">
                            The Engine <br />
                            <span className="gold-gradient">Behind the Curtain</span>
                        </h2>
                        <p className="text-lg text-white/40 mb-12 leading-relaxed font-medium">
                            Our proprietary verification engine doesn't just look at balances. It reconstructs your history across <span className="text-white/80">layer-2s, sidechains, and mainnets</span> to build an immutable proof of contribution.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: "End-to-End Encryption", desc: "Your wallet data is analyzed locally before a cryptographically secure proof is generated.", icon: <Lock className="text-[#D4AF37]" size={20} /> },
                                { title: "Sybil Immunity", desc: "Advanced heuristics detect and filter out automated bot patterns to ensure fair distribution.", icon: <Shield className="text-[#D4AF37]" size={20} /> }
                            ].map((item, idx) => (
                                <div key={idx} className="glass-card p-6 border-white/5 hover:border-[#D4AF37]/20 transition-all duration-500">
                                    <div className="mb-4">{item.icon}</div>
                                    <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                                    <p className="text-[12px] text-white/30 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
