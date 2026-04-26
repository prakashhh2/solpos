"use client";

import React from "react";
import Link from "next/link";

const feeRows = [
  { amount: "$0.50", stripe: "$0.31", stripeKeep: "$0.19", stripePct: "62%", sol: "$0.00025", solKeep: "$0.4998" },
  { amount: "$1.00", stripe: "$0.33", stripeKeep: "$0.67", stripePct: "33%", sol: "$0.00025", solKeep: "$0.9998" },
  { amount: "$2.50", stripe: "$0.37", stripeKeep: "$2.13", stripePct: "15%", sol: "$0.00025", solKeep: "$2.4998" },
  { amount: "$5.00", stripe: "$0.45", stripeKeep: "$4.55", stripePct: "9%",  sol: "$0.00025", solKeep: "$4.9998" },
];

const useCases = [
  { label: "Coffee shops", example: "$1.50 cup" },
  { label: "Street vendors", example: "$2 snack" },
  { label: "Tip jars", example: "$1 tip" },
  { label: "Market stalls", example: "$3 item" },
  { label: "Vending machines", example: "$0.75 drink" },
  { label: "Event tickets", example: "$5 entry" },
];

const features = [
  {
    title: "Zero fee on micro-sales",
    text: "A $1 Solana payment costs $0.00025. That same $1 through Stripe costs $0.33 in fees — 33% gone before you see it.",
  },
  {
    title: "QR checkout in seconds",
    text: "Cashier taps Charge, QR appears, customer scans with Phantom or Solflare. Confirmed in under 1 second.",
  },
  {
    title: "On-screen fee proof",
    text: "The checkout screen shows in real time how much a card would cost vs. how much you keep with Solana Pay.",
  },
  {
    title: "Full merchant dashboard",
    text: "Revenue, transactions, refunds, daily AI report, USDC balance, and one-click withdraw — all in one place.",
  },
];

const steps = [
  { n: "1", title: "Build the cart", body: "Add products by name. The AI looks up the price automatically." },
  { n: "2", title: "Tap Charge", body: "A Solana Pay QR code appears instantly. No card reader needed." },
  { n: "3", title: "Customer scans", body: "They scan with any Solana wallet — Phantom, Solflare, or Backpack." },
  { n: "4", title: "Confirmed in <1s", body: "Transaction hits the dashboard. You kept every cent." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[rgb(11,17,32)] text-white overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute top-96 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/40 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 font-black">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-900/30 text-white font-black">
              S
            </div>
            <span className="text-xl">SolPOS</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          </nav>

          <Link
            href="/dashboard"
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300 hover:bg-blue-500/20 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28">

        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="mb-6 inline-flex rounded-full border border-red-400/25 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-300">
            Stripe takes 33 cents of every $1 sale. Solana takes $0.00025.
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Card fees are{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              killing
            </span>{" "}
            small sales.{" "}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Solana fixes it.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-slate-300">
            SolPOS is a point-of-sale terminal built for micro-payments — the
            $1 coffees, $2 snacks, and $0.75 tips that card processors make
            mathematically unprofitable. Accept USDC with a QR code. Keep
            nearly 100% of every sale.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-center font-bold shadow-xl shadow-emerald-950/40 hover:opacity-90 transition-opacity text-slate-950"
            >
              Launch Dashboard
            </Link>
            <a
              href="#problem"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center font-bold hover:bg-white/10 transition-colors"
            >
              See the numbers
            </a>
          </div>

          <div className="mt-10 grid max-w-lg mx-auto grid-cols-3 gap-4">
            <MiniStat value="$0.00025" label="Flat fee per tx" accent="text-emerald-400" />
            <MiniStat value="<1s" label="Confirmation time" accent="text-blue-400" />
            <MiniStat value="100%" label="Revenue you keep" accent="text-[#9945FF]" />
          </div>
        </div>

        {/* Fee comparison hero card */}
        <div id="problem" className="rounded-[2rem] border border-white/10 bg-slate-900/70 backdrop-blur shadow-2xl shadow-blue-950/40 overflow-hidden">
          <div className="px-6 pt-7 pb-4 border-b border-white/8">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">The micro-payment problem</p>
            <h2 className="text-2xl font-black">What you actually keep after fees</h2>
            <p className="text-sm text-slate-400 mt-1">
              Stripe charges 2.9% + $0.30 per transaction. On small sales, the fixed $0.30 alone wipes out your margin.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sale</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-400 uppercase tracking-wide">Stripe fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-400 uppercase tracking-wide">You keep</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-300 uppercase tracking-wide">Lost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wide">Solana fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wide">You keep</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 font-black text-white text-base">{row.amount}</td>
                    <td className="px-6 py-4 text-red-400 font-mono">{row.stripe}</td>
                    <td className="px-6 py-4 text-red-300 font-mono">{row.stripeKeep}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-xs font-bold text-red-400">
                        {row.stripePct}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-mono">{row.sol}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-sm font-bold text-emerald-400">
                        {row.solKeep}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-emerald-500/5 border-t border-emerald-500/15 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300 font-medium">
              With SolPOS, a $1.00 sale costs <span className="font-black">$0.00025</span> — not $0.33. That is a <span className="font-black">1,300x</span> improvement on fees.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">
          Built for businesses where every cent counts
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {useCases.map(({ label, example }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2"
            >
              <span className="text-sm font-semibold text-white">{label}</span>
              <span className="text-xs text-slate-500">{example}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-4xl font-black">
          Everything a micro-payment terminal needs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          Designed specifically for small-value, high-frequency sales where
          traditional payment infrastructure doesn't work.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/30"
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
              <h3 className="text-lg font-black">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8">
          <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">How it works</div>
          <h2 className="text-4xl font-black">From order to confirmed in under 5 seconds</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="rounded-2xl bg-slate-950/80 p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/25 font-black text-emerald-400 text-sm">
                  {step.n}
                </div>
                <p className="font-black text-white">{step.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-blue-500/8 border border-blue-500/20 px-5 py-4">
            <p className="text-sm text-blue-300">
              <span className="font-bold">Devnet demo mode:</span> No real money needed. The POS requests a tiny symbolic SOL transfer — your wallet always recognises it, no "unknown token" warnings. Perfect for trying before going live.
            </p>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Ready to stop paying Stripe?</p>
        <h2 className="text-4xl font-black max-w-2xl mx-auto leading-tight">
          Keep the full amount of every{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            micro-payment you earn.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Open the dashboard, connect your Solana wallet, and make your first sale.
          No card reader. No processor. No 30-cent fee eating your margin.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-10 py-4 font-black text-slate-950 shadow-xl shadow-cyan-950/40 hover:opacity-90 transition-opacity"
        >
          Open SolPOS Dashboard
        </Link>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>Built on Solana</span>
          <span>·</span>
          <span>USDC stablecoin</span>
          <span>·</span>
          <span>$0.00025 per transaction</span>
          <span>·</span>
          <span>Open source</span>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SolPOS — Solana micro-payments for small merchants
      </footer>
    </main>
  );
}

function MiniStat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className={`text-xl font-black ${accent}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
