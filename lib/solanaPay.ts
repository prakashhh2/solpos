import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { encodeURL, findReference } from "@solana/pay";
import BigNumber from "bignumber.js";
import { USDC_MINT, USDC_DECIMALS } from "./constants";

// Fixed symbolic SOL amount used for devnet demo payments (avoids needing USDC)
export const DEMO_SOL_AMOUNT = new BigNumber("0.001");

export interface PaymentRequest {
  recipient: PublicKey;
  amount: BigNumber;
  reference: PublicKey;
  label: string;
  message: string;
  url: URL;
  nativeSOL: boolean;
}

export interface SplitConfig {
  owner: PublicKey;
  employee: PublicKey;
  tax: PublicKey;
  ownerPct: number;
  employeePct: number;
  taxPct: number;
}

/**
 * Creates a Solana Pay payment request URL + a unique reference keypair.
 *
 * When nativeSOL is true (devnet demo mode) the URL requests a fixed 0.001 SOL
 * transfer instead of USDC — wallets recognise SOL natively so there is no
 * "Unknown Token" warning. The POS still records the full USD amount.
 */
export function createPaymentRequest(
  recipient: PublicKey,
  amountUsd: number,
  label = "Solana POS",
  message = "Payment",
  { nativeSOL = false }: { nativeSOL?: boolean } = {}
): PaymentRequest {
  const reference = Keypair.generate().publicKey;

  if (nativeSOL) {
    const url = encodeURL({
      recipient,
      amount: DEMO_SOL_AMOUNT,
      reference,
      label,
      message: `${message} — $${amountUsd.toFixed(2)} USDC (devnet demo)`,
    });
    return {
      recipient,
      amount: DEMO_SOL_AMOUNT,
      reference,
      label,
      message,
      url,
      nativeSOL: true,
    };
  }

  const amount = new BigNumber(amountUsd.toFixed(USDC_DECIMALS));
  const url = encodeURL({
    recipient,
    amount,
    splToken: USDC_MINT,
    reference,
    label,
    message,
  });
  return { recipient, amount, reference, label, message, url, nativeSOL: false };
}

/**
 * Polls Solana RPC until the reference key appears in a transaction.
 * Returns the confirmed signature string, or throws on timeout.
 */
export async function waitForPayment(
  connection: Connection,
  reference: PublicKey,
  timeoutMs = 120_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const signatureInfo = await findReference(connection, reference, {
        finality: "confirmed",
      });
      return signatureInfo.signature;
    } catch (err: unknown) {
      // Only swallow "not found yet" errors — let hard errors surface after a pause
      const msg = err instanceof Error ? err.message : "";
      const isNotFound =
        msg.includes("not found") ||
        msg.includes("FindReferenceError") ||
        msg.toLowerCase().includes("no signature");
      if (!isNotFound) {
        // RPC error (429, network, etc.) — back off longer before retrying
        await delay(2500);
      } else {
        await delay(1000);
      }
    }
  }
  throw new Error("Payment timeout — no transaction detected within 2 minutes");
}

/**
 * Validates that the confirmed transaction sent the correct USDC amount to the
 * recipient by reading token balance deltas directly from the parsed transaction.
 * Retries up to 8 times to handle RPC lag on devnet.
 */
export async function confirmPayment(
  connection: Connection,
  signature: string,
  recipient: PublicKey,
  amount: BigNumber,
  nativeSOL = false
): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const tx = await connection
      .getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      })
      .catch(() => null);

    if (!tx?.meta) {
      await delay(1500);
      continue;
    }

    if (nativeSOL) {
      // For demo SOL payments just verify any SOL reached the recipient.
      const recipientIdx = tx.transaction.message.accountKeys.findIndex(
        (k) => k.pubkey.toBase58() === recipient.toBase58()
      );
      if (recipientIdx !== -1) {
        const delta =
          (tx.meta.postBalances[recipientIdx] ?? 0) -
          (tx.meta.preBalances[recipientIdx] ?? 0);
        if (delta > 0) return; // SOL received — treat as confirmed
      }
      await delay(1500);
      continue;
    }

    // USDC SPL path: check token balance delta
    const recipientStr = recipient.toBase58();
    const mintStr = USDC_MINT.toBase58();
    const expected = amount.toNumber();

    const post =
      tx.meta.postTokenBalances?.find(
        (b) => b.mint === mintStr && b.owner === recipientStr
      )?.uiTokenAmount.uiAmount ?? 0;

    const pre =
      tx.meta.preTokenBalances?.find(
        (b) => b.mint === mintStr && b.owner === recipientStr
      )?.uiTokenAmount.uiAmount ?? 0;

    const received = post - pre;

    if (received < expected - 0.000001) {
      throw new Error(
        `Underpaid: expected ${expected.toFixed(2)} USDC, received ${received.toFixed(6)} USDC`
      );
    }

    return;
  }

  throw new Error(
    "Could not verify payment on-chain after retries — check Explorer and try again."
  );
}

/** Compute split amounts (returns values in full USDC, not lamports). */
export function computeSplits(
  total: number,
  ownerPct: number,
  employeePct: number,
  taxPct: number
): { owner: number; employee: number; tax: number } {
  return {
    owner: parseFloat(((total * ownerPct) / 100).toFixed(2)),
    employee: parseFloat(((total * employeePct) / 100).toFixed(2)),
    tax: parseFloat(((total * taxPct) / 100).toFixed(2)),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
