"use client";

import { CheckCircle2, Circle } from "lucide-react";

export default function Roadmap() {
    const phases = [
        {
            phase: "Phase 1: Genesis",
            status: "complete",
            items: ["Protocol Design", "Audit & Security", "Community Whitelist Snapshot", "Ecosystem Partnerships"]
        },
        {
            phase: "Phase 2: Distribution",
            status: "current",
            items: ["Legacy Verification Live", "$TRACE Airdrop Claim", "Initial DEX Offering on Polygon zkEVM", "Staking Modules"]
        },
        {
            phase: "Phase 3: Expansion",
            status: "upcoming",
            items: ["Cross-Chain Rewards", "Dao Governance Launch", "Privacy-First ZK Rollup Integration", "Mobile App Beta"]
        }
    ];

    return (
        <section id="roadmap" className="py-32 bg-black relative">
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent lg:hidden" />

            <div className="max-w-7xl mx-auto px-8 relative">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 italic gold-gradient">Strategic Roadmap</h2>
                    <p className="text-white/40 max-w-xl mx-auto font-medium">
                        Our path to decentralization is calculated and phased. We are currently in the Distribution era.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                    {/* Connecting Line for Desktop */}
                    <div className="hidden lg:block absolute top-[28px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -z-10" />

                    {phases.map((phase, idx) => (
                        <div key={idx} className="relative group">
                            <div className="flex items-center gap-4 mb-6 lg:justify-center">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 z-10 bg-black transition-colors duration-500
                                    ${phase.status === 'complete' ? 'border-[#D4AF37] text-[#D4AF37]' :
                                        phase.status === 'current' ? 'border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' :
                                            'border-white/10 text-white/20'}`}>
                                    {phase.status === 'complete' ? <CheckCircle2 size={24} /> :
                                        phase.status === 'current' ? <div className="w-4 h-4 bg-white rounded-full animate-pulse" /> :
                                            <Circle size={24} />}
                                </div>
                                <h3 className="text-xl font-bold lg:absolute lg:top-20 lg:left-0 lg:w-full lg:text-center text-white/90">
                                    {phase.phase}
                                </h3>
                            </div>

                            <div className="lg:mt-24 glass-card p-10 border-white/5 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/5 transition-all duration-700 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-0 group-hover:opacity-[0.05] rounded-full blur-3xl transition-opacity duration-700" />
                                <ul className="space-y-5 relative z-10">
                                    {phase.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 text-sm text-white/40 font-medium group-hover:text-white/80 transition-colors">
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${phase.status === 'upcoming' ? 'bg-white/10 text-white/10' : 'bg-[#D4AF37] text-[#D4AF37]'}`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
