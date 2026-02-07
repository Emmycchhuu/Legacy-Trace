"use client";

import { TrendingUp, Coins, Gift, Zap } from "lucide-react";

export default function Incentives() {
    const incentives = [
        {
            title: "Dynamic Staking",
            description: "Lock your $TRACE to secure the protocol and earn up to 25% APR. Rewards are distributed in real-time based on network volume.",
            icon: <Coins className="w-8 h-8 text-[#D4AF37]" />,
            benefit: "25% Fixed APR"
        },
        {
            title: "Trade-to-Earn",
            description: "Help provide liquidity or trade on our partner DEXs. Every swap earns you $TRACE rewards, effectively doubling your market gains.",
            icon: <TrendingUp className="w-8 h-8 text-[#D4AF37]" />,
            benefit: "2x Reward Multiplier"
        },
        {
            title: "Referral Engine",
            description: "Invite others to verify their legacy. Earn 10% of their claim value instantly in $TRACE directly to your wallet.",
            icon: <Gift className="w-8 h-8 text-[#D4AF37]" />,
            benefit: "10% Instant Bonus"
        },
        {
            title: "Loyalty Boost",
            description: "Long-term holders get access to exclusive NFT drops and early access to the Legacy Trace mobile beta.",
            icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
            benefit: "VIP Access"
        }
    ];

    return (
        <section id="incentives" className="py-32 bg-black relative">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                        <h2 className="text-[10px] font-bold tracking-[0.4em] text-[#D4AF37] uppercase mb-4">Ecosystem Incentives</h2>
                        <h3 className="text-4xl md:text-5xl font-bold italic gold-gradient leading-tight">
                            More Than Just a Claim. <br /> A Growth Engine.
                        </h3>
                    </div>
                    <p className="text-white/40 max-w-sm font-medium text-sm leading-relaxed">
                        We don't just reward your past. We fuel your future. Participate in the Legacy ecosystem and maximize your $TRACE yield.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {incentives.map((item, idx) => (
                        <div key={idx} className="glass-card p-10 border-white/5 hover:border-[#D4AF37]/30 flex flex-col md:flex-row items-start gap-8 group">
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/40 transition-all duration-500 shadow-xl">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">{item.title}</h4>
                                    <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                                        {item.benefit}
                                    </span>
                                </div>
                                <p className="text-sm text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background decorative element */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-[#D4AF37] opacity-[0.02] blur-[150px] rounded-full pointer-events-none" />
        </section>
    );
}
