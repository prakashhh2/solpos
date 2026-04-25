"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn, truncateAddress } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "POS", icon: "🛒" },
  { href: "/dashboard/history", label: "History", icon: "📋" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

const FOOTER_COLUMNS = [
  {
    title: "QuickPOS",
    links: ["About Us", "Press Center", "Careers", "Solana Payments"],
  },
  {
    title: "For Merchants",
    links: ["POS Dashboard", "Transaction History", "QR Checkout", "Analytics"],
  },
  {
    title: "Developers",
    links: ["Docs", "API", "GitHub", "SDK"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "Wallet Setup", "Report Issue"],
  },
  {
    title: "Legal",
    links: ["Privacy Notice", "Terms of Use", "Security", "Compliance"],
  },
  {
    title: "Community",
    links: ["Discord", "Twitter", "Partners", "Blog"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(11,17,32)] text-white">
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
              <span className="hidden sm:block tracking-tight">QuickPOS</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
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
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {connected && publicKey ? (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {truncateAddress(publicKey.toBase58())}
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-xs text-amber-400">
                ⚠ Connect wallet
              </span>
            )}

            {mounted && (
              <WalletMultiButton
                style={{
                  background: connected
                    ? "rgba(59,130,246,0.15)"
                    : "rgba(59,130,246,0.9)",
                  border: "1px solid rgba(59,130,246,0.4)",
                  borderRadius: "0.5rem",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  height: "auto",
                  color: "white",
                }}
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgb(17,24,39)] border-t border-[rgb(31,41,55)] px-4 py-2">
        <div className="flex justify-around">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
                pathname === href
                  ? "text-blue-400"
                  : "text-gray-500 hover:text-white"
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

      {/* Amazon-style Footer */}
      <footer className="hidden md:block bg-[#0f172a] border-t border-slate-800 text-sm text-gray-400">
        <div className="max-w-screen-2xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-white font-semibold mb-3">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 px-6 py-5">
          <div className="max-w-screen-2xl mx-auto flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black">
                Q
              </div>
              <p>© 2026 SolPOS — Built on Solana ⚡</p>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <a href="#" className="hover:text-white">
                Conditions of Use
              </a>
              <a href="#" className="hover:text-white">
                Privacy Notice
              </a>
              <a href="#" className="hover:text-white">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}