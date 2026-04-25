# ⚡ Solana POS — Accept USDC Payments Instantly

A production-grade, mobile-first Point-of-Sale terminal built on Solana Pay.  
Merchants enter an amount, show a QR code, and the customer pays in USDC — confirmed in under 1 second.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (Next.js 14)                    │
│                                                              │
│  ┌────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │  Landing   │──▶│  Dashboard   │──▶│  Charge / QR Page │  │
│  │  (/)       │   │  (/dashboard)│   │  (/charge)        │  │
│  └────────────┘   └──────────────┘   └─────────┬─────────┘  │
│                                                 │            │
│  ┌──────────────────────────────────────────────┼──────────┐ │
│  │  Solana Wallet Adapter (Phantom / Solflare)  │          │ │
│  └──────────────────────────────────────────────┘          │ │
│                                                             │ │
│  ┌────────────────────────┐   ┌────────────────────────┐   │ │
│  │  TransactionContext    │   │  usePaymentStatus hook │   │ │
│  │  (in-memory store)     │   │  (polls Solana RPC)    │   │ │
│  └────────────────────────┘   └────────────────────────┘   │ │
└──────────────────────────────────────────────────────────────┘
                         │ @solana/pay
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   SOLANA DEVNET / MAINNET                    │
│                                                              │
│   encodeURL() → QR Code                                      │
│   findReference() → detect tx                               │
│   validateTransfer() → confirm amount + recipient            │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Install dependencies

```bash
cd solana-pos
npm install
```

### 2. Configure environment

`.env.local` is pre-configured for devnet. No changes needed for local testing:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## How to Get Devnet SOL and USDC

### Get Devnet SOL (for transaction fees)

```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

Or use the web faucet: https://faucet.solana.com

### Get Devnet USDC

Use the SPL Token Faucet:
```
https://spl-token-faucet.com/?token-name=USDC-Dev
```

Mint address: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

---

## Full Payment Flow Test

1. Connect two Phantom wallets (merchant + customer)
2. Fund **customer wallet** with 10+ devnet USDC
3. Open the app, connect **merchant wallet**
4. Click **New Sale**, enter `$5.00`, click **Charge**
5. Scan the QR code with the customer's Phantom mobile app
6. Approve the transaction — watch POS confirm in ~800ms with confetti

---

## Demo Script (90 Seconds)

```
0:00  Open localhost:3000
      "Solana POS — a Web3 point-of-sale terminal."

0:05  Connect Phantom wallet
      "Merchant wallet connected instantly."

0:15  Dashboard shows seeded transaction history
      "Today's revenue, total transactions, average sale — all on-chain."

0:25  Click "New Sale" → type $24.99
      "Any dollar amount via the keypad."

0:35  Toggle "Auto-Split" ON
      "80% owner, 10% employee tip, 10% tax — automatic revenue split."

0:40  Click "Charge $24.99" → QR code appears
      "Customer scans with Phantom or Solflare."

0:50  Complete payment on second device
      Confetti fires, split breakdown shown
      "Confirmed in under 1 second. Zero intermediaries."

1:05  Dashboard updates — new transaction at top
      "Live transaction feed with Solana Explorer links."

1:15  Open History → Export CSV
      "Full audit trail, one-click CSV export."

1:25  "Next.js 14 + @solana/pay. Open source. Production-ready."
```

---

## Known Issues

- **RPC rate limits**: Public devnet is throttled. Use Helius/QuickNode for demos.
- **SSR + wallet adapter**: `WalletProvider` must be `"use client"`. Do not import in Server Components.
- **Demo mode**: Enable in Settings → Demo Mode to bypass real Solana calls (great for stage demos with bad WiFi).
- **USDC decimals**: Devnet USDC = 6 decimal places. `validateTransfer` handles the conversion.

---

## Project Structure

```
app/
  layout.tsx              Root layout — providers + Toaster
  page.tsx                Landing / wallet connect
  dashboard/
    layout.tsx            Nav shell + auth guard
    page.tsx              Dashboard with stats + feed
    charge/page.tsx       Keypad → QR → confetti success
    history/page.tsx      Full history + date filter + CSV
    settings/page.tsx     Wallet, network, split config
  api/
    create-payment/       POST: generate Solana Pay URL
    verify-payment/       POST: verify on-chain transfer

components/
  WalletProvider.tsx      Phantom + Solflare adapter setup
  Keypad.tsx              Numeric keypad
  QRDisplay.tsx           QR code + payment state + confetti
  StatsCards.tsx          Revenue / transactions / average
  TransactionFeed.tsx     Transaction table

context/
  TransactionContext.tsx  In-memory store + computed stats

hooks/
  usePaymentStatus.ts     findReference + validateTransfer loop
  useTransactions.ts      TransactionContext wrapper

lib/
  constants.ts            USDC mint, network, poll intervals
  solana.ts               Connection singleton
  solanaPay.ts            Payment request + polling helpers
  types.ts                TypeScript interfaces
  seedData.ts             10 demo transactions for dashboard
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Solana | @solana/web3.js + @solana/pay + @solana/spl-token |
| Wallets | Phantom, Solflare via @solana/wallet-adapter |
| QR Code | qrcode.react |
| Confetti | canvas-confetti |
| Toasts | sonner |
| Language | TypeScript strict mode |
