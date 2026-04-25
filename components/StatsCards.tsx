"use client";

import React from "react";
import { DashboardStats } from "@/lib/types";
import { formatUSD } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      label: "Today's Revenue",
      value: formatUSD(stats.todayRevenue),
      accent: "from-[#9945FF]/20 to-[#9945FF]/5",
      valueColor: "text-[#9945FF]",
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions.toString(),
      accent: "from-[#14F195]/20 to-[#14F195]/5",
      valueColor: "text-[#14F195]",
    },
    {
      label: "Average Sale",
      value: formatUSD(stats.averageSale),
      accent: "from-blue-500/20 to-blue-500/5",
      valueColor: "text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5 glass",
            "border border-white/8",
            isLoading && "animate-pulse"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-40",
              card.accent
            )}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-zinc-500">
                {card.label}
              </span>
            </div>
            <p
              className={cn(
                "text-3xl font-bold tracking-tight",
                card.valueColor,
                isLoading && "blur-sm"
              )}
            >
              {isLoading ? "—" : card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
