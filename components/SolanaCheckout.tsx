"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { createPaymentRequest } from "@/lib/solanaPay";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { SOLANA_NETWORK } from "@/lib/constants";

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface SolanaCheckoutProps {
  items: CartItem[];
  subtotal: number;
  taxAmt: number;
  total: number;
  taxRate: number;
  merchantWallet: PublicKey;
  onSuccess: (signature: string, total: number) => void;
  onCancel: () => void;
}

const EXPLORER =
  SOLANA_NETWORK === "mainnet-beta"
    ? "https://explorer.solana.com/tx"
    : "https://explorer.solana.com/tx";

const EXPLORER_CLUSTER =
  SOLANA_NETWORK === "mainnet-beta" ? "" : "?cluster=devnet";

export function SolanaCheckout({
  items,
  subtotal,
  taxAmt,
  total,
  taxRate,
  merchantWallet,
  onSuccess,
  onCancel,
}: SolanaCheckoutProps) {
  const confettiFired = useRef(false);

  // Create a new payment request once per checkout session
  const paymentRequest = useMemo(
    () =>
      createPaymentRequest(
        merchantWallet,
        total,
        "SolPOS",
        `${items.length} item${items.length !== 1 ? "s" : ""} — $${total.toFixed(2)} USDC`
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally stable — regenerate only when this modal mounts
  );

  const { status, signature, error, reset } = usePaymentStatus({
    reference: paymentRequest.reference,
    recipient: merchantWallet,
    amount: total,
    enabled: true,
  });

  // Fire confetti + callback on confirmation
  useEffect(() => {
    if (status === "confirmed" && signature && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.55 },
        colors: ["#3B82F6", "#06B6D4", "#10B981", "#ffffff"],
      });
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
      }, 350);
      setTimeout(() => onSuccess(signature, total), 2400);
    }
  }, [status, signature, total, onSuccess]);

  const qrUrl = paymentRequest.url.toString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-[rgb(17,24,39)] border border-[rgb(31,41,55)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(31,41,55)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm">◎</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Solana Pay Checkout</h2>
              <p className="text-xs text-gray-500">USDC · {SOLANA_NETWORK}</p>
            </div>
          </div>
          {status !== "confirmed" && (
            <button
              onClick={() => { reset(); onCancel(); }}
              className="text-gray-500 hover:text-white text-xl leading-none transition-colors"
              aria-label="Cancel"
            >
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">

          {/* ─── Left: QR + status ─── */}
          <div className="flex flex-col items-center justify-center gap-6 p-6 border-b md:border-b-0 md:border-r border-[rgb(31,41,55)]">

            {status === "confirmed" && signature ? (
              <div className="flex flex-col items-center gap-4 animate-scale-in text-center py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <span className="text-4xl">✓</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-400">Payment Confirmed!</h3>
                  <p className="text-gray-400 mt-1">
                    ${total.toFixed(2)} USDC received on Solana
                  </p>
                </div>
                <a
                  href={`${EXPLORER}/${signature}${EXPLORER_CLUSTER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  View on Explorer ↗
                </a>
                <p className="text-xs text-gray-600">Closing automatically…</p>
              </div>
            ) : status === "failed" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                  <span className="text-3xl">✕</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400">Payment Failed</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">{error}</p>
                </div>
                <button
                  onClick={reset}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Amount */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Charge
                  </p>
                  <p className="text-4xl font-bold text-white">${total.toFixed(2)}</p>
                  <p className="text-sm text-blue-400 mt-0.5">USDC</p>
                </div>

                {/* QR code */}
                <div className="p-3.5 bg-white rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={qrUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Waiting indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                    </span>
                    <span className="text-sm text-gray-300 font-medium">
                      {status === "waiting" ? "Waiting for payment…" : "Initialising…"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Scan with Phantom · Solflare · any Solana Pay wallet
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ─── Right: Order summary ─── */}
          <div className="flex flex-col p-5 gap-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order Summary</p>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-52 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300 truncate mr-2 flex-1">
                    {item.qty > 1 && (
                      <span className="text-gray-500 mr-1">{item.qty}×</span>
                    )}
                    {item.name}
                  </span>
                  <span className="text-white font-medium shrink-0">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[rgb(31,41,55)] pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-300">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({taxRate}%)</span>
                <span className="text-gray-300">${taxAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t border-[rgb(31,41,55)]">
                <span className="text-white">Total</span>
                <span className="text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Merchant wallet */}
            <div className="rounded-xl bg-[rgb(31,41,55)] p-3 space-y-1">
              <p className="text-xs text-gray-500">Merchant Wallet</p>
              <p className="text-xs text-gray-300 font-mono break-all leading-relaxed">
                {merchantWallet.toBase58()}
              </p>
            </div>

            {/* Network badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-600/20">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-dot" />
              <span className="text-xs text-blue-400 font-medium">
                Solana {SOLANA_NETWORK === "mainnet-beta" ? "Mainnet" : "Devnet"} · ~$0.00025 fee
              </span>
            </div>

            {status !== "confirmed" && (
              <button
                onClick={() => { reset(); onCancel(); }}
                className="w-full py-2.5 rounded-xl border border-[rgb(55,65,81)] text-gray-400 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
