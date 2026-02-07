"use client";

import { ShieldCheck, FileText, Lock } from "lucide-react";

export default function SecurityAudits() {
    return (
        <section className="py-32 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative glass-card overflow-hidden border-white/5 shadow-2xl">
                            <img src="/images/Other (4).jpg" alt="Security Protocol" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent" />
                        </div>
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#D4AF37]/30 rounded-full text-[10px] font-bold tracking-[0.4em] text-[#D4AF37] uppercase bg-[#D4AF37]/5 mb-8">
                            <ShieldCheck size={12} /> Institutional Integrity
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 italic text-white leading-tight">
                            Audited by <br />
                            <span className="gold-gradient">The Best in the World</span>
                        </h2>
                        <p className="text-lg text-white/40 mb-12 leading-relaxed font-medium">
                            Security isn't a feature; it's our foundation. The TRACE protocol has undergone rigorous third-party audits to ensure that your verified legacy is protected by industry-leading smart contract defense.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: "ConsenSys Diligence", date: "Q4 2025", icon: <FileText className="text-[#D4AF37]" size={16} /> },
                                { title: "Runtime Verification", date: "Q1 2026", icon: <Lock className="text-[#D4AF37]" size={16} /> }
                            ].map((item, idx) => (
                                <div key={idx} className="glass-card p-6 border-white/5 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        {item.icon}
                                        <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest">{item.date}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
