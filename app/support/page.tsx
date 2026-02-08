"use client";

import { Send, MessageSquare, Headphones, Globe, ArrowLeft, Twitter, Send as TelegramIcon } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

const supports = [
    { title: "Technical Dev Support", handle: "@Traceydev", icon: <MessageSquare size={24} className="text-[#D4AF37]" />, desc: "Expert help with wallet scanning and protocol optimization." },
    { title: "Ecosystem Support", handle: "@LegacyTracy", icon: <Headphones size={24} className="text-[#D4AF37]" />, desc: "Questions about rewards, staking, and claiming $TRACE." },
];

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 max-w-5xl mx-auto px-8">
                {/* Header Section */}
                <div className="mb-20 animate-fade-up">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] hover:gap-4 transition-all mb-12 group">
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>

                    <h1 className="text-5xl md:text-7xl font-bold italic gold-gradient mb-6">Support Hub</h1>
                    <p className="text-white/40 max-w-lg leading-relaxed font-medium">
                        Need assistance with Tracy? Our specialized dev and ecosystem teams are available 24/7 on Telegram to guide your legacy mining journey.
                    </p>
                </div>

                {/* Primary Channels Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 animate-fade-up delay-100">

                    {/* Official Telegram Channel */}
                    <a
                        href="https://t.me/Legacytrace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-10 border-white/5 hover:border-[#D4AF37]/30 group transition-all relative overflow-hidden flex flex-col items-center text-center"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Send size={150} />
                        </div>
                        <div className="w-20 h-20 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 mb-8 group-hover:scale-110 transition-transform">
                            <TelegramIcon size={40} className="text-[#D4AF37]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Official Community</h3>
                        <p className="text-white/40 text-sm mb-10 max-w-xs">Join thousands of legacy miners. Get the latest snapshots and campaign news.</p>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2">
                            t.me/Legacytrace <Send size={12} />
                        </span>
                    </a>

                    {/* Support Agents */}
                    <div className="space-y-6">
                        {supports.map((support, idx) => (
                            <div key={idx} className="glass-card p-8 border-white/5 hover:border-[#D4AF37]/30 transition-all flex items-center gap-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:bg-[#D4AF37]/5 transition-all">
                                    {support.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg mb-1">{support.title}</h4>
                                    <p className="text-xs text-white/30 mb-4 leading-relaxed">{support.desc}</p>
                                    <a
                                        href={`https://t.me/${support.handle.replace('@', '')}`}
                                        target="_blank"
                                        className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:underline"
                                    >
                                        Message {support.handle}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* FAQ Quick Link */}
                <div className="glass-card p-12 border-[#D4AF37]/10 bg-gradient-to-br from-[#D4AF37]/5 to-transparent text-center animate-fade-up delay-200">
                    <div className="max-w-xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-4 italic">Self-Service Help Center</h3>
                        <p className="text-white/40 mb-10">Check our frequently asked questions for immediate answers on staking mechanics and URP calculations.</p>
                        <Link href="/#faq" className="gold-button px-12 py-5 rounded-2xl font-bold tracking-[0.2em] text-[12px] uppercase text-black">
                            View Detailed FAQ
                        </Link>
                    </div>
                </div>

            </div>

            <footer className="py-20 border-t border-white/5 text-center text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase">
                Polygon zkEVM • Ethereum • Arbitrum • Optimism
            </footer>
        </main>
    );
}
