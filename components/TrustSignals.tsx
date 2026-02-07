"use client";

export default function TrustSignals() {
    const partners = ["Moralis", "Polygon", "ConsenSys", "Arbitrum", "Optimism"];

    return (
        <section className="py-20 border-y border-white/5 bg-white/[0.01]">
            <div className="max-w-7xl mx-auto px-8">
                <p className="text-center text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-12">
                    Trusted Infrastructure & Ecosystem Partners
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                    {['POLYGON', 'ETHEREUM', 'ARBITRUM', 'OPTIMISM', 'BASE', 'BINANCE'].map((brand) => (
                        <span key={brand} className="text-xs font-bold tracking-[0.5em] text-white hover:text-[#D4AF37] transition-colors cursor-default text-shimmer">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
