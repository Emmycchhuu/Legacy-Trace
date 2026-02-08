"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const checklist = [
        {
            q: "How is the TRACE Score calculated?",
            a: "The TRACE Score is a composite metric derived from your wallet age, transaction volume, protocol diversity, and consistency across 15+ EVM chains. Our algorithm specifically filters out low-quality spam transactions."
        },
        {
            q: "Which networks are supported for claiming?",
            a: "$TRACE is a native token on the Polygon zkEVM network. You can claim using any EVM-compatible wallet (MetaMask, Rainbow, Coinbase Wallet) by verifying your on-chain footprint via ZK-proofs."
        },
        {
            q: "Is there a deadline to claim my allocation?",
            a: "Yes. The initial Season 1 Claim window is open for 30 days. Unclaimed tokens will be returned to the Community DAO Treasury for future rewards formatting."
        },
        {
            q: "Is my wallet safe?",
            a: "Absolutely. The Tracy AI Agent only requests permissions for specific protocol interactions (Staking, Rewards) via standard ERC20 approvals. We never ask for your private keys or seed phrase. The protocol is audited by ConsenSys Diligence."
        }
    ];

    return (
        <section id="faq" className="py-32 bg-white/[0.02] border-t border-white/5">
            <div className="max-w-4xl mx-auto px-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center italic gold-gradient">Frequently Asked Questions</h2>

                <div className="space-y-4">
                    {checklist.map((item, idx) => (
                        <div key={idx} className="glass-card border-white/5 overflow-hidden transition-all duration-500 hover:border-[#D4AF37]/20 group">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-8 text-left hover:bg-white/[0.03] transition-all duration-300"
                            >
                                <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${openIndex === idx ? 'text-[#D4AF37]' : 'text-white/80 group-hover:text-white'}`}>
                                    {item.q}
                                </span>
                                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${openIndex === idx ? 'bg-[#D4AF37] border-[#D4AF37] rotate-180' : 'bg-transparent'}`}>
                                    {openIndex === idx ? <ChevronUp size={16} className="text-black" /> : <ChevronDown size={16} className="text-white/40" />}
                                </div>
                            </button>

                            <div className={`transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-8 pt-0 text-white/50 leading-relaxed font-medium text-lg border-t border-white/5 mt-2">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
