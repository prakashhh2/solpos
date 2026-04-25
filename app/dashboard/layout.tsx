"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "POS", icon: "🛒" },
  { href: "/dashboard/history", label: "History", icon: "📋" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(11,17,32)]">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-[rgb(17,24,39)] border-b border-[rgb(31,41,55)] px-4 md:px-8">
        <div className="max-w-screen-2xl mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold text-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black">
                Q
              </div>
              <span className="text-gradient-retail hidden sm:block tracking-tight">
                SolPOS
              </span>
            </Link>

            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="text-sm">{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {connected && publicKey ? (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
                {truncateAddress(publicKey.toBase58())}
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-xs text-amber-400">
                ⚠ Connect wallet to accept Solana Pay
              </span>
            )}
            <WalletMultiButton
              style={{
                background: connected ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.9)",
                border: "1px solid rgba(59,130,246,0.4)",
                borderRadius: "0.5rem",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
                fontFamily: "var(--font-geist-sans)",
                height: "auto",
                color: "white",
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgb(17,24,39)] border-t border-[rgb(31,41,55)] px-4 py-2"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
                pathname === href ? "text-blue-400" : "text-gray-500 hover:text-white"
              )}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-6 py-5 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
