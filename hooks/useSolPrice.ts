"use client";

import { useState, useEffect } from "react";

interface SolPrice {
  usd: number;
  loading: boolean;
  error: string | null;
}

let _cached: { usd: number; fetchedAt: number } | null = null;
const CACHE_MS = 60_000;

export function useSolPrice(): SolPrice {
  const [usd, setUsd] = useState(_cached?.usd ?? 0);
  const [loading, setLoading] = useState(!_cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_cached && Date.now() - _cached.fetchedAt < CACHE_MS) {
      setUsd(_cached.usd);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
      .then((r) => r.json())
      .then((data) => {
        const price = data?.solana?.usd ?? 0;
        _cached = { usd: price, fetchedAt: Date.now() };
        setUsd(price);
        setError(null);
      })
      .catch(() => setError("Price unavailable"))
      .finally(() => setLoading(false));
  }, []);

  return { usd, loading, error };
}
