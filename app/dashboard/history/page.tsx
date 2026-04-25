"use client";

import React, { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/lib/types";
import { formatUSD, timeAgo, explorerTxUrl, truncateAddress, downloadCSV } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterRange = "all" | "today" | "week" | "month";

export default function HistoryPage() {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<FilterRange>("all");

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoffs: Record<FilterRange, number> = {
      all: 0,
      today: now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = cutoffs[filter];
    return transactions.filter((t) => t.timestamp.getTime() >= cutoff);
  }, [transactions, filter]);

  const totalVolume = filtered
    .filter((t) => t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ["ID", "Signature", "Amount (USDC)", "Timestamp", "Status"];
    const rows = filtered.map((t) => [
      t.id,
      t.signature,
      t.amount.toFixed(2),
      t.timestamp.toISOString(),
      t.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    downloadCSV(csv, `solana-pos-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("CSV exported!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {filtered.length} transactions · {formatUSD(totalVolume)} total
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition-colors"
          aria-label="Export transactions as CSV"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 w-fit">
        {(["all", "today", "week", "month"] as FilterRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setFilter(range)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all",
              filter === range
                ? "bg-[#9945FF] text-white shadow"
                : "text-zinc-400 hover:text-white"
            )}
            aria-pressed={filter === range}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm">No transactions in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Transaction history">
              <thead className="border-b border-white/8">
                <tr>
                  {["Amount", "Signature", "Date & Time", "Status", "Explorer"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs uppercase tracking-widest text-zinc-500 font-medium"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <HistoryRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ tx }: { tx: Transaction }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      <td className="px-6 py-4">
        <span className="font-semibold text-[#14F195]">{formatUSD(tx.amount)}</span>
      </td>
      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
        {truncateAddress(tx.signature, 8)}
      </td>
      <td className="px-6 py-4 text-zinc-400">
        <div>{tx.timestamp.toLocaleDateString()}</div>
        <div className="text-xs text-zinc-600">{timeAgo(tx.timestamp)}</div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={tx.status} />
      </td>
      <td className="px-6 py-4">
        <a
          href={explorerTxUrl(tx.signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9945FF] hover:text-[#b070ff] text-xs font-medium transition-colors"
          aria-label={`View transaction on Solana Explorer`}
        >
          ↗ Explorer
        </a>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const styles = {
    confirmed: "bg-[#14F195]/15 text-[#14F195] border-[#14F195]/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        styles[status]
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "confirmed" && "bg-[#14F195]",
          status === "pending" && "bg-yellow-400",
          status === "failed" && "bg-red-400"
        )}
      />
      {status}
    </span>
  );
}
