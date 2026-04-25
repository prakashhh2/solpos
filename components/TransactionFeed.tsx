"use client";

import React from "react";
import { Transaction } from "@/lib/types";
import { formatUSD, timeAgo, explorerTxUrl, truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TransactionFeedProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionFeed({
  transactions,
  limit = 10,
}: TransactionFeedProps) {
  const visible = transactions.slice(0, limit);

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
        <span className="text-4xl mb-3">📭</span>
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Recent transactions">
        <thead>
          <tr className="border-b border-white/8">
            <th className="text-left pb-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
              Amount
            </th>
            <th className="text-left pb-3 text-xs uppercase tracking-widest text-zinc-500 font-medium hidden sm:table-cell">
              Signature
            </th>
            <th className="text-left pb-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
              Time
            </th>
            <th className="text-left pb-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
              Status
            </th>
            <th className="text-right pb-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
              Explorer
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((tx, idx) => (
            <tr
              key={tx.id}
              className={cn(
                "border-b border-white/5 transition-colors hover:bg-white/3",
                idx === 0 && "animate-fade-in"
              )}
            >
              <td className="py-3 pr-4">
                <span className="font-semibold text-[#14F195]">
                  {formatUSD(tx.amount)}
                </span>
              </td>
              <td className="py-3 pr-4 text-zinc-500 font-mono hidden sm:table-cell">
                {truncateAddress(tx.signature, 6)}
              </td>
              <td className="py-3 pr-4 text-zinc-400">
                {timeAgo(tx.timestamp)}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={tx.status} />
              </td>
              <td className="py-3 text-right">
                <a
                  href={explorerTxUrl(tx.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9945FF] hover:text-[#b070ff] text-xs font-medium transition-colors"
                  aria-label={`View transaction ${truncateAddress(tx.signature)} on Solana Explorer`}
                >
                  ↗ View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
