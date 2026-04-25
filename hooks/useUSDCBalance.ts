"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { USDC_MINT, USDC_DECIMALS } from "@/lib/constants";

export interface WalletBalance {
  usdc: number;
  sol: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useUSDCBalance(): WalletBalance {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [usdc, setUsdc] = useState(0);
  const [sol, setSol] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!publicKey) { setUsdc(0); setSol(0); return; }
    setLoading(true);
    setError(null);
    try {
      const [lamports, ata] = await Promise.all([
        connection.getBalance(publicKey),
        getAssociatedTokenAddress(USDC_MINT, publicKey),
      ]);

      setSol(lamports / LAMPORTS_PER_SOL);

      const tokenAccount = await connection.getTokenAccountBalance(ata).catch(() => null);
      setUsdc(tokenAccount ? Number(tokenAccount.value.amount) / Math.pow(10, USDC_DECIMALS) : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => { fetch(); }, [fetch]);

  return { usdc, sol, loading, error, refresh: fetch };
}
