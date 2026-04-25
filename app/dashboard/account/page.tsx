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
import {
  formatUSD,
  formatUSDC,
  explorerAddressUrl,
  truncateAddress,
  copyToClipboard,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const EXCHANGES = [
  { name: "Coinbase", url: "https://coinbase.com" },
  { name: "Kraken", url: "https://kraken.com" },
  { name: "Binance", url: "https://binance.com" },
];

const btnPrimary =
  "w-full py-3 rounded-xl bg-[#9945FF] hover:bg-[#7d35d4] text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed";

const btnSecondary =
  "px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors";

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

  const confirmed = transactions.filter((t) => t.status === "confirmed");
  const totalRevenue = confirmed.reduce((s, t) => s + t.amount, 0);
  const solanaTxs = confirmed.filter(
    (t) => t.payment_method === "solana" || !t.payment_method
  );
  const solanaRevenue = solanaTxs.reduce((s, t) => s + t.amount, 0);

  const parsedAmount = parseFloat(withdrawAmount);
  const amountValid =
    !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= usdc;

  function validateAddress(addr: string): boolean {
    try {
      new PublicKey(addr);
      return true;
    } catch {
      return false;
    }
  }

  async function handleWithdraw() {
    if (!publicKey || !sendTransaction) return;

    const addr = destAddress.trim();
    if (!validateAddress(addr)) {
      setAddrError("Invalid Solana address");
      return;
    }
    if (!amountValid) {
      toast.error("Invalid amount");
      return;
    }

    setStep("sending");
    setTxSig(null);

    try {
      const destination = new PublicKey(addr);
      const sourceAta = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );
      const destAta = await getAssociatedTokenAddress(
        USDC_MINT,
        destination
      );

      const lamports = BigInt(
        Math.round(parsedAmount * Math.pow(10, USDC_DECIMALS))
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const tx = new SolanaTx();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const destAtaInfo = await getAccount(connection, destAta).catch(
        () => null
      );

      if (!destAtaInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
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

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      setTxSig(signature);
      setStep("done");
      refresh();

      toast.success(`Sent ${formatUSDC(parsedAmount)} successfully!`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Transaction failed"
      );
      setStep("idle");
    }
  }

  if (!connected || !publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
        <p className="text-base text-zinc-400">
          Connect your wallet to continue
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Merchant Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage funds, track revenue, withdraw instantly
        </p>
      </div>

      {/* WALLET HERO */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#9945FF]/20 to-black border border-white/10 shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs text-zinc-400">Merchant Wallet</p>
          <p className="text-lg font-mono text-white mt-1">
            {truncateAddress(publicKey.toBase58(), 14)}
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={explorerAddressUrl(publicKey.toBase58())}
            target="_blank"
            className={btnSecondary}
          >
            Explorer
          </a>
          <button
            onClick={() => {
              copyToClipboard(publicKey.toBase58());
              toast.success("Copied");
            }}
            className={btnSecondary}
          >
            Copy
          </button>
        </div>
      </div>

      {/* USDC HERO BALANCE */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#14F195]/10 to-zinc-900/80 border border-[#14F195]/20 shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium mb-1">
              USDC Balance
            </p>
            {loading ? (
              <div className="h-12 w-40 rounded-lg bg-zinc-800 animate-pulse" />
            ) : (
              <p className="text-5xl font-bold text-[#14F195] tracking-tight">
                {formatUSDC(usdc)}
              </p>
            )}
            <p className="text-sm text-zinc-400 mt-2">
              {loading ? "—" : `≈ ${formatUSD(usdc)} USD`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-[#14F195]/10 border border-[#14F195]/25 text-xs text-[#14F195] font-medium">
              USD Coin · USDC
            </span>
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
            >
              {loading ? "Refreshing…" : "Refresh balance"}
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY STATS */}
      <div className="grid md:grid-cols-2 gap-5">
        <BalanceCard
          label="SOL Balance"
          labelSub="Used for network fees only"
          value={loading ? "—" : `${sol.toFixed(4)} SOL`}
          sub={priceLoading ? "Loading…" : `≈ ${formatUSD(sol * solPrice)}`}
          accent="text-zinc-300"
        />
        <BalanceCard
          label="Total Revenue"
          labelSub={`${confirmed.length} confirmed transactions`}
          value={formatUSD(totalRevenue)}
          sub="across all payment methods"
          accent="text-blue-400"
        />
      </div>

      {/* REVENUE BREAKDOWN */}
      <div className="rounded-2xl p-6 bg-zinc-900/60 border border-white/5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">
          Revenue Breakdown
        </h2>

        {[
          {
            label: "Solana Pay",
            value: solanaRevenue,
            color: "bg-[#9945FF]",
          },
          {
            label: "Card",
            value: confirmed
              .filter((t) => t.payment_method === "card")
              .reduce((s, t) => s + t.amount, 0),
            color: "bg-blue-400",
          },
          {
            label: "Cash",
            value: confirmed
              .filter((t) => t.payment_method === "cash")
              .reduce((s, t) => s + t.amount, 0),
            color: "bg-emerald-400",
          },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">{row.label}</span>
              <span className="text-white">
                {formatUSD(row.value)}
              </span>
            </div>

            <div className="w-full h-2 bg-zinc-800 rounded-full mt-1">
              <div
                className={`${row.color} h-full rounded-full`}
                style={{
                  width: `${
                    totalRevenue
                      ? (row.value / totalRevenue) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* WITHDRAW */}
      <div className="rounded-2xl p-6 bg-zinc-900/60 border border-white/5 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-300">
          Withdraw USDC
        </h2>

        <input
          placeholder="Destination address"
          value={destAddress}
          onChange={(e) => setDestAddress(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-[#9945FF] focus:ring-2 focus:ring-[#9945FF]/30"
        />

        <input
          placeholder="Amount"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-[#9945FF] focus:ring-2 focus:ring-[#9945FF]/30"
        />

        <button
          onClick={handleWithdraw}
          disabled={!amountValid}
          className={btnPrimary}
        >
          Withdraw
        </button>

        <p className="text-xs text-zinc-500 text-center">
          Secured by Solana · Instant settlement
        </p>
      </div>

    </div>
  );
}

function BalanceCard({
  label,
  labelSub,
  value,
  sub,
  accent,
}: {
  label: string;
  labelSub?: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl p-5 bg-zinc-900/60 border border-white/5 hover:border-[#9945FF]/40 hover:shadow-lg transition-all">
      <p className="text-xs text-zinc-500">{label}</p>
      {labelSub && <p className="text-[10px] text-zinc-600 mb-1">{labelSub}</p>}
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-xs text-zinc-500">{sub}</p>
    </div>
  );
}