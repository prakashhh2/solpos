"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Keypad } from "@/components/Keypad";
import { QRDisplay } from "@/components/QRDisplay";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useTransactionContext } from "@/context/TransactionContext";
import { createPaymentRequest, computeSplits } from "@/lib/solanaPay";
import { Transaction, SplitBreakdown } from "@/lib/types";
import { DEFAULT_SPLITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ChargeStep = "keypad" | "qr";

export default function ChargePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { addTransaction, splitConfig, demoMode } = useTransactionContext();

  const [step, setStep] = useState<ChargeStep>("keypad");
  const [amount, setAmount] = useState(0);
  const [paymentRequest, setPaymentRequest] = useState<ReturnType<
    typeof createPaymentRequest
  > | null>(null);
  const [splitEnabled, setSplitEnabled] = useState(splitConfig.enabled);

  const { status, signature, error, reset } = usePaymentStatus({
    reference: paymentRequest?.reference ?? null,
    recipient: publicKey,
    amount,
    enabled: step === "qr" && !demoMode,
  });

  const splitBreakdown: SplitBreakdown | null = useMemo(
    () =>
      splitEnabled
        ? {
            ...computeSplits(
              amount,
              DEFAULT_SPLITS.owner,
              DEFAULT_SPLITS.employee,
              DEFAULT_SPLITS.tax
            ),
            ownerPct: DEFAULT_SPLITS.owner,
            employeePct: DEFAULT_SPLITS.employee,
            taxPct: DEFAULT_SPLITS.tax,
          }
        : null,
    [splitEnabled, amount]
  );

  const handlePaymentConfirmed = useCallback(
    (sig: string, confirmedAmount: number) => {
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        signature: sig,
        amount: confirmedAmount,
        timestamp: new Date(),
        status: "confirmed",
        reference: paymentRequest?.reference.toBase58() ?? "",
        splits: splitBreakdown ?? undefined,
      };
      addTransaction(tx);
      toast.success(
        `Payment confirmed! $${confirmedAmount.toFixed(2)} USDC received.`
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    },
    [addTransaction, paymentRequest, splitBreakdown, router]
  );

  const handleCharge = useCallback(
    (chargeAmount: number) => {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }
      const req = createPaymentRequest(
        publicKey,
        chargeAmount,
        "Solana POS",
        `Payment of $${chargeAmount.toFixed(2)}`
      );
      setAmount(chargeAmount);
      setPaymentRequest(req);
      setStep("qr");

      if (demoMode) {
        const sig = "demo-signature-" + Date.now();
        setTimeout(() => handlePaymentConfirmed(sig, chargeAmount), 3000);
      }
    },
    [publicKey, demoMode, handlePaymentConfirmed]
  );

  // Watch for real payment confirmation
  React.useEffect(() => {
    if (status === "confirmed" && signature && !demoMode) {
      handlePaymentConfirmed(signature, amount);
    }
  }, [status, signature, amount, demoMode, handlePaymentConfirmed]);

  const handleCancel = useCallback(() => {
    reset();
    setStep("keypad");
    setPaymentRequest(null);
  }, [reset]);

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => (step === "qr" ? handleCancel() : router.back())}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold">
          {step === "keypad" ? "New Sale" : "Waiting for Payment"}
        </h1>
        <div className="w-16" />
      </div>

      {step === "keypad" && (
        <div className="space-y-6">
          <Keypad onAmountChange={() => {}} onCharge={handleCharge} />

          {/* Auto-split toggle */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Auto-Split Payment
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Owner 80% · Tip 10% · Tax 10%
                </p>
              </div>
              <button
                onClick={() => setSplitEnabled((v) => !v)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200",
                  splitEnabled ? "bg-[#9945FF]" : "bg-zinc-700"
                )}
                role="switch"
                aria-checked={splitEnabled}
                aria-label="Toggle auto-split"
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
                    splitEnabled ? "translate-x-6" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {splitEnabled && (
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center animate-fade-in">
                {[
                  { label: "Owner", pct: 80, color: "text-[#9945FF]" },
                  { label: "Employee", pct: 10, color: "text-[#14F195]" },
                  { label: "Tax", pct: 10, color: "text-zinc-400" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <p className={cn("text-lg font-bold", color)}>{pct}%</p>
                    <p className="text-xs text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {demoMode && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14F195]/10 border border-[#14F195]/20">
              <span>🎭</span>
              <p className="text-xs text-[#14F195]">
                Demo mode: payment will auto-confirm in 3 seconds
              </p>
            </div>
          )}
        </div>
      )}

      {step === "qr" && paymentRequest && (
        <div className="glass rounded-3xl p-6 md:p-8">
          <QRDisplay
            url={paymentRequest.url.toString()}
            amount={amount}
            paymentState={{ status, signature, error }}
            onCancel={handleCancel}
            splitEnabled={splitEnabled}
            splitBreakdown={splitBreakdown}
          />
        </div>
      )}
    </div>
  );
}
