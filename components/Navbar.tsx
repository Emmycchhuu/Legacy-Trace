"use client";

import { useState, useEffect } from "react";
import ConnectButton from "./ConnectButton";
import { Menu, X } from "lucide-react";

export default function Navbar({ onOpenWhitepaper }: { onOpenWhitepaper?: () => void }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const navLinks = [
        { name: "Ecosystem", href: "#ecosystem" },
        { name: "Incentives", href: "#incentives" },
        { name: "White Paper", onClick: onOpenWhitepaper },
        { name: "Tokenomics", href: "#tokenomics" },
        { name: "FAQ", href: "#faq" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-black/80 backdrop-blur-xl border-white/10 py-4" : "bg-transparent border-transparent py-8"
            }`}>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-105 transition-all">
                        <img src="/images/Logo.jpg" alt="Legacy Trace" className="object-cover w-full h-full" />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-bold tracking-tighter gold-gradient italic leading-none">
                            TRACE
                        </span>
                        <span className="text-[9px] md:text-[10px] text-white/40 tracking-[0.3em] uppercase">
                            $TRACE
                        </span>
                    </div>
                </div>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => {
                                if (link.onClick) link.onClick();
                                else if (link.href) scrollToSection(link.href.replace('#', ''));
                            }}
                            className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-[#D4AF37] transition-all hover:tracking-[0.4em]"
                        >
                            {link.name}
                        </button>
                    ))}
                    <ConnectButton />
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 text-white/60 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-3xl border-b border-white/5 transition-all duration-500 overflow-hidden ${isMobileMenuOpen ? "h-screen border-t border-white/5 opacity-100" : "h-0 border-t-0 opacity-0"
                }`}>
                <div className="p-8 flex flex-col gap-8 text-center pt-20">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (link.onClick) link.onClick();
                                else if (link.href) scrollToSection(link.href.replace('#', ''));
                            }}
                            className="text-lg font-bold uppercase tracking-[0.4em] text-white/60 hover:text-[#D4AF37]"
                        >
                            {link.name}
                        </button>
                    ))}
                    <div className="flex justify-center pt-8">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
