import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Web3ModalProvider } from "@/context/Web3ModalProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    metadataBase: new URL('https://bodint.tech'),
    title: {
        default: "TRACE | Reward Your On-Chain History",
        template: "%s | TRACE"
    },
    description: "Your on-chain history echoes forever. Let Tracy AI Agent authenticate your contributions and secure your rewards across all EVM chains.",
    keywords: ["Crypto", "Rewards", "On-chain History", "Web3", "Tracy AI", "EVM", "Legacy Trace"],
    authors: [{ name: "Legacy Trace Team" }],
    icons: {
        icon: "/images/Logo.jpg",
        shortcut: "/images/Logo.jpg",
        apple: "/images/Logo.jpg",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://bodint.tech",
        title: "TRACE | Reward Your On-Chain History",
        description: "Your on-chain history echoes forever. Trace it. Earn for it.",
        siteName: "Legacy Trace",
        images: [
            {
                url: "/images/Logo.jpg",
                width: 1200,
                height: 630,
                alt: "Legacy Trace Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "TRACE | Reward Your On-Chain History",
        description: "Your on-chain history echoes forever. Trace it. Earn for it.",
        images: ["/images/Logo.jpg"],
    },
    robots: {
        index: true,
        follow: true,
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
