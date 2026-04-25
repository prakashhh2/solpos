"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { Transaction } from "@/lib/types";

export interface UseTransactionsReturn {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  stats: { todayRevenue: number; totalTransactions: number; averageSale: number };
}

export function useTransactions(): UseTransactionsReturn {
  const { transactions, addTransaction, stats } = useTransactionContext();
  const recentTransactions = transactions.slice(0, 10);
  return { transactions, recentTransactions, addTransaction, stats };
}
