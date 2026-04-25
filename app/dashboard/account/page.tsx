"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction as SolanaTx } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { toast } from "sonner";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { useSolPrice } from "@/hooks/useSolPrice";
import { useTransactions } from "@/hooks/useTransactions";
import { USDC_MINT, USDC_DECIMALS, SOLANA_NETWORK } from "@/lib/constants";
import { formatUSD, formatUSDC, explorerAddressUrl, truncateAddress, copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";

const EXCHANGES = [
  { name: "Coinbase", url: "https://coinbase.com", icon: "🔵" },
  { name: "Kraken", url: "https://kraken.com", icon: "🐙" },
  { name: "Binance", url: "https://binance.com", icon: "🟡" },
];

type WithdrawStep = "idle" | "confirm" | "sending" | "done";

export default function AccountPage() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { usdc, sol, loading, error, refresh } = useUSDCBalance();
  const { usd: solPrice, loading: priceLoading } = useSolPrice();
  const { transactions } = useTransactions();

  const [destAddress, setDestAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [step, setStep] = useState<WithdrawStep>("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [addrError, setAddrError] = useState("");

  // POS stats from transaction context
  const confirmed = transactions.filter((t) => t.status === "confirmed");
  const totalRevenue = confirmed.reduce((s, t) => s + t.amount, 0);
  const solanaTxs = confirmed.filter((t) => t.payment_method === "solana" || !t.payment_method);
  const solanaRevenue = solanaTxs.reduce((s, t) => s + t.amount, 0);

  const parsedAmount = parseFloat(withdrawAmount);
  const amountValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= usdc;

  function validateAddress(addr: string): boolean {
    try { new PublicKey(addr); return true; } catch { return false; }
  }

  async function handleWithdraw() {
    if (!publicKey || !sendTransaction) return;
    const addr = destAddress.trim();
    if (!validateAddress(addr)) { setAddrError("Invalid Solana address"); return; }
    if (!amountValid) { toast.error("Invalid amount"); return; }

    setStep("sending");
    setTxSig(null);
    try {
      const destination = new PublicKey(addr);
      const sourceAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const destAta = await getAssociatedTokenAddress(USDC_MINT, destination);

      const lamports = BigInt(Math.round(parsedAmount * Math.pow(10, USDC_DECIMALS)));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new SolanaTx();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Create destination ATA if it doesn't exist yet
      const destAtaInfo = await getAccount(connection, destAta).catch(() => null);
      if (!destAtaInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,   // payer
            destAta,
            destination,
            USDC_MINT
          )
        );
      }

      tx.add(
        createTransferCheckedInstruction(
          sourceAta,
          USDC_MINT,
          destAta,
          publicKey,
          lamports,
          USDC_DECIMALS
        )
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      setTxSig(signature);
      setStep("done");
      refresh();
      toast.success(`Sent ${formatUSDC(parsedAmount)} successfully!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction failed");
      setStep("idle");
    }
  }

  if (!connected || !publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
        <span className="text-5xl">🔒</span>
        <p className="text-base font-medium text-zinc-400">Connect your wallet to view account</p>
        <p className="text-sm">Use the Connect Wallet button in the top-right corner</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Merchant Account</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Wallet balance & USDC withdrawal</p>
      </div>

      {/* Wallet address */}
      <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9945FF]/20 flex items-center justify-center text-lg">◎</div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Merchant Wallet</p>
            <p className="font-mono text-sm text-white">{truncateAddress(publicKey.toBase58(), 12)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={explorerAddressUrl(publicKey.toBase58())}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            ↗ Explorer
          </a>
          <button
            onClick={() => { copyToClipboard(publicKey.toBase58()); toast.success("Address copied"); }}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors disabled:opacity-50"
          >
            {loading ? "⟳" : "↺ Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
          ⚠ {error}
        </div>
      )}

      {/* SOL price ticker */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/25 w-fit">
        <span className="text-[#9945FF] text-sm font-bold">◎ SOL</span>
        <span className="text-white text-sm font-semibold">
          {priceLoading ? "—" : formatUSD(solPrice)}
        </span>
        <span className="text-zinc-500 text-xs">live price</span>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BalanceCard
          label="USDC Balance"
          value={loading ? "—" : formatUSDC(usdc)}
          sub={`≈ ${formatUSD(usdc)} (1:1 USD)`}
          accent="text-[#14F195]"
          icon="💵"
        />
        <BalanceCard
          label="SOL Balance"
          value={loading ? "—" : `${sol.toFixed(4)} SOL`}
          sub={
            priceLoading || !solPrice
              ? "Fetching price…"
              : `≈ ${formatUSD(sol * solPrice)}`
          }
          accent="text-[#9945FF]"
          icon="◎"
        />
        <BalanceCard
          label="POS Revenue"
          value={formatUSD(totalRevenue)}
          sub={`${confirmed.length} confirmed sales`}
          accent="text-blue-400"
          icon="📈"
        />
      </div>

      {/* Revenue breakdown */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">Revenue Breakdown</h2>
        <div className="space-y-2">
          {[
            { label: "Solana Pay (USDC)", icon: "◎", color: "text-[#9945FF]", value: solanaRevenue, count: solanaTxs.length },
            { label: "Card payments", icon: "💳", color: "text-blue-400", value: confirmed.filter(t => t.payment_method === "card").reduce((s, t) => s + t.amount, 0), count: confirmed.filter(t => t.payment_method === "card").length },
            { label: "Cash payments", icon: "💵", color: "text-emerald-400", value: confirmed.filter(t => t.payment_method === "cash").reduce((s, t) => s + t.amount, 0), count: confirmed.filter(t => t.payment_method === "cash").length },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm", row.color)}>{row.icon}</span>
                <span className="text-sm text-zinc-300">{row.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-white">{formatUSD(row.value)}</span>
                <span className="text-xs text-zinc-500 ml-2">({row.count} txns)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw to Bank */}
      <div className="glass rounded-2xl p-5 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Withdraw USDC to Bank</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Send your USDC to a crypto exchange, then convert to your local currency and withdraw to your bank account.
          </p>
        </div>

        {step === "done" && txSig ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#14F195]/15 flex items-center justify-center text-3xl">✓</div>
            <p className="text-[#14F195] font-semibold">Transfer Sent!</p>
            <p className="text-sm text-zinc-400">
              {formatUSDC(parsedAmount)} sent to {truncateAddress(destAddress, 8)}
            </p>
            <a
              href={`https://explorer.solana.com/tx/${txSig}${SOLANA_NETWORK !== "mainnet-beta" ? "?cluster=devnet" : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#9945FF] hover:text-[#b070ff] underline"
            >
              ↗ View on Explorer
            </a>
            <button
              onClick={() => { setStep("idle"); setWithdrawAmount(""); setDestAddress(""); setTxSig(null); }}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors"
            >
              New Withdrawal
            </button>
          </div>
        ) : (
          <>
            {/* Recommended exchanges */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Step 1 — Get your exchange deposit address</p>
              <div className="flex gap-2 flex-wrap">
                {EXCHANGES.map((ex) => (
                  <a
                    key={ex.name}
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
                  >
                    {ex.icon} {ex.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Step 2 — Enter withdrawal details</p>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Destination Wallet Address</label>
                <input
                  value={destAddress}
                  onChange={(e) => { setDestAddress(e.target.value); setAddrError(""); }}
                  placeholder="Paste your exchange USDC deposit address"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 text-sm font-mono focus:outline-none focus:border-[#9945FF] focus:ring-1 focus:ring-[#9945FF]/30"
                />
                {addrError && <p className="text-xs text-red-400 mt-1">{addrError}</p>}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Amount (USDC)
                  <span className="ml-2 text-zinc-600">Available: {formatUSDC(usdc)}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#9945FF] focus:ring-1 focus:ring-[#9945FF]/30"
                  />
                  <button
                    onClick={() => setWithdrawAmount(usdc.toFixed(2))}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {step === "confirm" ? (
                <div className="space-y-3 pt-1">
                  <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-sm text-amber-300 space-y-1">
                    <p className="font-semibold">Confirm withdrawal</p>
                    <p className="text-xs text-amber-400">
                      Sending <strong>{formatUSDC(parsedAmount)}</strong> to{" "}
                      <strong className="font-mono">{truncateAddress(destAddress.trim(), 8)}</strong>
                    </p>
                    <p className="text-xs text-amber-500">This action cannot be undone.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep("idle")}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdraw}
                      className="flex-1 py-2.5 rounded-xl bg-[#14F195] hover:bg-[#0fd484] text-black font-bold text-sm transition-colors"
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              ) : step === "sending" ? (
                <div className="flex items-center justify-center gap-3 py-4 text-zinc-400 text-sm">
                  <div className="w-4 h-4 border-2 border-[#9945FF] border-t-transparent rounded-full animate-spin" />
                  Sending transaction…
                </div>
              ) : (
                <button
                  onClick={() => {
                    const addr = destAddress.trim();
                    if (!validateAddress(addr)) { setAddrError("Invalid Solana address"); return; }
                    if (!amountValid) { toast.error("Enter a valid amount"); return; }
                    setStep("confirm");
                  }}
                  disabled={!amountValid || !destAddress.trim()}
                  className="w-full py-3 rounded-xl bg-[#9945FF] hover:bg-[#7d35d4] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                >
                  Withdraw {amountValid ? formatUSDC(parsedAmount) : "USDC"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Network note */}
      <p className="text-xs text-zinc-600 text-center">
        Network: Solana {SOLANA_NETWORK === "mainnet-beta" ? "Mainnet" : "Devnet"} ·
        Transactions are final and irreversible once confirmed.
      </p>
    </div>
  );
}

function BalanceCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string; sub: string | React.ReactNode; accent: string; icon: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={cn("text-2xl font-bold", accent)}>{value}</p>
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}
