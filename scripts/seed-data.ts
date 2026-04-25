/**
 * seed-data.ts
 *
 * Standalone script to preview/print the demo seed transactions.
 * The actual seed data is imported at runtime by TransactionContext;
 * this script is for verifying the data shape during development.
 *
 * Usage: npx ts-node scripts/seed-data.ts
 */

import { SEED_TRANSACTIONS } from "../lib/seedData";

console.log("=== Solana POS Seed Transactions ===\n");

SEED_TRANSACTIONS.forEach((tx, idx) => {
  const age = Math.round((Date.now() - tx.timestamp.getTime()) / 60000);
  console.log(
    `[${idx + 1}] $${tx.amount.toFixed(2)} USDC | ${tx.status} | ${age}m ago | ${tx.signature.slice(0, 16)}...`
  );
});

const total = SEED_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
console.log(`\nTotal: $${total.toFixed(2)} USDC across ${SEED_TRANSACTIONS.length} transactions`);
