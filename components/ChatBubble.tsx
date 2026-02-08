"use client";

import { MessageSquare, Bot } from "lucide-react";

export default function ChatBubble({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
    if (isOpen) return null;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 z-[90] w-16 h-16 rounded-full bg-[#D4AF37] text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group border-2 border-black animate-in fade-in slide-in-from-bottom-10"
        >
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20 pointer-events-none" />

            <Bot size={28} className="group-hover:hidden" />
            <MessageSquare size={28} className="hidden group-hover:block" />

            {/* Notification Dot */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-[10px] font-bold text-white leading-none">1</span>
            </div>
        </button>
    );
}
