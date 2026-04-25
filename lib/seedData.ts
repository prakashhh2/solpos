import { Transaction } from "./types";

const DEMO_SIGS = [
  "5h8GNj7pD2mR4xKqWnLc3fVsBtYuZiAoE9kHwX1ePdCq6mNvTrYsFaB7gKjQpW",
  "3mKpLq8RnHwD5sTyUvXcBzGjE2fYaVoNiCrP9xWtFkM4bDeQhJuAeZ6nLgRsXp",
  "7fNqMt4KrBsEhYwDxCpV3uGjZ9aLnWoFiTvQ2eRkP8cHmUbJySdXzA5gNqpLtK",
  "2bHsRpW7mYvDjKcNxQLgF4tZuEoAiBnPeV9rTqXfCkM3dJyUhGaSzW8nLpEqRt",
  "9xLvTn5KpHqBwMcRdSfYuZj3GaVeNoQiA8kWrE4tFmP7bCyJsDgXhU2nLpEqKw",
  "4kRmJq8VbNxHwDsCpTfYuLzG6aEoNiA3eWrPtBmF2jKyUhGqXvZ9nLsEpRwDtM",
  "6pSnKv3HqBmRwDcTyFuLzG7aNoQiE9eWrJtBxF4kMyCpUhGqXvZ2nLsEpRwDtM",
  "8tRmNq4VbKxHwDsCpTfYuLzG6aEoNiA3eWrPtBmF2jKyUhGqXvZ9nLsEpRwDtM",
  "1jSmLp7HqBwRcDtYfNuKzG3aEoViA9eWrPtBxF6kMyCpUhGqXvZ4nLsEpRwDtM",
  "0hQmNq5VbKxHwDsCpTfYuLzG8aEoNiA1eWrPtBmF4jKyUhGqXvZ7nLsEpRwDtM",
];

const AMOUNTS = [12.5, 34.99, 8.75, 125.0, 45.5, 67.25, 19.99, 89.0, 52.75, 15.0];

function minutesAgo(min: number): Date {
  return new Date(Date.now() - min * 60 * 1000);
}

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: "demo-1", signature: DEMO_SIGS[0], amount: AMOUNTS[0], timestamp: minutesAgo(3), status: "confirmed", reference: "ref1" },
  { id: "demo-2", signature: DEMO_SIGS[1], amount: AMOUNTS[1], timestamp: minutesAgo(8), status: "confirmed", reference: "ref2" },
  { id: "demo-3", signature: DEMO_SIGS[2], amount: AMOUNTS[2], timestamp: minutesAgo(15), status: "confirmed", reference: "ref3" },
  { id: "demo-4", signature: DEMO_SIGS[3], amount: AMOUNTS[3], timestamp: minutesAgo(22), status: "confirmed", reference: "ref4" },
  { id: "demo-5", signature: DEMO_SIGS[4], amount: AMOUNTS[4], timestamp: minutesAgo(45), status: "confirmed", reference: "ref5" },
  { id: "demo-6", signature: DEMO_SIGS[5], amount: AMOUNTS[5], timestamp: minutesAgo(90), status: "confirmed", reference: "ref6" },
  { id: "demo-7", signature: DEMO_SIGS[6], amount: AMOUNTS[6], timestamp: minutesAgo(150), status: "confirmed", reference: "ref7" },
  { id: "demo-8", signature: DEMO_SIGS[7], amount: AMOUNTS[7], timestamp: minutesAgo(240), status: "confirmed", reference: "ref8" },
  { id: "demo-9", signature: DEMO_SIGS[8], amount: AMOUNTS[8], timestamp: minutesAgo(360), status: "confirmed", reference: "ref9" },
  { id: "demo-10", signature: DEMO_SIGS[9], amount: AMOUNTS[9], timestamp: minutesAgo(480), status: "confirmed", reference: "ref10" },
];
