"use client";

import React, { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/lib/types";
import { AnalyticsResult } from "@/app/api/analytics/route";
import { formatUSD, timeAgo, explorerTxUrl, truncateAddress, downloadCSV } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RefundModal } from "@/components/RefundModal";

type FilterRange = "all" | "today" | "week" | "month";

const PAYMENT_ICON: Record<string, string> = {
  solana: "◎",
  card: "",
  cash: "",
};

const PAYMENT_COLOR: Record<string, string> = {
  solana: "text-[#9945FF]",
  card: "text-blue-400",
  cash: "text-emerald-400",
};

export default function HistoryPage() {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<FilterRange>("all");
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [refundTx, setRefundTx] = useState<Transaction | null>(null);

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
    const headers = ["ID", "Items", "Payment", "Amount (USDC)", "Timestamp", "Status"];
    const rows = filtered.map((t) => [
      t.id,
      (t.items ?? []).map((i) => `${i.name} x${i.qty}`).join(" | ") || "-",
      t.payment_method ?? "-",
      t.amount.toFixed(2),
      t.timestamp.toISOString(),
      t.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    downloadCSV(csv, `solana-pos-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("CSV exported!");
  };

  const handleGetInsights = async () => {
    if (filtered.length === 0) { toast.error("No transactions to analyze"); return; }
    setLoadingAI(true);
    setAnalytics(null);
    try {
      const payload = filtered.map((t) => ({
        amount: t.amount,
        timestamp: t.timestamp.toISOString(),
        payment_method: t.payment_method,
        items: t.items ?? [],
      }));
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: payload }),
      });
      const json = await res.json();
      if (json.ok) {
        setAnalytics(json.analytics);
        toast.success("AI insights ready!");
      } else {
        toast.error(json.error ?? "Analytics failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {refundTx && (
        <RefundModal tx={refundTx} onClose={() => setRefundTx(null)} />
      )}
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {filtered.length} transactions · {formatUSD(totalVolume)} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGetInsights}
            disabled={loadingAI}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9945FF] hover:bg-[#7d35d4] disabled:opacity-50 text-sm font-medium text-white transition-colors"
          >
            {loadingAI ? (
              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</>
            ) : (
              <>AI Insights</>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition-colors"
            aria-label="Export transactions as CSV"
          >
            ↓ Export CSV
          </button>
        </div>
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

      {/* AI Analytics Panel */}
      {analytics && (
        <div className="glass rounded-2xl p-6 space-y-6 border border-[#9945FF]/30">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">AI Sales Insights</h2>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">{analytics.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Best Products */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Best Products</p>
              {analytics.bestProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white truncate">{p.name}</span>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-[#14F195] font-semibold">{formatUSD(p.revenue)}</div>
                    <div className="text-xs text-zinc-500">{p.unitsSold} sold</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rush Hours */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Rush Hours</p>
              {analytics.rushHours.length > 0 ? (
                analytics.rushHours.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9945FF]" />
                    <span className="text-sm text-white">{h}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Not enough data yet</p>
              )}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-zinc-400 italic">{analytics.loyaltyInsight}</p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Payment Methods</p>
              {analytics.paymentBreakdown.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-sm", PAYMENT_COLOR[p.method] ?? "text-white")}>
                      {PAYMENT_ICON[p.method] ?? "?"} {p.method}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-white font-semibold">{formatUSD(p.revenue)}</div>
                    <div className="text-xs text-zinc-500">{p.count} txns</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock + Combos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.lowStockAlerts && analytics.lowStockAlerts.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Restock Alerts</p>
                {analytics.lowStockAlerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-orange-400 text-sm shrink-0">!</span>
                    <div>
                      <p className="text-sm text-white font-medium">{a.name}</p>
                      <p className="text-xs text-zinc-400">{a.totalSold} sold · {a.alert}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {analytics.topCombos && analytics.topCombos.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Top Combos</p>
                {analytics.topCombos.map((c, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-sm text-white font-medium">{c.items.join(" + ")}</p>
                    <p className="text-xs text-zinc-400">Bought together {c.count}× · {c.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-3">Action Plan</p>
            {analytics.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-[#9945FF]/20 text-[#9945FF] text-xs flex items-center justify-center shrink-0 font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-200">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <p className="text-sm">No transactions in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Transaction history">
              <thead className="border-b border-white/8">
                <tr>
                  {["Product(s)", "Payment", "Amount", "Signature", "Date & Time", "Status", "Explorer", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-xs uppercase tracking-widest text-zinc-500 font-medium"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <HistoryRow key={tx.id} tx={tx} onRefund={() => setRefundTx(tx)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ tx, onRefund }: { tx: Transaction; onRefund: () => void }) {
  const itemLabel = tx.items && tx.items.length > 0
    ? tx.items.map((i) => (i.qty > 1 ? `${i.qty}× ${i.name}` : i.name)).join(", ")
    : "—";

  const method = tx.payment_method ?? "solana";

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      <td className="px-5 py-3 max-w-[200px]">
        <span className="text-zinc-200 text-xs leading-relaxed line-clamp-2">{itemLabel}</span>
      </td>
      <td className="px-5 py-3">
        <span className={cn("flex items-center gap-1 text-xs font-medium", PAYMENT_COLOR[method] ?? "text-zinc-400")}>
          {PAYMENT_ICON[method] ?? "?"} {method}
        </span>
      </td>
      <td className="px-5 py-3">
        <span className="font-semibold text-[#14F195]">{formatUSD(tx.amount)}</span>
      </td>
      <td className="px-5 py-3 text-zinc-500 font-mono text-xs">
        {truncateAddress(tx.signature, 8)}
      </td>
      <td className="px-5 py-3 text-zinc-400">
        <div>{tx.timestamp.toLocaleDateString()}</div>
        <div className="text-xs text-zinc-600">{timeAgo(tx.timestamp)}</div>
      </td>
      <td className="px-5 py-3">
        <StatusBadge status={tx.status} />
      </td>
      <td className="px-5 py-3">
        {tx.payment_method === "solana" || !tx.payment_method ? (
          <a
            href={explorerTxUrl(tx.signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9945FF] hover:text-[#b070ff] text-xs font-medium transition-colors"
            aria-label="View transaction on Solana Explorer"
          >
            ↗ Explorer
          </a>
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </td>
      <td className="px-5 py-3">
        {tx.status === "confirmed" ? (
          <button
            onClick={onRefund}
            className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
          >
            Refund
          </button>
        ) : tx.status === "refunded" ? (
          <span className="text-xs text-zinc-600 italic">Refunded</span>
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const styles: Record<Transaction["status"], string> = {
    confirmed: "bg-[#14F195]/15 text-[#14F195] border-[#14F195]/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
    refunded: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  const dots: Record<Transaction["status"], string> = {
    confirmed: "bg-[#14F195]",
    pending: "bg-yellow-400",
    failed: "bg-red-400",
    refunded: "bg-zinc-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        styles[status]
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}
