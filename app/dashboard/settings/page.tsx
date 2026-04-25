"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { useTransactionContext } from "@/context/TransactionContext";
import { copyToClipboard, truncateAddress } from "@/lib/utils";
import { SOLANA_NETWORK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { publicKey } = useWallet();
  const { demoMode, setDemoMode, splitConfig, setSplitConfig } =
    useTransactionContext();
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">(
    SOLANA_NETWORK
  );

  const address = publicKey?.toBase58() ?? "";

  const handleCopyAddress = async () => {
    await copyToClipboard(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure your POS terminal</p>
      </div>

      {/* Merchant Wallet */}
      <SettingsSection title="Merchant Wallet">
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm text-zinc-300 truncate">
            {address || "No wallet connected"}
          </div>
          <button
            onClick={handleCopyAddress}
            disabled={!address}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium transition-all",
              copied
                ? "bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30"
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
            )}
            aria-label="Copy wallet address"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        {address && (
          <p className="text-xs text-zinc-600 mt-1">
            {truncateAddress(address, 8)}
          </p>
        )}
      </SettingsSection>

      {/* Demo Mode */}
      <SettingsSection title="Demo Mode">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300">Use mock data for presentation</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Payments auto-confirm in 3s, no real USDC needed
            </p>
          </div>
          <Toggle
            checked={demoMode}
            onChange={setDemoMode}
            aria-label="Toggle demo mode"
          />
        </div>
        {demoMode && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-[#9945FF]/10 border border-[#9945FF]/20">
            <p className="text-xs text-[#9945FF]">
              Demo mode is ON — all payments will simulate instantly
            </p>
          </div>
        )}
      </SettingsSection>

      {/* Auto-Split Payments */}
      <SettingsSection title="Auto-Split Payments">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-zinc-300">Enable revenue splitting</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automatically distribute payments across wallets
            </p>
          </div>
          <Toggle
            checked={splitConfig.enabled}
            onChange={(v) => setSplitConfig({ ...splitConfig, enabled: v })}
            aria-label="Toggle auto-split"
          />
        </div>

        {splitConfig.enabled && (
          <div className="space-y-3 pt-3 border-t border-white/8 animate-fade-in">
            <SplitRow
              label="Owner"
              pct={splitConfig.ownerPct}
              color="text-[#9945FF]"
              onPctChange={(v) => setSplitConfig({ ...splitConfig, ownerPct: v })}
            />
            <SplitRow
              label="Employee Tip"
              pct={splitConfig.employeePct}
              color="text-[#14F195]"
              onPctChange={(v) => setSplitConfig({ ...splitConfig, employeePct: v })}
            />
            <SplitRow
              label="Tax"
              pct={splitConfig.taxPct}
              color="text-zinc-400"
              onPctChange={(v) => setSplitConfig({ ...splitConfig, taxPct: v })}
            />

            <p className="text-xs text-zinc-600 text-right">
              Total:{" "}
              {splitConfig.ownerPct + splitConfig.employeePct + splitConfig.taxPct}%
              {splitConfig.ownerPct + splitConfig.employeePct + splitConfig.taxPct !==
                100 && (
                <span className="text-red-400 ml-1">(must equal 100%)</span>
              )}
            </p>
          </div>
        )}
      </SettingsSection>

      {/* Network */}
      <SettingsSection title="Network">
        <div className="flex gap-2">
          {(["devnet", "mainnet-beta"] as const).map((net) => (
            <button
              key={net}
              onClick={() => {
                setNetwork(net);
                if (net === "mainnet-beta") {
                  toast.warning(
                    "Mainnet requires updating NEXT_PUBLIC_SOLANA_NETWORK in .env.local and restarting."
                  );
                }
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                network === net
                  ? "bg-[#9945FF]/20 text-[#9945FF] border-[#9945FF]/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
              )}
              aria-pressed={network === net}
            >
              {net === "devnet" ? "Devnet" : "Mainnet"}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Current: <span className="text-zinc-400">{SOLANA_NETWORK}</span> (set
          via env var)
        </p>
      </SettingsSection>

      {/* Auto-convert SOL */}
      <SettingsSection title="Auto-Convert SOL to USDC">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300">Automatically swap SOL to USDC</p>
            <p className="text-xs text-zinc-500 mt-0.5">Coming soon — Jupiter integration</p>
          </div>
          <Toggle
            checked={false}
            onChange={() =>
              toast.info("Auto-convert coming soon via Jupiter!")
            }
            disabled
            aria-label="Toggle auto-convert (not yet available)"
          />
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-200",
        checked ? "bg-[#9945FF]" : "bg-zinc-700",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SplitRow({
  label,
  pct,
  color,
  onPctChange,
}: {
  label: string;
  pct: number;
  color: string;
  onPctChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("text-sm font-medium w-24", color)}>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onPctChange(Number(e.target.value))}
        className="flex-1 accent-[#9945FF]"
        aria-label={`${label} percentage`}
      />
      <span className="text-sm font-mono w-8 text-right text-zinc-300">
        {pct}%
      </span>
    </div>
  );
}
