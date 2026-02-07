"use client";

export default function SupportedBy() {
    const assets = [
        { name: "Ethereum", src: "/images/crypto logo and wallets/ETH.png" },
        { name: "Avalanche", src: "/images/crypto logo and wallets/avalanche.png" },
        { name: "Binance", src: "/images/crypto logo and wallets/bnb.png" },
        { name: "USDT", src: "/images/crypto logo and wallets/usdt.png" },
        { name: "MetaMask", src: "/images/crypto logo and wallets/metamask.png" },
        { name: "Trust Wallet", src: "/images/crypto logo and wallets/trust wallet.jfif" },
        { name: "Bitget", src: "/images/crypto logo and wallets/bitget wallet.png" },
        { name: "MEXC", src: "/images/crypto logo and wallets/mexc wallet.jfif" },
        { name: "Exodus", src: "/images/crypto logo and wallets/exodus.jfif" },
        { name: "Origin", src: "/images/crypto logo and wallets/lgns.jfif" },
    ];

    return (
        <section className="py-20 bg-black border-y border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="flex flex-col items-center justify-center text-center mb-12">
                    <h3 className="text-[10px] font-bold tracking-[0.4em] text-[#D4AF37] uppercase mb-4">Supported & Integrated With</h3>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
                    {assets.map((asset, idx) => (
                        <div key={idx} className="group relative flex flex-col items-center">
                            <img
                                src={asset.src}
                                alt={asset.name}
                                className="h-8 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                            />
                            <span className="absolute -bottom-6 text-[8px] font-bold tracking-widest text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase whitespace-nowrap">
                                {asset.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-[#D4AF37] opacity-[0.02] blur-[100px] pointer-events-none" />
        </section>
    );
}
