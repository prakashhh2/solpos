"use client";

import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/history", label: "History", icon: "📋" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!connected) {
      router.replace("/");
    }
  }, [connected, router]);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#9945FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Checking wallet…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 glass border-b border-white/8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <span className="text-2xl">⚡</span>
              <span className="text-gradient hidden sm:block">Solana POS</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-[#9945FF]/20 text-[#9945FF]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {publicKey && (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#14F195]" />
                {truncateAddress(publicKey.toBase58())}
              </span>
            )}
            <WalletMultiButton
              style={{
                background: "rgba(153,69,255,0.15)",
                border: "1px solid rgba(153,69,255,0.4)",
                borderRadius: "0.75rem",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "var(--font-geist-sans)",
                height: "auto",
                color: "#d4b4ff",
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/8 px-4 py-2"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
                pathname === href
                  ? "text-[#9945FF]"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
