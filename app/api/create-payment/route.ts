import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { createPaymentRequest } from "@/lib/solanaPay";

export interface CreatePaymentBody {
  recipient: string;
  amount: number;
  label?: string;
  message?: string;
}

export interface CreatePaymentResponse {
  url: string;
  reference: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePaymentBody = await req.json();
    const { recipient, amount, label, message } = body;

    if (!recipient || !amount) {
      return NextResponse.json(
        { error: "recipient and amount are required" },
        { status: 400 }
      );
    }

    if (amount <= 0 || amount > 1_000_000) {
      return NextResponse.json(
        { error: "amount must be between 0 and 1,000,000" },
        { status: 400 }
      );
    }

    let recipientKey: PublicKey;
    try {
      recipientKey = new PublicKey(recipient);
    } catch {
      return NextResponse.json(
        { error: "Invalid recipient address" },
        { status: 400 }
      );
    }

    const request = createPaymentRequest(
      recipientKey,
      amount,
      label ?? "Solana POS",
      message ?? `Payment of $${amount.toFixed(2)}`
    );

    const response: CreatePaymentResponse = {
      url: request.url.toString(),
      reference: request.reference.toBase58(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[create-payment]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
