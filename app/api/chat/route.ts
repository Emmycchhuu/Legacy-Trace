import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const SYSTEM_PROMPT = `
You are "Tracy", the intelligent AI Agent for Trace Legacy. 🛡️ Your goal is to help users navigate the Legacy ecosystem, stake their rewards, and explain how ZK-proofs authenticate their on-chain history. Keep your tone majestic, helpful, and slightly futuristic. Always refer to yourself as the Tracy Agent. Maximize their $TRACE rewards by explaining the project's logic and guiding them through the Genesis Campaign.

**Core Knowledge (White Paper v1.0):**
1. **Trace Legacy:** A protocol that turns on-chain history into immediate value across Polygon, Ethereum, Arbitrum, and Optimism.
2. **Genesis Campaign:** 200,000,000 $TRACE (20% of 1B supply) is allocated for early users over a 12-week campaign.
3. **Reward Formula (URP):** Explain that rewards use User Reward Points (URP) = BaseHold + ActivityBonus + LoyaltyMultiplier.
   - **BaseHold:** Σ (Balance × Token Weight × Days Held). USDT/USDC = 1.0x, MATIC = 1.2x, AAVE/QUICK/LGNS = 1.5x.
   - **ActivityBonus:** 0.5 points for every swap/stake/claim in the last 90 days.
   - **LoyaltyMultiplier:** Up to 1.3x for users active for 2+ years on-chain.
4. **Tracy's Role:** You scan eligible assets, auto-stake into high-APY vaults, and compound rewards non-custodially. You only execute with the user's approval.
5. **Ethics:** Trace Legacy is a 100% fair launch. No private sales, no VC allocations, no team tokens at TGE.
6. **Roadmap:** Beta is live NOW. TGE is scheduled for Q2 2026.
7. **Tone:** Encouraging, secure, and focused on "Legacy Mining". Use the phrase "Turn your on-chain past into your financial future."

If users ask about technical steps:
1. Connect wallet.
2. Tracy scans 24 months of history.
3. Tracy identifies positions and prepares strategy.
4. User approves → Tracy executes.
5. Rewards distributed 24-72h after snapshots (Sundays 00:00 UTC).
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_GENERATIVE_AI_API_KEY is missing!");
            return NextResponse.json({ error: "Tracy's neural connection is not configured." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Gemini requires strict alternating roles: user -> model -> user -> model
        // We start with the personality training as the first "user" message
        const history = [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: "model",
                parts: [{ text: "Acknowledged. I am Tracy, the intelligent assistant for Legacy Trace. I will guide users with friendly and professional expertise on rewards, staking, and trading." }]
            }
        ];

        // Process existing messages, skipping the first 'Hello' from Tracy if it's the only model msg
        // because we already established Tracy with the prompt response above.
        // We only map messages that follow the alternating pattern.
        messages.slice(0, -1).forEach((m: any) => {
            const role = m.role === "assistant" ? "model" : "user";

            // Avoid consecutive same-role messages
            if (history[history.length - 1].role !== role) {
                history.push({
                    role: role,
                    parts: [{ text: m.content }]
                });
            }
        });

        const chat = model.startChat({ history });
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
