import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.imageBase64) {
      // Vision: identify product from camera frame
      const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });

      const result = await model.generateContent([
        {
          inlineData: {
            data: body.imageBase64,
            mimeType: (body.mimeType as string) || "image/jpeg",
          },
        },
        `You are a retail product identification AI.
Identify the product in this image and provide its typical US retail price and applicable sales tax rate.
Respond ONLY with valid JSON (no markdown, no extra text):
{
  "name": "product name",
  "brand": "brand name or empty string",
  "category": "one of: Food & Grocery, Electronics, Clothing, Health & Beauty, Home & Garden, Toys & Games, Sports, Other",
  "estimatedRetailPrice": 9.99,
  "taxRate": 8,
  "currency": "USD",
  "confidence": "high|medium|low",
  "description": "one-line description"
}
taxRate rules: Food & Grocery = 0, Electronics = 8, Clothing = 5, Health & Beauty = 6, Home & Garden = 7, Toys & Games = 7, Sports = 7, Other = 8`,
      ]);

      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const data = JSON.parse(cleaned);
      return NextResponse.json({ ok: true, product: data });
    }

    if (body.productName) {
      // Text: lookup retail price for a named product
      const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });

      const result = await model.generateContent(
        `You are a retail pricing AI. Look up the typical US retail price for: "${body.productName}".
Respond ONLY with valid JSON (no markdown, no extra text):
{
  "name": "product name",
  "brand": "brand name or empty string",
  "category": "one of: Food & Grocery, Electronics, Clothing, Health & Beauty, Home & Garden, Toys & Games, Sports, Other",
  "estimatedRetailPrice": 9.99,
  "taxRate": 8,
  "currency": "USD",
  "priceRange": { "min": 8.99, "max": 11.99 },
  "description": "one-line description"
}
taxRate rules: Food & Grocery = 0, Electronics = 8, Clothing = 5, Health & Beauty = 6, Home & Garden = 7, Toys & Games = 7, Sports = 7, Other = 8`
      );

      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const data = JSON.parse(cleaned);
      return NextResponse.json({ ok: true, product: data });
    }

    return NextResponse.json(
      { ok: false, error: "Provide imageBase64 or productName" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
