"use client";

import { PieChart, Wallet, Lock, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function Tokenomics() {
    const [count, setCount] = useState(0);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const end = 100;
                const duration = 1500;
                const step = (timestamp: number) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    setCount(progress * end);
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const distribution = [
        { label: "Genesis Campaign", value: "20%", amount: "200M", color: "bg-[#D4AF37]", icon: <Users size={16} /> },
        { label: "Liquidity & Ecosystem", value: "25%", amount: "250M", color: "bg-[#996515]", icon: <PieChart size={16} /> },
        { label: "Team & Advisors", value: "15%", amount: "150M", color: "bg-white/30", icon: <Lock size={16} /> },
        { label: "Community Treasury", value: "20%", amount: "200M", color: "bg-white/20", icon: <Users size={16} /> },
        { label: "Partners & Growth", value: "20%", amount: "200M", color: "bg-white/10", icon: <Wallet size={16} /> },
    ];

    return (
        <section id="tokenomics" ref={sectionRef} className="py-32 border-t border-white/5 bg-black relative">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 italic gold-gradient">Tokenomics</h2>
                        <p className="text-lg text-white/50 mb-12 leading-relaxed font-medium">
                            $TRACE is designed as a fair-launch utility token on the <span className="text-white">Polygon zkEVM</span> network.
                            The supply is strictly capped at <span className="text-[#D4AF37]">1,000,000,000</span> tokens, secured by <span className="text-white">Zero-Knowledge proofs</span>.
                        </p>

                        <div className="space-y-6">
                            {distribution.map((item, idx) => (
                                <div key={idx} className="group cursor-default">
                                    <div className="flex items-center justify-between mb-2 text-sm font-bold tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">
                                        <span className="flex items-center gap-3">
                                            {item.icon} {item.label}
                                        </span>
                                        <span className="text-[#D4AF37]">{item.value}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} w-0 group-hover:w-full transition-all duration-1000 ease-out`} style={{ width: item.value }} />
                                    </div>
                                    <p className="text-[10px] text-white/20 mt-1 font-mono">{item.amount} $TRACE</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 md:p-12 border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#D4AF37] opacity-[0.05] rounded-full blur-[100px] group-hover:opacity-[0.1] transition-opacity duration-1000" />

                        <p className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold mb-4">Total Supply</p>
                        <div className="text-6xl md:text-8xl font-bold text-shimmer tracking-tighter mb-4 tabular-nums">
                            {count < 100 ? (count / 10).toFixed(1) + "B" : "1B"}
                        </div>
                        <div className="text-[#D4AF37] font-bold text-xl italic tracking-widest flex items-center gap-2 mb-8">
                            TRACE <span className="text-white/20 not-italic tracking-normal text-sm font-mono">$TRACE</span>
                        </div>

                        {/* Official Contract Address */}
                        <div className="w-full space-y-3 pt-6 border-t border-white/5">
                            <p className="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase">Official Contract Address</p>
                            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3 hover:border-[#D4AF37]/30 transition-all cursor-pointer group/copy" onClick={() => {
                                navigator.clipboard.writeText("0x25dC7c859B3C58A89AAb88916Fb0a6e215a1A926");
                                alert("Contract address copied!");
                            }}>
                                <span className="text-[10px] md:text-xs font-mono text-white/60 truncate group-hover/copy:text-white transition-colors">
                                    0x25dC7c859B3C58A89AAb88916Fb0a6e215a1A926
                                </span>
                                <PieChart size={14} className="text-[#D4AF37]/40 group-hover/copy:text-[#D4AF37] transition-colors flex-shrink-0" />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-[#D4AF37]/20 transition-all duration-500">
                                <p className="text-[10px] uppercase text-white/30 font-bold mb-1 tracking-widest">Network</p>
                                <p className="text-lg font-bold text-white/90">zkEVM</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-[#D4AF37]/20 transition-all duration-500">
                                <p className="text-[10px] uppercase text-white/30 font-bold mb-1 tracking-widest">Format</p>
                                <p className="text-lg font-bold text-white/90">ERC-20</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
