"use client";

import React, { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PaymentState } from "@/lib/types";
import { formatUSD } from "@/lib/utils";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface QRDisplayProps {
  url: string;
  amount: number;
  paymentState: PaymentState;
  onCancel: () => void;
  splitEnabled?: boolean;
  splitBreakdown?: { owner: number; employee: number; tax: number } | null;
}

export function QRDisplay({
  url,
  amount,
  paymentState,
  onCancel,
  splitEnabled,
  splitBreakdown,
}: QRDisplayProps) {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (paymentState.status === "confirmed" && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#9945FF", "#14F195", "#ffffff", "#7c3aed"],
      });
      // Second burst for extra flair
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#9945FF", "#14F195"],
        });
      }, 300);
    }
  }, [paymentState.status]);

  if (paymentState.status === "confirmed") {
    return (
      <div className="flex flex-col items-center gap-6 animate-scale-in text-center">
        <div className="w-32 h-32 rounded-full bg-[#14F195]/15 flex items-center justify-center glow-green">
          <span className="text-6xl">✓</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#14F195] mb-1">Payment Received!</h2>
          <p className="text-zinc-400 text-lg">{formatUSD(amount)} confirmed on Solana</p>
        </div>

        {splitEnabled && splitBreakdown && (
          <div className="w-full max-w-sm glass rounded-2xl p-4 space-y-3 animate-fade-in">
            <p className="text-xs uppercase tracking-widest text-zinc-500 text-center mb-2">
              Split Breakdown
            </p>
            <SplitRow label="Owner" amount={splitBreakdown.owner} color="text-[#9945FF]" />
            <SplitRow label="Employee Tip" amount={splitBreakdown.employee} color="text-[#14F195]" />
            <SplitRow label="Tax" amount={splitBreakdown.tax} color="text-zinc-400" />
          </div>
        )}

        <p className="text-xs text-zinc-500">Redirecting to dashboard…</p>
      </div>
    );
  }

  if (paymentState.status === "failed") {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-scale-in">
        <div className="w-24 h-24 rounded-full bg-red-500/15 flex items-center justify-center">
          <span className="text-5xl">✕</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-red-400 mb-1">Payment Failed</h2>
          <p className="text-zinc-400 text-sm max-w-xs">{paymentState.error}</p>
        </div>
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      {/* Amount header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Charge Amount</p>
        <p className="text-5xl font-bold text-white">{formatUSD(amount)}</p>
        <p className="text-sm text-zinc-500 mt-1">USDC on Solana</p>
      </div>

      {/* QR code */}
      <div className="p-4 bg-white rounded-3xl shadow-2xl glow-purple animate-pulse-ring">
        <QRCodeSVG
          value={url}
          size={280}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/solana-logo.svg",
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>

      {/* Waiting indicator */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#9945FF]"
                style={{
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-zinc-400 text-sm font-medium">Waiting for payment…</span>
        </div>
        <p className="text-xs text-zinc-600">Scan with Phantom or Solflare</p>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="px-8 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium transition-colors"
        aria-label="Cancel payment"
      >
        Cancel
      </button>
    </div>
  );
}

function SplitRow({
  label,
  amount,
  color,
}: {
  label: string;
  amount: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={cn("text-sm font-semibold", color)}>
        {formatUSD(amount)}
      </span>
    </div>
  );
}
