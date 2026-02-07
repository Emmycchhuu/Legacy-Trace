"use client";

import ConnectButton from "./ConnectButton";
import { Timer, Shield, Activity, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
    const [timeLeft, setTimeLeft] = useState({ days: 89, hours: 23, minutes: 59, seconds: 59 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59, hours: prev.hours, days: prev.days };
                // simplified for mock, real app would use a target date
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden min-h-screen flex items-center bg-black">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 bg-[url('/images/Other.jpg')] opacity-[0.03] bg-cover bg-center mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">

                {/* Left Content: The Majestic Pitch */}
                <div className="text-left flex flex-col items-start order-2 lg:order-1">
                    <div className="animate-fade-up inline-flex items-center gap-2 px-6 py-2 mb-10 border border-[#D4AF37]/20 rounded-full text-[10px] font-bold tracking-[0.5em] text-[#D4AF37] uppercase bg-[#D4AF37]/5 backdrop-blur-md">
                        <Activity size={12} className="animate-pulse" />
                        Legacy Verification Protocol
                    </div>

                    <h1 className="reveal-text text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white">
                        THE FUTURE OF <br />
                        <span className="gold-gradient italic text-shimmer tracking-wider uppercase">Legacy Trace</span>
                    </h1>

                    <p className="animate-fade-up delay-100 text-base md:text-lg text-white/40 mb-10 leading-relaxed font-medium max-w-lg">
                        Your on-chain fingerprint is a digital asset. We authenticate your contributions across the <span className="text-white/80">Polygon zkEVM infrastructure</span> to secure your fair share.
                    </p>

                    {/* Functional Countdown */}
                    <div className="animate-fade-up delay-200 mb-10 w-full max-w-sm">
                        <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-2 text-[#D4AF37]/60 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                                <Timer size={14} /> Claim Phase Starts In
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { label: "D", val: timeLeft.days },
                                    { label: "H", val: timeLeft.hours },
                                    { label: "M", val: timeLeft.minutes },
                                    { label: "S", val: timeLeft.seconds }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className="text-3xl md:text-4xl font-light text-white tabular-nums tracking-tighter">
                                            {String(item.val).padStart(2, '0')}
                                        </div>
                                        <div className="text-[8px] uppercase tracking-[0.2em] text-white/20 mt-2 font-bold font-mono">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="animate-fade-up delay-300 flex items-center gap-8">
                        <ConnectButton />
                        <div className="flex items-center gap-4 py-2 px-6 border-l border-white/5">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white/80 tracking-tight">1,000,000,000</span>
                                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]/60 font-medium">Supply</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Focused Visual */}
                <div className="order-1 lg:order-2 relative flex justify-center">
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Elegant Aura */}
                        <div className="absolute inset-0 bg-[#D4AF37] opacity-[0.05] rounded-full blur-[120px] animate-pulse" />

                        <div className="relative z-10 w-full h-full p-4 overflow-hidden flex items-center justify-center">
                            <img
                                src="/images/Hero.jpg"
                                alt="Legacy Mascot"
                                className="relative z-20 w-full h-full object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-all duration-1000"
                            />
                        </div>

                        <div className="absolute -bottom-4 -left-4 glass-card py-3 px-5 border-white/10 flex items-center gap-3 animate-fade-up delay-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">System Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 hover:opacity-50 transition-opacity cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/40 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-[#D4AF37] animate-[scroll_2.5s_ease-in-out_infinite]" />
                </div>
            </div>
        </section>
    );
}

// Add CSS for the scroll indicator and shimmer directly since it's unique
const style = `
@keyframes scroll {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(200%); }
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;
