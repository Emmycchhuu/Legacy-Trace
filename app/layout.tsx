import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Web3ModalProvider } from "@/context/Web3ModalProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: "TRACE | Reward Your On-Chain History",
    description: "Your on-chain history echoes forever. Let Tracy AI Agent authenticate your contributions and secure your rewards.",
    icons: {
        icon: "/images/Logo.jpg",
        apple: "/images/Logo.jpg",
    },
    openGraph: {
        title: "TRACE | Reward Your On-Chain History",
        description: "Your on-chain history echoes forever. Trace it. Earn for it.",
        images: ["/images/Logo.jpg"],
    },
    twitter: {
        card: "summary_large_image",
        title: "TRACE | Reward Your On-Chain History",
        description: "Your on-chain history echoes forever. Trace it. Earn for it.",
        images: ["/images/Logo.jpg"],
    }
};

import Analytics from "@/components/Analytics";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} antialiased bg-black text-white`}>
                <Analytics />
                <Web3ModalProvider>{children}</Web3ModalProvider>
            </body>
        </html>
    );
}
