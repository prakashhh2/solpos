"use client";

import React from "react";
import Link from "next/link";
import { useTransactions } from "@/hooks/useTransactions";
import { StatsCards } from "@/components/StatsCards";
import { TransactionFeed } from "@/components/TransactionFeed";
import { useTransactionContext } from "@/context/TransactionContext";

export default function DashboardPage() {
  const { recentTransactions, stats } = useTransactions();
  const { demoMode } = useTransactionContext();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Demo mode banner */}
      {demoMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/30">
          <span className="text-lg">🎭</span>
          <p className="text-sm text-[#9945FF]">
            Demo mode active — showing mock data for presentation.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <Link
          href="/dashboard/charge"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9945FF] to-[#7c3aed] hover:from-[#8835ee] hover:to-[#6d29dc] text-white font-bold text-sm transition-all duration-200 shadow-lg glow-purple"
          aria-label="Create a new charge"
        >
          <span className="text-lg">⚡</span>
          New Sale
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link
            href="/dashboard/history"
            className="text-xs text-[#9945FF] hover:text-[#b070ff] transition-colors font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="glass rounded-2xl p-4 md:p-6">
          <TransactionFeed transactions={recentTransactions} limit={10} />
        </div>
      </section>
    </div>
  );
}
