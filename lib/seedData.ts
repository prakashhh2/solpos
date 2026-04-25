import { Transaction, PaymentMethod, TransactionItem } from "./types";

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

function minutesAgo(min: number): Date {
  return new Date(Date.now() - min * 60 * 1000);
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

type SeedEntry = {
  items: TransactionItem[];
  payment_method: PaymentMethod;
  minutesAgoVal?: number;
  hoursAgoVal?: number;
};

const SEED: SeedEntry[] = [
  {
    items: [{ name: "Coca-Cola 12oz", qty: 2, price: 1.99 }, { name: "Lays Chips 1oz", qty: 1, price: 1.50 }],
    payment_method: "solana",
    minutesAgoVal: 3,
  },
  {
    items: [{ name: "Chicken Sandwich", qty: 1, price: 8.99 }, { name: "Orange Juice", qty: 1, price: 3.50 }],
    payment_method: "card",
    minutesAgoVal: 8,
  },
  {
    items: [{ name: "Red Bull Energy Drink", qty: 1, price: 3.99 }],
    payment_method: "cash",
    minutesAgoVal: 15,
  },
  {
    items: [{ name: "USB-C Cable 6ft", qty: 2, price: 12.99 }, { name: "Phone Case", qty: 1, price: 9.99 }],
    payment_method: "solana",
    minutesAgoVal: 22,
  },
  {
    items: [{ name: "Coca-Cola 12oz", qty: 3, price: 1.99 }, { name: "Snickers Bar", qty: 2, price: 1.29 }],
    payment_method: "cash",
    minutesAgoVal: 45,
  },
  {
    items: [{ name: "Wireless Earbuds", qty: 1, price: 29.99 }],
    payment_method: "solana",
    minutesAgoVal: 90,
  },
  {
    items: [{ name: "Chicken Sandwich", qty: 2, price: 8.99 }, { name: "Coca-Cola 12oz", qty: 2, price: 1.99 }],
    payment_method: "card",
    minutesAgoVal: 150,
  },
  {
    items: [{ name: "Lays Chips 1oz", qty: 4, price: 1.50 }, { name: "Red Bull Energy Drink", qty: 2, price: 3.99 }],
    payment_method: "solana",
    minutesAgoVal: 240,
  },
  {
    items: [{ name: "USB-C Cable 6ft", qty: 1, price: 12.99 }, { name: "Snickers Bar", qty: 3, price: 1.29 }],
    payment_method: "cash",
    hoursAgoVal: 6,
  },
  {
    items: [{ name: "Phone Case", qty: 2, price: 9.99 }, { name: "Wireless Earbuds", qty: 1, price: 29.99 }],
    payment_method: "card",
    hoursAgoVal: 8,
  },
];

export const SEED_TRANSACTIONS: Transaction[] = SEED.map((s, i) => {
  const amount = s.items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const timestamp = s.hoursAgoVal
    ? hoursAgo(s.hoursAgoVal)
    : minutesAgo(s.minutesAgoVal ?? 0);
  return {
    id: `demo-${i + 1}`,
    signature: DEMO_SIGS[i],
    amount: Math.round(amount * 100) / 100,
    timestamp,
    status: "confirmed",
    reference: `ref${i + 1}`,
    items: s.items,
    payment_method: s.payment_method,
  };
});
