"use client";

import { useState, useEffect } from "react";
import ConnectButton from "./ConnectButton";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

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

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-black/80 backdrop-blur-xl border-white/10 py-4" : "bg-transparent border-transparent py-8"
            }`}>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    {/* Logo Image */}
                    <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
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

                <div className="hidden md:flex items-center gap-8">
                    {["Features", "Tokenomics", "Roadmap", "FAQ"].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            className="text-sm font-medium text-white/60 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div>
                    <ConnectButton />
                </div>
            </div>
        </nav>
    );
}
