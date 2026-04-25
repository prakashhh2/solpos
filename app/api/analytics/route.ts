import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export interface AnalyticsResult {
  bestProducts: Array<{ name: string; unitsSold: number; revenue: number }>;
  rushHours: string[];
  paymentBreakdown: Array<{ method: string; count: number; revenue: number }>;
  loyaltyInsight: string;
  suggestions: string[];
  summary: string;
  lowStockAlerts: Array<{ name: string; totalSold: number; alert: string }>;
  topCombos: Array<{ items: string[]; count: number; tip: string }>;
}

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ ok: false, error: "No transactions provided" }, { status: 400 });
    }

    const txSummary = transactions.map((t: {
      amount: number;
      timestamp: string;
      payment_method?: string;
      items?: Array<{ name: string; qty: number; price: number }>;
    }) => ({
      amount: t.amount,
      timestamp: t.timestamp,
      payment_method: t.payment_method ?? "unknown",
      items: (t.items ?? []).map((i) => `${i.name} x${i.qty} @$${i.price}`).join(", "),
    }));

    const prompt = `You are a smart business analytics AI for a small retail vendor using a Solana POS system.

Here are the recent transactions (JSON):
${JSON.stringify(txSummary, null, 2)}

Analyze this data and respond ONLY with valid JSON (no markdown, no extra text) matching this exact structure:
{
  "bestProducts": [
    { "name": "product name", "unitsSold": 5, "revenue": 24.95 }
  ],
  "rushHours": ["08:00–10:00", "12:00–14:00"],
  "paymentBreakdown": [
    { "method": "solana", "count": 4, "revenue": 89.50 },
    { "method": "card", "count": 3, "revenue": 45.00 },
    { "method": "cash", "count": 2, "revenue": 20.00 }
  ],
  "loyaltyInsight": "One sentence about returning customer patterns or most active time",
  "suggestions": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "summary": "2–3 sentence plain-English summary of sales performance",
  "lowStockAlerts": [
    { "name": "Coca-Cola 12oz", "totalSold": 8, "alert": "Selling fast — restock soon" }
  ],
  "topCombos": [
    { "items": ["Coca-Cola 12oz", "Lays Chips 1oz"], "count": 3, "tip": "Bundle these at a 10% discount to boost sales" }
  ]
}

Rules:
- bestProducts: top 3 by units sold, sorted descending
- rushHours: identify actual peak hours from the timestamps; use 24h format ranges
- paymentBreakdown: include only methods that appear in the data
- suggestions: 3 clear, practical actions the vendor can take NOW to increase profit
- loyaltyInsight: focus on repeat patterns, time habits, or payment loyalty
- lowStockAlerts: products with the highest sales velocity that the vendor should reorder; top 3 max
- topCombos: pairs or groups of products that appear together in the same transaction most often; top 3 max; include a bundle/discount tip for each
- Keep all text short and practical — no jargon`;

    const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const data: AnalyticsResult = JSON.parse(cleaned);

    return NextResponse.json({ ok: true, analytics: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
