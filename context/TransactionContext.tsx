"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Transaction, DashboardStats, SplitConfig } from "@/lib/types";
import { SEED_TRANSACTIONS } from "@/lib/seedData";
import { DEFAULT_SPLITS } from "@/lib/constants";

const STORAGE_KEY = "pos-transactions";

interface StoredTx extends Omit<Transaction, "timestamp" | "refunded_at"> {
  timestamp: string;
  refunded_at?: string;
}

function loadFromStorage(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as StoredTx[];
    return parsed.map((t) => ({
      ...t,
      timestamp: new Date(t.timestamp),
      refunded_at: t.refunded_at ? new Date(t.refunded_at) : undefined,
    }));
  } catch {
    return null;
  }
}

function saveToStorage(txs: Transaction[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(txs.map((t) => ({ ...t, timestamp: t.timestamp.toISOString() })))
    );
  } catch {
    // quota exceeded or unavailable
  }
}

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
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
  const [hydrated, setHydrated] = useState(false);
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

  // Hydrate from localStorage on mount; fall back to seed data on first visit
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored !== null) {
      setTransactions(stored);
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage after every change (skip the initial render)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(transactions);
  }, [transactions, hydrated]);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const stats = computeStats(transactions);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
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
