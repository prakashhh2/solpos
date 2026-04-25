import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export interface DailyReportResult {
  headline: string;
  score: number;
  narrative: string;
  metrics: {
    totalRevenue: number;
    transactionCount: number;
    avgTicket: number;
    peakHour: string;
    topPaymentMethod: string;
  };
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  paymentSplit: Array<{ method: string; count: number; revenue: number; pct: number }>;
  hourlyRevenue: Array<{ hour: string; revenue: number }>;
  wins: string[];
  tomorrowActions: string[];
}

export async function POST(req: Request) {
  try {
    const { transactions, date } = await req.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ ok: false, error: "No transactions for today" }, { status: 400 });
    }

    const txSummary = transactions.map((t: {
      amount: number;
      timestamp: string;
      payment_method?: string;
      status?: string;
      items?: Array<{ name: string; qty: number; price: number }>;
    }) => ({
      amount: t.amount,
      time: new Date(t.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      method: t.payment_method ?? "solana",
      items: (t.items ?? []).map((i) => `${i.name} x${i.qty}`).join(", ") || "—",
    }));

    const prompt = `You are a business intelligence AI generating a daily end-of-day report for a small merchant using a Solana POS system.

Date: ${date}
Transactions today (${transactions.length} total):
${JSON.stringify(txSummary, null, 2)}

Generate a complete daily report. Respond ONLY with valid JSON (no markdown, no extra text) matching this EXACT structure:
{
  "headline": "Short punchy headline about today (max 10 words, e.g. 'Solid Tuesday — Lunch Rush Drove 60% of Revenue')",
  "score": 78,
  "narrative": "2-3 sentences describing today's performance in plain English. Be specific about numbers.",
  "metrics": {
    "totalRevenue": 156.75,
    "transactionCount": 23,
    "avgTicket": 6.81,
    "peakHour": "12:00–13:00",
    "topPaymentMethod": "Solana Pay"
  },
  "topProducts": [
    { "name": "Coffee", "qty": 8, "revenue": 10.00 }
  ],
  "paymentSplit": [
    { "method": "Solana Pay", "count": 15, "revenue": 102.00, "pct": 65 },
    { "method": "Card", "count": 5, "revenue": 35.00, "pct": 22 },
    { "method": "Cash", "count": 3, "revenue": 19.75, "pct": 13 }
  ],
  "hourlyRevenue": [
    { "hour": "08:00", "revenue": 12.50 },
    { "hour": "09:00", "revenue": 18.00 }
  ],
  "wins": [
    "Specific win 1 — be concrete (e.g. 'Sold 8 coffees, highest count this week')",
    "Specific win 2"
  ],
  "tomorrowActions": [
    "Concrete action 1 for tomorrow (e.g. 'Restock coffee — sold out by 11am')",
    "Concrete action 2",
    "Concrete action 3"
  ]
}

Rules:
- score: 0–100 rating of today's performance. 50 = average, 80+ = great day, below 40 = slow day.
- topProducts: top 3 by qty, sorted descending. Only include products that appear in the transaction items.
- paymentSplit: pct values must sum to 100. Only include methods that appear in the data.
- hourlyRevenue: aggregate all transaction amounts by hour (use "HH:00" format). Only hours with sales.
- wins: 2-3 genuine positive observations from the data — no fluff.
- tomorrowActions: 3 specific actions the merchant should do tomorrow based on today's data.
- All revenue values must be numbers, not strings.`;

    const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const data: DailyReportResult = JSON.parse(cleaned);

    return NextResponse.json({ ok: true, report: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
