"use client";

import { useEffect, useState } from "react";

export default function MajesticLoader() {
    const [loading, setLoading] = useState(true);
    const [textIndex, setTextIndex] = useState(0);
    const messages = ["INITIALIZING", "AUTHENTICATING", "TRACING LEGACY", "READY"];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
        }, 800);

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <div className="relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-[#D4AF37] opacity-20 blur-[100px] animate-pulse rounded-full" />

                <div className="relative flex flex-col items-center">
                    <div className="text-[10px] font-bold tracking-[0.8em] text-[#D4AF37] mb-8 animate-pulse uppercase">
                        Protocol Session v2.0
                    </div>

                    <div className="h-20 flex items-center justify-center">
                        <div key={textIndex} className="text-3xl md:text-5xl font-bold tracking-[0.2em] text-white italic animate-fade-up">
                            {messages[textIndex]}
                        </div>
                    </div>

                    <div className="w-64 h-[1px] bg-white/5 mt-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-[#D4AF37]/50 w-full animate-[loading_3.5s_ease-in-out_forwards]" />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
