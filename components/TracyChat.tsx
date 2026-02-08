"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "bot";
    content: string;
}

export default function TracyChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hello! I'm Tracy, your Legacy Trace assistant. How can I help you secure your rewards today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages.concat({ role: "user", content: userMsg }).map(m => ({
                        role: m.role === "bot" ? "assistant" : "user",
                        content: m.content
                    }))
                })
            });

            const data = await response.json();
            if (data.text) {
                setMessages(prev => [...prev, { role: "bot", content: data.text }]);
            } else {
                setMessages(prev => [...prev, { role: "bot", content: "I'm having a bit of a connection issue. Can you try again?" }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "bot", content: "Sorry, something went wrong. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border-[#D4AF37]/20 shadow-[0_0_100px_rgba(212,175,55,0.15)]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src="/images/Tracy Pfp.jpg" alt="Tracy" className="w-12 h-12 rounded-full border border-[#D4AF37]/40 object-cover" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold italic gold-gradient tracking-tight">Tracy AI</h3>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Protocol Assistant • Online</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-[#996515]' : 'bg-[#D4AF37]'}`}>
                                    {m.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-black" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed font-medium ${m.role === 'user'
                                        ? 'bg-white/[0.05] border border-white/10 text-white/90 rounded-tr-none'
                                        : 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-white/90 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex gap-3 items-center text-white/20 text-xs font-bold tracking-widest uppercase">
                                <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                                Tracy is thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Tracy about rewards, staking, or safety..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-[#D4AF37]/40 transition-all placeholder:text-white/20 text-white"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 scale-100' : 'bg-white/5 text-white/20 scale-90'
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
