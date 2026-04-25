import { PublicKey } from "@solana/web3.js";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "devnet" | "mainnet-beta") ||
  "devnet";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";

export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const SOLANA_EXPLORER_BASE =
  SOLANA_NETWORK === "mainnet-beta"
    ? "https://explorer.solana.com"
    : "https://explorer.solana.com?cluster=devnet";

export const USDC_DECIMALS = 6;

export const POLL_INTERVAL_MS = 1000;
export const DASHBOARD_POLL_MS = 2000;

/** Split percentages for the auto-split demo feature (must sum to 100) */
export const DEFAULT_SPLITS = {
  owner: 80,
  employee: 10,
  tax: 10,
} as const;
