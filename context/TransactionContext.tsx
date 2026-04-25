"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Transaction, DashboardStats, SplitConfig } from "@/lib/types";
import { SEED_TRANSACTIONS } from "@/lib/seedData";
import { DEFAULT_SPLITS } from "@/lib/constants";

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  stats: DashboardStats;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  splitConfig: SplitConfig;
  setSplitConfig: (cfg: SplitConfig) => void;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

function computeStats(txs: Transaction[]): DashboardStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTxs = txs.filter(
    (t) => t.status === "confirmed" && t.timestamp >= today
  );
  const confirmed = txs.filter((t) => t.status === "confirmed");
  const todayRevenue = todayTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = confirmed.length;
  const averageSale =
    totalTransactions > 0
      ? confirmed.reduce((sum, t) => sum + t.amount, 0) / totalTransactions
      : 0;
  return { todayRevenue, totalTransactions, averageSale };
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(SEED_TRANSACTIONS);
  const [demoMode, setDemoMode] = useState(false);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    enabled: false,
    ownerWallet: "",
    employeeWallet: "",
    taxWallet: "",
    ownerPct: DEFAULT_SPLITS.owner,
    employeePct: DEFAULT_SPLITS.employee,
    taxPct: DEFAULT_SPLITS.tax,
  });

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const stats = computeStats(transactions);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        stats,
        demoMode,
        setDemoMode,
        splitConfig,
        setSplitConfig,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransactionContext must be used within TransactionProvider");
  }
  return ctx;
}
