"use client";

import React from "react";
import Link from "next/link";

const products = [
  ["CF", "Coffee", "$1.25"],
  ["SW", "Sandwich", "$3.00"],
  ["CK", "Cookie", "$0.90"],
  ["JC", "Juice", "$1.75"],
];

const features = [
  {
    title: "Fast checkout",
    text: "Accept stablecoin payments through a clean QR-based checkout flow.",
  },
  {
    title: "Merchant dashboard",
    text: "Track revenue, products, transactions, and payment status in one place.",
  },
  {
    title: "Low-cost payments",
    text: "Designed for small businesses and micropayments with reduced fees.",
  },
  {
    title: "Inventory ready",
    text: "Manage products, stock levels, and customer checkout workflows.",
  },
];

const steps = [
  "Select products",
  "Generate Solana Pay QR",
  "Customer confirms payment",
  "Transaction appears in dashboard",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[rgb(11,17,32)] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute top-96 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/40 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 font-black">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-900/30">
              S
            </div>
            <span className="text-xl">SolPOS</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="#why" className="hover:text-white">
              Why SolPOS
            </a>
          </nav>

          <Link
            href="/dashboard"
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300 hover:bg-blue-500/20"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            Solana-powered retail payments
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Professional POS for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-300 bg-clip-text text-transparent">
              instant digital payments.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            SolPOS helps merchants accept USDC payments, manage products, track
            checkout activity, and reduce dependency on traditional payment
            processors.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-7 py-4 text-center font-bold shadow-xl shadow-blue-950/40 hover:opacity-90"
            >
              Launch Dashboard
            </Link>

            <a
              href="#features"
              className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-center font-bold hover:bg-white/10"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            <MiniStat value="<1s" label="Fast finality" />
            <MiniStat value="USDC" label="Stable payments" />
            <MiniStat value="QR" label="Checkout ready" />
          </div>
        </div>

        {/* Product mockup */}
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-blue-950/40 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Live checkout preview</p>
              <h2 className="text-2xl font-black">Merchant Register</h2>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              Active
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {products.map(([code, name, price]) => (
              <div
                key={name}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-black text-blue-200">
                  {code}
                </div>
                <p className="mt-4 font-bold">{name}</p>
                <p className="text-xl font-black text-emerald-400">{price}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span>$6.90 USDC</span>
            </div>
            <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-3 text-center font-black text-slate-950">
              Generate Payment QR
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-4xl font-black">
          Built for modern merchants
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          A clean, professional payment experience for retail stores, cafes,
          events, and small businesses.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-500/50"
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-blue-400 to-emerald-300" />
              <h3 className="text-xl font-black">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="text-4xl font-black">How SolPOS works</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-950/80 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 font-black text-blue-300">
                  {index + 1}
                </div>
                <p className="font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <InfoCard
            title="Lower payment friction"
            text="Customers can pay quickly using wallet-based checkout instead of long card processing flows."
          />
          <InfoCard
            title="Designed for small values"
            text="SolPOS is built around micropayments, where traditional fees can make small payments inefficient."
          />
          <InfoCard
            title="Merchant-first dashboard"
            text="Sales, product inventory, checkout, and transaction history are organized in one interface."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <h2 className="text-4xl font-black">Start accepting modern payments</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Open the dashboard and test the SolPOS merchant checkout experience.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-4 font-black text-slate-950 shadow-xl shadow-cyan-950/40 hover:opacity-90"
        >
          Open SolPOS Dashboard
        </Link>
      </section>

      <footer className="relative z-10 border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-400">
        © 2026 SolPOS — Built on Solana
      </footer>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="text-2xl font-black text-blue-300">{title}</h3>
      <p className="mt-3 text-slate-400">{text}</p>
    </div>
  );
}