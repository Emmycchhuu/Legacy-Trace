"use client";

import { Flame, Zap, Database, Cpu, Share2 } from "lucide-react";

export default function ProtocolGauge() {
    return (
        <div className="w-full max-w-sm animate-fade-up delay-500">
            <div className="glass-card p-6 border-[#D4AF37]/30 relative overflow-hidden group backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                {/* Internal Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]" />
                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white/90">
                                Engine Load
                            </h3>
                        </div>
                        <p className="text-[9px] font-mono text-[#D4AF37]/60 tracking-wider">PROTOCOL HEATING ANALYSIS</p>
                    </div>
                    <Flame size={20} className="text-[#D4AF37] animate-pulse" />
                </div>

                <div className="space-y-5 relative z-10">
                    {[
                        { label: "UNISWAP V3", value: 85, icon: Share2, color: "#ff007a" },
                        { label: "AAVE REWARDS", value: 68, icon: Database, color: "#2ebac6" },
                        { label: "POLYGON NETWORK", value: 94, icon: Zap, color: "#8247e5" },
                        { label: "OPTIMISM L2", value: 41, icon: Cpu, color: "#ff0420" },
                    ].map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-mono font-bold tracking-widest">
                                <span className="flex items-center gap-1.5 text-white/40 group-hover:text-white/70 transition-colors">
                                    <item.icon size={10} /> {item.label}
                                </span>
                                <span className="text-[#D4AF37] shadow-sm">{item.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-[#D4AF37] opacity-80"
                                    style={{
                                        width: `${item.value}%`,
                                        transition: "width 2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                        filter: "drop-shadow(0 0 4px #D4AF37)"
                                    }}
                                />
                                {/* Shimmer Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Stats */}
                <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Network Status</span>
                        <span className="text-[10px] text-green-500 font-mono font-bold flex items-center gap-1">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" /> OPERATIONAL
                        </span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Node Priority</span>
                        <span className="text-[10px] text-[#D4AF37] font-mono font-bold">LEGACY-01</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
