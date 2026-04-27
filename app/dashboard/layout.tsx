"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "POS" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/report", label: "Report" },
  { href: "/dashboard/account", label: "Account" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--c-page))]">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[rgb(17,24,39)] border-b border-slate-200 dark:border-[rgb(31,41,55)] px-4 md:px-8 shadow-sm dark:shadow-none">
        <div className="max-w-screen-2xl mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold text-lg"
            >
              <Image src="/colored-logo.png" alt="SolPOS" width={32} height={32} className="rounded-lg" />
              <span className="text-gradient-retail hidden sm:block tracking-tight">
                SolPOS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-600/25 dark:border-blue-600/30"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {connected && publicKey ? (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse-dot shrink-0" />
                {truncateAddress(publicKey.toBase58())}
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-400">
                Connect wallet to accept Solana Pay
              </span>
            )}
            <WalletMultiButton
              style={{
                background: connected ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.9)",
                border: "1px solid rgba(59,130,246,0.4)",
                borderRadius: "0.5rem",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
                fontFamily: "var(--font-geist-sans)",
                height: "auto",
                color: connected ? "rgb(37,99,235)" : "white",
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[rgb(17,24,39)] border-t border-slate-200 dark:border-[rgb(31,41,55)] px-4 py-2"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
                pathname === href
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-6 py-5 pb-24 md:pb-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-200 dark:border-[rgb(31,41,55)] bg-white dark:bg-[rgb(17,24,39)] px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-gray-500">
            <span className="font-semibold text-slate-600 dark:text-gray-400">SolPOS</span>
            <span>·</span>
            <span>Solana Devnet</span>
            <span>·</span>
            <span>AI powered by Gemini</span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 dark:text-gray-500">Theme</span>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                theme === "dark" ? "bg-blue-600" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className="text-xs w-6 text-center">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
