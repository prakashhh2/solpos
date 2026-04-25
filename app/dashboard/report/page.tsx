"use client";

import React, { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { DailyReportResult } from "@/app/api/daily-report/route";
import { formatUSD } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportPage() {
  const { transactions } = useTransactions();
  const [report, setReport] = useState<DailyReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }, []);

  const todayTxs = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return transactions.filter(
      (t) => t.status === "confirmed" && t.timestamp >= start
    );
  }, [transactions]);

  const todayRevenue = todayTxs.reduce((s, t) => s + t.amount, 0);

  async function handleGenerate() {
    if (todayTxs.length === 0) {
      toast.error("No confirmed transactions today to report on.");
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const payload = todayTxs.map((t) => ({
        amount: t.amount,
        timestamp: t.timestamp.toISOString(),
        payment_method: t.payment_method,
        status: t.status,
        items: t.items ?? [],
      }));
      const res = await fetch("/api/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: payload, date: today }),
      });
      const json = await res.json();
      if (json.ok) {
        setReport(json.report);
        setGeneratedAt(new Date());
        toast.success("Daily report ready.");
      } else {
        toast.error(json.error ?? "Failed to generate report");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    !report ? ""
    : report.score >= 75 ? "text-emerald-400"
    : report.score >= 50 ? "text-amber-400"
    : "text-red-400";

  const scoreBg =
    !report ? ""
    : report.score >= 75 ? "bg-emerald-500/10 border-emerald-500/25"
    : report.score >= 50 ? "bg-amber-500/10 border-amber-500/25"
    : "bg-red-500/10 border-red-500/25";

  const maxHourlyRevenue = report
    ? Math.max(...report.hourlyRevenue.map((h) => h.revenue), 1)
    : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Report</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{today}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9945FF] hover:bg-[#7d35d4] disabled:opacity-50 text-sm font-semibold text-white transition-colors"
        >
          {loading ? (
            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating…</>
          ) : (
            <>Generate Report</>
          )}
        </button>
      </div>

      {/* Today snapshot — always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SnapCard label="Today's Revenue" value={formatUSD(todayRevenue)} accent="text-[#14F195]" />
        <SnapCard label="Transactions" value={String(todayTxs.length)} accent="text-blue-400" />
        <SnapCard
          label="Avg Ticket"
          value={todayTxs.length ? formatUSD(todayRevenue / todayTxs.length) : "—"}
          accent="text-[#9945FF]"
        />
        <SnapCard
          label="Top Method"
          value={topMethod(todayTxs)}
          accent="text-zinc-300"
        />
      </div>

      {/* Empty state */}
      {!report && !loading && (
        <div className="glass rounded-2xl flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-zinc-400 text-base font-medium">No report yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            {todayTxs.length === 0
              ? "No confirmed transactions today. Make some sales first."
              : `Click "Generate Report" to get a Gemini AI analysis of today's ${todayTxs.length} transaction${todayTxs.length !== 1 ? "s" : ""}.`}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="glass rounded-2xl p-6 space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded-full bg-zinc-800" style={{ width: `${70 - i * 12}%` }} />
          ))}
        </div>
      )}

      {/* ── REPORT ── */}
      {report && (
        <div className="space-y-5">

          {/* Header card: score + headline + narrative */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1 flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">End-of-Day Summary</p>
                <h2 className="text-xl font-bold text-white leading-snug">{report.headline}</h2>
              </div>
              <div className={cn("flex flex-col items-center justify-center w-20 h-20 rounded-2xl border shrink-0", scoreBg)}>
                <span className={cn("text-3xl font-black", scoreColor)}>{report.score}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">/ 100</span>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{report.narrative}</p>
            {generatedAt && (
              <p className="text-xs text-zinc-600">
                Generated at {generatedAt.toLocaleTimeString()} · Powered by Gemini
              </p>
            )}
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetricCard label="Total Revenue" value={formatUSD(report.metrics.totalRevenue)} accent="text-[#14F195]" />
            <MetricCard label="Transactions" value={String(report.metrics.transactionCount)} accent="text-blue-400" />
            <MetricCard label="Avg Ticket" value={formatUSD(report.metrics.avgTicket)} accent="text-[#9945FF]" />
            <MetricCard label="Peak Hour" value={report.metrics.peakHour} accent="text-amber-400" />
            <MetricCard label="Top Payment" value={report.metrics.topPaymentMethod} accent="text-zinc-300" />
          </div>

          {/* Two-column: Top Products + Payment Split */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Top Products */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Top Products</h3>
              <div className="space-y-3">
                {report.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#9945FF]/20 text-[#9945FF] text-xs flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-white truncate">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-[#14F195]">{formatUSD(p.revenue)}</div>
                      <div className="text-xs text-zinc-500">{p.qty} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Split */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Payment Methods</h3>
              <div className="space-y-3">
                {report.paymentSplit.map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300 capitalize">{p.method}</span>
                      <span className="text-white font-medium">{formatUSD(p.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#9945FF] rounded-full"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 w-8 text-right">{p.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Revenue Chart */}
          {report.hourlyRevenue.length > 0 && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Revenue by Hour</h3>
              <div className="flex items-end gap-1.5 h-24">
                {report.hourlyRevenue.map((h, i) => {
                  const heightPct = (h.revenue / maxHourlyRevenue) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <div
                        className="w-full rounded-t-sm bg-[#9945FF]/60 hover:bg-[#9945FF] transition-colors"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                        title={`${h.hour}: ${formatUSD(h.revenue)}`}
                      />
                      <span className="text-[9px] text-zinc-600 truncate w-full text-center">
                        {h.hour.slice(0, 5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wins + Tomorrow Actions */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Wins */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Today's Wins</h3>
              <ul className="space-y-2.5">
                {report.wins.map((w, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 text-xs flex items-center justify-center shrink-0 font-bold">
                      ✓
                    </span>
                    <p className="text-sm text-zinc-200 leading-snug">{w}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tomorrow Actions */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Action Plan for Tomorrow</h3>
              <ul className="space-y-2.5">
                {report.tomorrowActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#9945FF]/20 text-[#9945FF] text-xs flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-zinc-200 leading-snug">{a}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function SnapCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={cn("text-xl font-bold mt-0.5", accent)}>{value}</p>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl bg-zinc-900/60 border border-white/5 p-4">
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className={cn("text-lg font-semibold", accent)}>{value}</p>
    </div>
  );
}

function topMethod(txs: { payment_method?: string }[]): string {
  if (txs.length === 0) return "—";
  const counts: Record<string, number> = {};
  for (const t of txs) {
    const m = t.payment_method ?? "solana";
    counts[m] = (counts[m] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return top.charAt(0).toUpperCase() + top.slice(1);
}
