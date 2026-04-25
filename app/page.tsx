"use client";

import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#9945FF]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[#14F195]/6 blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 max-w-lg text-center animate-fade-in">
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#9945FF] to-[#7c3aed] flex items-center justify-center shadow-2xl glow-purple">
          <span className="text-4xl">⚡</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-gradient">Solana POS</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Accept USDC payments instantly.
            <br />
            No middlemen, under 1 second.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "⚡ &lt;1s finality",
            "💸 USDC stablecoin",
            "📱 QR code checkout",
            "🔀 Auto-split payments",
          ].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300"
              dangerouslySetInnerHTML={{ __html: feat }}
            />
          ))}
        </div>

        {/* Connect wallet CTA */}
        <div className="flex flex-col items-center gap-3">
          <WalletMultiButton
            style={{
              background: "linear-gradient(135deg, #9945FF, #7c3aed)",
              borderRadius: "1rem",
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "700",
              fontFamily: "var(--font-geist-sans)",
              height: "auto",
              boxShadow: "0 0 24px rgba(153, 69, 255, 0.4)",
            }}
          />
          <p className="text-xs text-zinc-600">
            Supports Phantom, Solflare, and more
          </p>
        </div>

        {/* Network badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
          <span className="text-xs text-zinc-400">Solana Devnet</span>
        </div>
      </div>
    </main>
  );
}
