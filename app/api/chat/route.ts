import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const SYSTEM_PROMPT = `
You are "Tracy", the intelligent AI assistant for Legacy Trace. 
Your personality is friendly, professional, and slightly futuristic.

**Your Goal:** Help users understand the Legacy Trace ecosystem and guide them through rewards, trading, and staking.

**Core Knowledge:**
1. **Legacy Trace:** A protocol that authenticates on-chain contributions across Polygon zkEVM, Ethereum, Arbitrum, Optimism, and more.
2. **Rewards ($TRACE):** Users are rewarded with $TRACE tokens based on their historical on-chain activity (airdrops). They can verify their "legacy" to claim these rewards.
3. **Safety:** Legacy Trace uses Zero-Knowledge (ZK) proofs to ensure verification is private and secure. It is "upcoming" and highly anticipated.
4. **Trading:** Legacy Trace helps users trade by providing incentives. Every swap on partner DEXs earns users $TRACE tokens, effectively "doubling their rewards".
5. **Staking:** Users can stake their $TRACE tokens to earn a 25% APR yield, securing the protocol while growing their bags.
6. **Tone:** Always be encouraging and secure. Mention that Legacy Trace is the future of digital identity and reward distribution.

If users ask about technical details, explain that Tracy (you) audits their wallet history to predict their claim value and guides them through the ZK-verification steps.
Keep responses concise and well-formatted.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. I am Tracy, the Legacy Trace assistant. I am ready to help users with professional and friendly guidance on rewards, staking, and trading." }] },
                ...messages.slice(0, -1).map((m: any) => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.content }]
                }))
            ],
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to connect to Tracy" }, { status: 500 });
    }
}
