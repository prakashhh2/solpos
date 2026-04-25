export type TransactionStatus = "pending" | "confirmed" | "failed";
export type PaymentMethod = "solana" | "card" | "cash";

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

export interface Transaction {
  id: string;
  signature: string;
  amount: number;
  timestamp: Date;
  status: TransactionStatus;
  reference: string;
  items?: TransactionItem[];
  payment_method?: PaymentMethod;
  splits?: SplitBreakdown;
}

export interface SplitBreakdown {
  owner: number;
  employee: number;
  tax: number;
  ownerPct: number;
  employeePct: number;
  taxPct: number;
}

export interface DashboardStats {
  todayRevenue: number;
  totalTransactions: number;
  averageSale: number;
}

export interface PaymentState {
  status: "idle" | "waiting" | "confirmed" | "failed";
  signature: string | null;
  error: string | null;
}

export interface SplitConfig {
  enabled: boolean;
  ownerWallet: string;
  employeeWallet: string;
  taxWallet: string;
  ownerPct: number;
  employeePct: number;
  taxPct: number;
}
