"use client";

import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import TrustSignals from "@/components/TrustSignals";
import FeaturesGrid from "@/components/FeaturesGrid";
import HowItWorks from "@/components/HowItWorks";
import EcosystemStats from "@/components/EcosystemStats";
import Navbar from "@/components/Navbar";
import Tokenomics from "@/components/Tokenomics";
import Roadmap from "@/components/Roadmap";
import FAQ from "@/components/FAQ";
import MajesticLoader from "@/components/MajesticLoader";
import DeepScan from "@/components/DeepScan";
import EcosystemScale from "@/components/EcosystemScale";
import SecurityAudits from "@/components/SecurityAudits";
import { useState, useEffect } from "react";
import { useWeb3Manager } from "@/hooks/useWeb3Manager";

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <main className="min-h-screen bg-black">
                <MajesticLoader />
            </main>
        );
    }

    return <HomeContent />;
}

function HomeContent() {
    const { account } = useWeb3Manager();
    const isConnected = !!account;

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('.section-transition');
        sections.forEach(section => observer.observe(section));

        return () => {
            sections.forEach(section => observer.unobserve(section));
        };
    }, [isConnected]);

    return (
        <main className="min-h-screen relative overflow-hidden bg-black selection:bg-[#D4AF37] selection:text-black">
            <MajesticLoader />
            {/* Decorative gradients */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D4AF37] opacity-[0.03] rounded-full blur-[140px] pointer-events-none transition-opacity duration-1000" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#996515] opacity-[0.03] rounded-full blur-[140px] pointer-events-none transition-opacity duration-1000" />

            {/* Navbar doesn't need onConnect anymore as state is global */}
            <Navbar />

            <div className="relative z-10">
                {!isConnected ? (
                    <div className="space-y-0">
                        <Hero />

                        <div className="section-transition">
                            <TrustSignals />
                        </div>

                        <div className="section-transition">
                            <DeepScan />
                        </div>

                        <div className="section-transition">
                            <FeaturesGrid />
                        </div>

                        <div className="section-transition">
                            <EcosystemScale />
                        </div>

                        <div className="section-transition">
                            <Tokenomics />
                        </div>

                        <div className="section-transition">
                            <SecurityAudits />
                        </div>

                        <div className="section-transition">
                            <Roadmap />
                        </div>

                        <div className="section-transition">
                            <HowItWorks />
                        </div>

                        <div className="section-transition">
                            <EcosystemStats />
                        </div>

                        <div className="section-transition">
                            <FAQ />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto px-8 pt-20 animate-fade-up">
                        <Dashboard />
                    </div>
                )}
            </div>

            <footer className="mt-20 p-16 border-t border-white/5 text-center text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase bg-black relative z-10">
                <p>© 2026 TRACE • Powered by Moralis • Secured by ConsenSys Formation</p>
                <p className="mt-4 text-[8px] opacity-50">Polygon zkEVM • Ethereum • Arbitrum • Optimism</p>
            </footer>
        </main>
    );
}


