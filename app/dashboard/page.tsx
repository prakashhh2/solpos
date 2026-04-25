"use client";

import { useState } from "react";

const products = [
  {
    name: "Coffee",
    price: 1.25,
    category: "Drinks",
    stock: 120,
    image: "☕",
  },
  {
    name: "Tea",
    price: 0.75,
    category: "Drinks",
    stock: 180,
    image: "🍵",
  },
  {
    name: "Momo",
    price: 2.5,
    category: "Food",
    stock: 90,
    image: "🥟",
  },
  {
    name: "Sandwich",
    price: 3.0,
    category: "Food",
    stock: 65,
    image: "🥪",
  },
  {
    name: "Burger",
    price: 4.5,
    category: "Food",
    stock: 45,
    image: "🍔",
  },
  {
    name: "Juice",
    price: 1.75,
    category: "Drinks",
    stock: 150,
    image: "🧃",
  },
  {
    name: "Pizza Slice",
    price: 3.25,
    category: "Food",
    stock: 70,
    image: "🍕",
  },
  {
    name: "Cookie",
    price: 0.9,
    category: "Snacks",
    stock: 240,
    image: "🍪",
  },
];

const transactions = [
  { item: "Coffee", amount: "1.25 USDC", status: "Paid", time: "2 min ago" },
  { item: "Burger", amount: "4.50 USDC", status: "Paid", time: "6 min ago" },
  { item: "Momo", amount: "2.50 USDC", status: "Paid", time: "8 min ago" },
  { item: "Tea", amount: "0.75 USDC", status: "Pending", time: "14 min ago" },
];

export default function DashboardPage() {
  const [cart, setCart] = useState<typeof products>([]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="space-y-8">
      {/* Hero */}
      <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-400">
              Solana-powered retail payments
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white">
              SolPOS Merchant Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Manage products, accept USDC micropayments, generate Solana Pay QR
              codes, and track merchant sales in real time.
            </p>
          </div>

          <button className="rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-900/30 hover:scale-[1.02] transition">
            + New Checkout
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-5 md:grid-cols-4">
        <StatCard title="Today’s Revenue" value="$1,248.50" note="+18.2% from yesterday" />
        <StatCard title="Products in Stock" value="960" note="8 active products" />
        <StatCard title="Transactions" value="128" note="121 completed" />
        <StatCard title="Success Rate" value="98.7%" note="Solana devnet active" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Products */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Product Inventory</h2>
              <p className="text-sm text-slate-400">
                Select products to add them to checkout
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              Live Stock
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <button
                key={product.name}
                onClick={() => setCart([...cart, product])}
                className="group rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-900 hover:shadow-xl hover:shadow-blue-950/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-4xl">
                    {product.image}
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    Stock: {product.stock}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <p className="text-sm text-slate-400">{product.category}</p>

                <div className="mt-4 flex items-end justify-between">
                  <p className="text-2xl font-black text-emerald-400">
                    ${product.price.toFixed(2)}
                  </p>
                  <span className="text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
                    Add item →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Checkout */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white">Checkout</h2>
          <p className="mb-5 text-sm text-slate-400">Current customer cart</p>

          <div className="space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
                No items selected
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-950/80 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="my-6 border-t border-slate-800 pt-5">
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span>${total.toFixed(2)} USDC</span>
            </div>
          </div>

          <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-4 font-black text-slate-950 transition hover:scale-[1.01]">
            Generate Solana Pay QR
          </button>

          <button
            onClick={() => setCart([])}
            className="mt-3 w-full rounded-2xl border border-slate-700 py-4 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Clear Cart
          </button>
        </div>
      </section>

      {/* Transactions */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h2 className="mb-5 text-2xl font-bold text-white">Recent Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="py-3">Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={`${tx.item}-${tx.time}`} className="border-b border-slate-800">
                  <td className="py-4 font-semibold">{tx.item}</td>
                  <td>{tx.amount}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        tx.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="text-slate-400">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-500/50">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
      <p className="mt-2 text-xs font-semibold text-emerald-400">{note}</p>
    </div>
  );
}