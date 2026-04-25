# SolPOS — Solana Point-of-Sale for Small Merchants

A mobile-first POS terminal that lets any merchant accept USDC payments instantly via Solana Pay. No card reader, no bank account, no middleman — just a QR code and a Solana wallet.

---

## The Problem: Card Fees Kill Small Sales

Every time a customer pays with a card, the payment processor (Stripe, Square, etc.) takes a cut:

**Stripe fee: 2.9% + $0.30 per transaction**

| Sale Amount | Card Fee | You Keep | Fee % |
|-------------|----------|----------|-------|
| $1.00       | $0.33    | $0.67    | 33%   |
| $2.50       | $0.37    | $2.13    | 15%   |
| $5.00       | $0.45    | $4.55    | 9%    |
| $20.00      | $0.88    | $19.12   | 4.4%  |

For a coffee shop, street vendor, or food stall doing dozens of small sales a day, this adds up fast. A $1.50 tip jar? The processor keeps 22 cents — nearly 15%.

**Solana Pay fee: ~$0.00025 flat — always**

| Sale Amount | Solana Fee | You Keep | Fee % |
|-------------|------------|----------|-------|
| $1.00       | $0.00025   | $0.9998  | 0.025%|
| $2.50       | $0.00025   | $2.4998  | 0.01% |
| $5.00       | $0.00025   | $4.9998  | 0.005%|
| $20.00      | $0.00025   | $19.9998 | 0.001%|

SolPOS makes Solana Pay accessible to any merchant — no technical knowledge required.

---

## What SolPOS Does

**Accept payments** — Cashier enters an amount, a QR code appears. Customer scans with Phantom or Solflare. Payment confirms in under 1 second.

**Cart builder** — Add products by name (with AI lookup via Gemini), build a full order, tap Charge. Items are recorded on each transaction for analytics.

**Checkout screen** — Real-time fee comparison shows the cashier exactly how much they lose to card fees vs. keeping it all with Solana Pay.

**Auto-split payments** — Toggle on revenue splitting: 80% owner, 10% employee tip, 10% tax. Breakdown shows on the confirmation screen.

**Transaction history** — Full log of every payment with status, method, items, and Solana Explorer links. Filter by date, export to CSV.

**Refunds** — Issue on-chain USDC refunds to a customer wallet, or record manual refunds for cash/card. Refunded transactions are marked in the history.

**Account page** — Shows your USDC balance prominently (the currency you're earning), with SOL balance secondary (used only for network fees). Withdraw USDC to any wallet.

**Daily report** — One click generates a Gemini AI analysis of the day: performance score, revenue narrative, top products, payment method breakdown, hourly revenue chart, what went well, and a concrete action plan for tomorrow.

**Demo mode** — On devnet, the QR requests 0.001 SOL instead of USDC (wallets always recognise SOL — no "unknown token" warning). The POS records the full USD amount as if it were USDC. Lets you demo the full flow without devnet USDC.

---

## Quick Start

### 1. Install dependencies

```bash
cd solana-pos
npm install
```

### 2. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com).

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Full Payment Flow (Devnet Demo)

1. Connect a Phantom wallet (your merchant wallet)
2. Click **New Sale** on the dashboard
3. Enter an amount (e.g. `$4.99`) — notice the card fee warning showing you'd lose $0.44
4. Click **Charge** — a QR code appears
5. Scan with Phantom mobile on devnet, approve a tiny 0.001 SOL transfer
6. Watch the POS confirm with confetti — transaction recorded as $4.99 USDC

No devnet USDC required. The SOL transfer is symbolic; the POS tracks the full dollar amount.

---

## Get Devnet SOL (for network fees)

```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

Or use the web faucet: https://faucet.solana.com

---

## Project Structure

```
app/
  page.tsx                  Landing / wallet connect
  dashboard/
    layout.tsx              Top nav + mobile bottom nav
    page.tsx                Dashboard: stats, transaction feed, cart
    charge/page.tsx         Keypad only (standalone charge)
    history/page.tsx        Full history, date filter, CSV export, refunds
    report/page.tsx         Gemini AI daily report
    account/page.tsx        USDC balance, SOL balance, withdraw
    settings/page.tsx       Demo mode, split config, network info
  api/
    daily-report/route.ts   POST: Gemini AI end-of-day analysis
    lookup-product/route.ts POST: Gemini AI product name lookup
    analytics/route.ts      POST: Gemini AI sales analytics

components/
  Keypad.tsx                Numeric keypad with cart builder
  QRDisplay.tsx             QR code + payment state machine + confetti
  SolanaCheckout.tsx        Cart checkout with fee comparison
  RefundModal.tsx           On-chain USDC refund or record-only
  TransactionFeed.tsx       Transaction table with status badges
  StatsCards.tsx            Revenue / transactions / average stats
  CameraScanner.tsx         Camera-based product scanner

context/
  TransactionContext.tsx    In-memory + localStorage transaction store
  ThemeContext.tsx          Light/dark theme

hooks/
  usePaymentStatus.ts       Polls Solana RPC for payment confirmation
  useTransactions.ts        TransactionContext wrapper

lib/
  constants.ts              USDC mint, network, fee config
  solanaPay.ts              Payment requests, polling, confirmation
  types.ts                  TypeScript interfaces
  utils.ts                  formatUSD, truncateAddress, cn
  seedData.ts               Demo transactions for first load
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Solana | @solana/web3.js, @solana/pay, @solana/spl-token |
| Wallets | Phantom, Solflare via @solana/wallet-adapter |
| AI | Google Gemini (gemma-3-4b-it) via @google/generative-ai |
| QR Code | qrcode.react |
| Confetti | canvas-confetti |
| Toasts | sonner |
| Language | TypeScript strict mode |

---

## Known Issues

- **RPC rate limits**: Public devnet RPC is throttled. For a live demo, use Helius or QuickNode.
- **Demo mode devnet**: SOL transfer is symbolic — production mainnet uses real USDC. Switch `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta` for production.
- **SSR + wallet adapter**: `WalletProvider` must be `"use client"`. Do not import in Server Components.
