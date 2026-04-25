import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { encodeURL, findReference, validateTransfer } from "@solana/pay";
import BigNumber from "bignumber.js";
import { USDC_MINT, USDC_DECIMALS } from "./constants";

export interface PaymentRequest {
  recipient: PublicKey;
  amount: BigNumber;
  reference: PublicKey;
  label: string;
  message: string;
  url: URL;
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
 * The reference keypair is how we later detect the transaction on-chain.
 */
export function createPaymentRequest(
  recipient: PublicKey,
  amountUsd: number,
  label = "Solana POS",
  message = "Payment"
): PaymentRequest {
  const reference = Keypair.generate().publicKey;
  const amount = new BigNumber(amountUsd.toFixed(USDC_DECIMALS));

  const url = encodeURL({
    recipient,
    amount,
    splToken: USDC_MINT,
    reference,
    label,
    message,
  });

  return { recipient, amount, reference, label, message, url };
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
    } catch {
      // FindReferenceError means not found yet — keep polling
      await delay(1000);
    }
  }
  throw new Error("Payment timeout — no transaction detected within 2 minutes");
}

/**
 * Validates that the confirmed transaction sent the correct amount to the right recipient.
 */
export async function confirmPayment(
  connection: Connection,
  signature: string,
  recipient: PublicKey,
  amount: BigNumber
): Promise<void> {
  await validateTransfer(
    connection,
    signature,
    {
      recipient,
      amount,
      splToken: USDC_MINT,
    },
    { commitment: "confirmed" }
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
