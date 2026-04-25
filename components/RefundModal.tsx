"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction as SolanaTx } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { toast } from "sonner";
import { Transaction } from "@/lib/types";
import { USDC_MINT, USDC_DECIMALS } from "@/lib/constants";
import { formatUSD, truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTransactionContext } from "@/context/TransactionContext";

interface Props {
  tx: Transaction;
  onClose: () => void;
}

type Step = "confirm" | "sending" | "done";

export function RefundModal({ tx, onClose }: Props) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { updateTransaction } = useTransactionContext();

  const isSolana = !tx.payment_method || tx.payment_method === "solana";
  const [customerAddress, setCustomerAddress] = useState("");
  const [addrError, setAddrError] = useState("");
  const [step, setStep] = useState<Step>("confirm");
  const [refundSig, setRefundSig] = useState<string | null>(null);

  function validateAddress(addr: string): boolean {
    try {
      new PublicKey(addr);
      return true;
    } catch {
      return false;
    }
  }

  async function handleRefund() {
    if (isSolana) {
      const addr = customerAddress.trim();
      if (!validateAddress(addr)) {
        setAddrError("Enter a valid Solana wallet address");
        return;
      }
      if (!publicKey || !sendTransaction) {
        toast.error("Wallet not connected");
        return;
      }

      setStep("sending");
      try {
        const destination = new PublicKey(addr);
        const sourceAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const destAta = await getAssociatedTokenAddress(USDC_MINT, destination);
        const lamports = BigInt(Math.round(tx.amount * Math.pow(10, USDC_DECIMALS)));

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        const solanaTx = new SolanaTx();
        solanaTx.recentBlockhash = blockhash;
        solanaTx.feePayer = publicKey;

        const destAtaInfo = await getAccount(connection, destAta).catch(() => null);
        if (!destAtaInfo) {
          solanaTx.add(
            createAssociatedTokenAccountInstruction(publicKey, destAta, destination, USDC_MINT)
          );
        }
        solanaTx.add(
          createTransferCheckedInstruction(sourceAta, USDC_MINT, destAta, publicKey, lamports, USDC_DECIMALS)
        );

        const signature = await sendTransaction(solanaTx, connection);
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

        setRefundSig(signature);
        updateTransaction(tx.id, {
          status: "refunded",
          refund_tx: signature,
          refunded_at: new Date(),
        });
        setStep("done");
        toast.success(`Refund of ${formatUSD(tx.amount)} sent on-chain.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Refund failed");
        setStep("confirm");
      }
    } else {
      // Cash / card — record-only refund
      updateTransaction(tx.id, {
        status: "refunded",
        refunded_at: new Date(),
      });
      setStep("done");
      toast.success("Transaction marked as refunded.");
    }
  }

  const itemLabel =
    tx.items && tx.items.length > 0
      ? tx.items.map((i) => (i.qty > 1 ? `${i.qty}× ${i.name}` : i.name)).join(", ")
      : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4">
      <div className="w-full max-w-md rounded-2xl bg-[rgb(17,24,39)] border border-[rgb(31,41,55)] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(31,41,55)]">
          <h2 className="text-base font-semibold text-white">Issue Refund</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {step === "done" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl text-emerald-400">✓</span>
              </div>
              <div>
                <p className="text-base font-semibold text-white">Refund Complete</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {formatUSD(tx.amount)} refunded{isSolana ? " on-chain" : " (recorded)"}
                </p>
              </div>
              {refundSig && (
                <a
                  href={`https://explorer.solana.com/tx/${refundSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#9945FF] hover:text-[#b070ff] transition-colors"
                >
                  View refund on Explorer ↗
                </a>
              )}
              <button
                onClick={onClose}
                className="mt-2 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Transaction summary */}
              <div className="rounded-xl bg-zinc-900/60 border border-white/5 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-semibold text-white">{formatUSD(tx.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Items</span>
                  <span className="text-zinc-300 text-right max-w-[60%] truncate">{itemLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Method</span>
                  <span className="text-zinc-300 capitalize">{tx.payment_method ?? "solana"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date</span>
                  <span className="text-zinc-300">{tx.timestamp.toLocaleDateString()}</span>
                </div>
                {isSolana && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Original tx</span>
                    <span className="text-zinc-400 font-mono text-xs">{truncateAddress(tx.signature, 8)}</span>
                  </div>
                )}
              </div>

              {/* Solana: customer address input */}
              {isSolana && step === "confirm" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">
                    Customer wallet address <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={customerAddress}
                    onChange={(e) => { setCustomerAddress(e.target.value); setAddrError(""); }}
                    placeholder="Paste Solana address to refund to"
                    className={cn(
                      "w-full px-3 py-2.5 rounded-xl bg-black border text-white placeholder-zinc-600 text-sm font-mono focus:outline-none focus:ring-1",
                      addrError
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-zinc-700 focus:border-[#9945FF] focus:ring-[#9945FF]/30"
                    )}
                  />
                  {addrError && <p className="text-xs text-red-400">{addrError}</p>}
                  <p className="text-xs text-zinc-600">
                    USDC will be sent from your merchant wallet back to this address.
                  </p>
                </div>
              )}

              {/* Cash/card note */}
              {!isSolana && (
                <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3">
                  <p className="text-xs text-amber-400 leading-relaxed">
                    <span className="font-semibold">Record-only refund.</span> This marks the transaction as
                    refunded in your POS records. Process the physical{" "}
                    {tx.payment_method === "cash" ? "cash" : "card"} refund separately.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={step === "sending"}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={step === "sending" || (isSolana && !customerAddress.trim())}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  {step === "sending" ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    `Refund ${formatUSD(tx.amount)}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
