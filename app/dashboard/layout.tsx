"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
                QuickPOS
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

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              Store Open
            </span>
            <span className="px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-600/30 text-xs text-blue-400 font-medium">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
