import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getConnection } from "@/lib/solana";
import { confirmPayment } from "@/lib/solanaPay";
import { findReference } from "@solana/pay";
import { USDC_DECIMALS } from "@/lib/constants";

export interface VerifyPaymentBody {
  reference: string;
  recipient: string;
  amount: number;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  signature?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyPaymentBody = await req.json();
    const { reference, recipient, amount } = body;

    if (!reference || !recipient || !amount) {
      return NextResponse.json(
        { error: "reference, recipient, and amount are required" },
        { status: 400 }
      );
    }

    let referenceKey: PublicKey;
    let recipientKey: PublicKey;
    try {
      referenceKey = new PublicKey(reference);
      recipientKey = new PublicKey(recipient);
    } catch {
      return NextResponse.json(
        { error: "Invalid public key" },
        { status: 400 }
      );
    }

    const connection = getConnection();

    // Try to find a transaction with this reference
    let signature: string;
    try {
      const signatureInfo = await findReference(connection, referenceKey, {
        finality: "confirmed",
      });
      signature = signatureInfo.signature;
    } catch {
      // Not found yet
      const response: VerifyPaymentResponse = {
        verified: false,
        error: "Transaction not found yet",
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Validate the transfer details
    try {
      await confirmPayment(
        connection,
        signature,
        recipientKey,
        new BigNumber(amount.toFixed(USDC_DECIMALS))
      );
    } catch (err) {
      const response: VerifyPaymentResponse = {
        verified: false,
        error: err instanceof Error ? err.message : "Validation failed",
      };
      return NextResponse.json(response, { status: 200 });
    }

    const response: VerifyPaymentResponse = {
      verified: true,
      signature,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[verify-payment]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
