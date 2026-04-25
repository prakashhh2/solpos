import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT, SOLANA_NETWORK } from "./constants";

let _connection: Connection | null = null;

/** Singleton connection — reused across the app to avoid rate-limit churn. */
export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_ENDPOINT, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 30_000,
    });
  }
  return _connection;
}

/** Reset singleton (used when the user changes network in settings). */
export function resetConnection(): void {
  _connection = null;
}

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export { SOLANA_NETWORK };
