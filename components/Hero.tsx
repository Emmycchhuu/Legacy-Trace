"use client";

import ConnectButton from "./ConnectButton";
import { Timer, Shield, Activity, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Target: May 8, 2026
        const targetDate = new Date("2026-05-08T00:00:00Z").getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden min-h-screen flex items-center bg-black">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 bg-[url('/images/Other.jpg')] opacity-[0.03] bg-cover bg-center mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center relative z-10">

                {/* Left Content: The Majestic Pitch */}
                <div className="text-left flex flex-col items-start order-2 lg:order-1">
                    <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 mb-6 md:mb-10 border border-[#D4AF37]/20 rounded-full text-[9px] md:text-[10px] font-bold tracking-[0.5em] text-[#D4AF37] uppercase bg-[#D4AF37]/5 backdrop-blur-md">
                        <Activity size={12} className="animate-pulse" />
                        Legacy Verification Protocol
                    </div>

                    <h1 className="reveal-text text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-8 leading-[1.1] text-white">
                        THE FUTURE OF <br className="hidden sm:block" />
                        <span className="gold-gradient italic text-shimmer tracking-wider uppercase">Legacy Trace</span>
                    </h1>

                    <p className="animate-fade-up delay-100 text-[11px] sm:text-sm md:text-lg text-white/40 mb-6 md:mb-10 leading-relaxed font-medium max-w-lg break-words px-1 md:px-0">
                        Your on-chain fingerprint is a digital asset. Let <span className="text-[#D4AF37] font-bold">Tracy AI Agent</span> authenticate your contributions across the <span className="text-white/80">Polygon zkEVM infrastructure</span> to secure your fair share.
                    </p>

                    {/* Functional Countdown */}
                    <div className="animate-fade-up delay-200 mb-8 md:mb-10 w-full max-w-sm">
                        <div className="glass-card p-4 md:p-8 border-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-2 text-[#D4AF37]/60 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase mb-4 md:mb-6">
                                <Timer size={14} /> Genesis Campaign Ending In
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { label: "D", val: timeLeft.days },
                                    { label: "H", val: timeLeft.hours },
                                    { label: "M", val: timeLeft.minutes },
                                    { label: "S", val: timeLeft.seconds }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className="text-xl md:text-4xl font-light text-white tabular-nums tracking-tighter">
                                            {String(item.val).padStart(2, '0')}
                                        </div>
                                        <div className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-white/20 mt-1 md:mt-2 font-bold font-mono">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-6 md:gap-8">
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
                    <div className="relative w-full max-w-[280px] md:max-w-md aspect-square">
                        {/* Elegant Aura - Pulse removed for UI polish */}
                        <div className="absolute inset-0 bg-[#D4AF37] opacity-[0.05] rounded-full blur-[100px]" />

                        <div className="relative z-10 w-full h-full p-4 overflow-hidden flex items-center justify-center">
                            <img
                                src="/images/Hero.jpg"
                                alt="Legacy Mascot"
                                className="relative z-20 w-full h-full object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-all duration-1000"
                            />
                        </div>

                        <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 glass-card py-2 md:py-3 px-4 md:px-5 border-white/10 flex items-center gap-3 animate-fade-up delay-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                            <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/60">System Online</span>
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
