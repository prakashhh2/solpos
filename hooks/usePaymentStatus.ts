"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/solana";
import { waitForPayment, confirmPayment } from "@/lib/solanaPay";
import { PaymentState } from "@/lib/types";
import BigNumber from "bignumber.js";

interface UsePaymentStatusOptions {
  reference: PublicKey | null;
  recipient: PublicKey | null;
  amount: number;
  enabled: boolean;
  nativeSOL?: boolean;
}

export function usePaymentStatus({
  reference,
  recipient,
  amount,
  enabled,
  nativeSOL = false,
}: UsePaymentStatusOptions) {
  const [state, setState] = useState<PaymentState>({
    status: "idle",
    signature: null,
    error: null,
  });
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ status: "idle", signature: null, error: null });
  }, []);

  useEffect(() => {
    if (!enabled || !reference || !recipient) return;

    abortRef.current = false;
    setState({ status: "waiting", signature: null, error: null });

    const connection = getConnection();

    (async () => {
      try {
        const signature = await waitForPayment(connection, reference);
        if (abortRef.current) return;

        await confirmPayment(
          connection,
          signature,
          recipient,
          new BigNumber(amount.toFixed(6)),
          nativeSOL
        );
        if (abortRef.current) return;

        setState({ status: "confirmed", signature, error: null });
      } catch (err) {
        if (abortRef.current) return;
        const message = err instanceof Error ? err.message : "Payment failed";
        setState({ status: "failed", signature: null, error: message });
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, [enabled, reference, recipient, amount, nativeSOL]);

  return { ...state, reset };
}
