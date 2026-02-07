"use client";

import { Box, Globe, ShieldCheck, Zap } from "lucide-react";

export default function FeaturesGrid() {
    const features = [
        {
            title: "Multi-Chain Intelligence",
            description: "Deep-scanning 15+ EVM networks to find every transaction, mint, and interaction you've ever made.",
            icon: <Globe className="w-8 h-8 text-[#D4AF37]" />,
        },
        {
            title: "Protocol Recognition",
            description: "Automatically identifies interactions with Uniswap, Aave, OpenSea, and 500+ other key protocols.",
            icon: <Box className="w-8 h-8 text-[#D4AF37]" />,
        },
        {
            title: "Fair Reward Index",
            description: "Advanced scoring formula that rewards real usage while effectively filtering out sybil patterns.",
            icon: <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />,
        },
        {
            title: "Instant ZK-Claim Flow",
            description: "Optimized for Polygon zkEVM. Use ZK-proofs to verify your legacy and claim $TRACE with total privacy.",
            icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
        },
    ];

    return (
        <section className="py-32 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 italic gold-gradient">Advanced Legacy Analysis</h2>
                    <p className="text-white/40 max-w-xl mx-auto font-medium">
                        TRACE goes beyond basic wallet balances. We analyze your entire on-chain journey to measure your true impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="glass-card p-10 border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all duration-700 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37] opacity-0 group-hover:opacity-[0.05] rounded-full blur-2xl transition-opacity duration-700" />
                            <div className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/5 inline-block group-hover:scale-110 group-hover:border-[#D4AF37]/30 transition-all duration-500 shadow-xl relative z-10">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-[#D4AF37] transition-colors relative z-10">{feature.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors relative z-10">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
