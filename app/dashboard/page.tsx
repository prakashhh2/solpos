"use client";

import React, { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { CameraScanner } from "@/components/CameraScanner";
import { SolanaCheckout } from "@/components/SolanaCheckout";
import { useTransactionContext } from "@/context/TransactionContext";
import { Transaction } from "@/lib/types";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  barcode: string;
}

interface CartItem extends Product {
  qty: number;
}

const TAX_RATE_DEFAULT = 8.5;

const CATEGORIES = [
  "Food & Grocery",
  "Electronics",
  "Clothing",
  "Health & Beauty",
  "Home & Garden",
  "Toys & Games",
  "Sports",
  "Other",
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    "Food & Grocery": "bg-emerald-500/15 text-emerald-400",
    Electronics: "bg-blue-500/15 text-blue-400",
    Clothing: "bg-purple-500/15 text-purple-400",
    "Health & Beauty": "bg-pink-500/15 text-pink-400",
    "Home & Garden": "bg-yellow-500/15 text-yellow-400",
    "Toys & Games": "bg-orange-500/15 text-orange-400",
    Sports: "bg-cyan-500/15 text-cyan-400",
    Other: "bg-gray-500/15 text-gray-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[cat] ?? map.Other}`}
    >
      {cat}
    </span>
  );
}

export default function POSDashboard() {
  const { connected, publicKey } = useWallet();
  const { addTransaction } = useTransactionContext();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "Food & Grocery",
    price: "",
    barcode: "",
    qty: "1",
  });
  const [lookingUp, setLookingUp] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSolanaCheckout, setShowSolanaCheckout] = useState(false);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState(TAX_RATE_DEFAULT);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const handleAILookup = useCallback(async () => {
    const name = form.name.trim();
    if (!name) { toast.error("Enter a product name first"); return; }
    setLookingUp(true);
    try {
      const res = await fetch("/api/gemini-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: name }),
      });
      const json = await res.json();
      if (json.ok && json.product) {
        const p = json.product;
        setForm((f) => ({
          ...f,
          name: p.name || f.name,
          brand: p.brand || f.brand,
          category: CATEGORIES.includes(p.category) ? p.category : "Other",
          price: p.estimatedRetailPrice ? String(p.estimatedRetailPrice) : f.price,
        }));
        toast.success(`AI priced: $${p.estimatedRetailPrice} — ${p.description ?? ""}`);
      } else {
        toast.error(json.error ?? "Lookup failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLookingUp(false);
    }
  }, [form.name]);

  const handleCameraResult = useCallback(
    (result: {
      name: string;
      brand: string;
      category: string;
      estimatedRetailPrice: number;
      description?: string;
    }) => {
      setShowCamera(false);
      setForm((f) => ({
        ...f,
        name: result.name || f.name,
        brand: result.brand || f.brand,
        category: CATEGORIES.includes(result.category) ? result.category : "Other",
        price: result.estimatedRetailPrice ? String(result.estimatedRetailPrice) : f.price,
      }));
      toast.success(`Identified: ${result.name} — $${result.estimatedRetailPrice}`);
    },
    []
  );

  const handleAddProduct = useCallback(() => {
    const name = form.name.trim();
    const price = parseFloat(form.price);
    if (!name) { toast.error("Product name is required"); return; }
    if (isNaN(price) || price <= 0) { toast.error("Enter a valid price"); return; }

    const product: Product = {
      id: genId(),
      name,
      brand: form.brand.trim(),
      category: form.category,
      price,
      barcode: form.barcode.trim(),
    };
    setInventory((inv) => [product, ...inv]);

    const qty = Math.max(1, parseInt(form.qty) || 1);
    setCart((c) => {
      const existing = c.find((i) => i.name === product.name && i.price === product.price);
      if (existing) return c.map((i) => i.id === existing.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...product, qty }];
    });

    setForm({ name: "", brand: "", category: "Food & Grocery", price: "", barcode: "", qty: "1" });
    toast.success(`Added: ${name}`);
    barcodeRef.current?.focus();
  }, [form]);

  const addToCart = useCallback((product: Product) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === product.id);
      if (existing) return c.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((c) =>
      c.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((c) => c.filter((i) => i.id !== id));
  }, []);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxAmt = subtotal * (taxRate / 100);
  const total = subtotal + taxAmt;
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    if (!connected || !publicKey) { toast.error("Connect your wallet first to accept Solana Pay"); return; }
    setShowSolanaCheckout(true);
  }, [cart, connected, publicKey]);

  const handleSolanaSuccess = useCallback((signature: string, paidTotal: number) => {
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      signature,
      amount: paidTotal,
      timestamp: new Date(),
      status: "confirmed",
      reference: signature,
      items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      payment_method: "solana",
    };
    addTransaction(tx);
    setCart([]);
    setShowSolanaCheckout(false);
    toast.success(`Payment confirmed! $${paidTotal.toFixed(2)} USDC received.`);
  }, [addTransaction, cart]);

  return (
    <div className="animate-fade-in h-full">
      {showCamera && (
        <CameraScanner
          onResult={handleCameraResult}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showSolanaCheckout && publicKey && (
        <SolanaCheckout
          items={cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }))}
          subtotal={subtotal}
          taxAmt={taxAmt}
          total={total}
          taxRate={taxRate}
          merchantWallet={publicKey}
          onSuccess={handleSolanaSuccess}
          onCancel={() => setShowSolanaCheckout(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[420px_1fr] gap-5">

        {/* ─── LEFT: Product Registration ─── */}
        <div className="flex flex-col gap-4">
          <div className="card-retail rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📦</span>
              <h2 className="text-base font-semibold text-white">Add Product</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400 text-sm font-medium transition-colors"
              >
                📷 Scan Camera
              </button>
              <button
                onClick={handleAILookup}
                disabled={lookingUp || !form.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lookingUp ? (
                  <><div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />Pricing…</>
                ) : (
                  <>✨ AI Price</>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Barcode (optional)</label>
                <input
                  ref={barcodeRef}
                  value={form.barcode}
                  onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                  placeholder="Scan or type barcode"
                  className="w-full px-3 py-2.5 rounded-lg bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAILookup()}
                  placeholder="e.g. Coca-Cola 12oz"
                  className="w-full px-3 py-2.5 rounded-lg bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Brand</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. Coca-Cola"
                  className="w-full px-3 py-2.5 rounded-lg bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price ($) *</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 rounded-lg bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input
                    value={form.qty}
                    onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2.5 rounded-lg bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-1"
              >
                + Add to Sale
              </button>
            </div>
          </div>

          {inventory.length > 0 && (
            <div className="card-retail rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Catalog ({inventory.length})
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {inventory.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] transition-colors text-left group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.brand || p.category}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-sm font-semibold text-blue-400">${p.price.toFixed(2)}</span>
                      <span className="text-gray-600 group-hover:text-white text-lg leading-none">+</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Cart + Checkout ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <h2 className="text-base font-semibold text-white">Current Sale</h2>
              {itemCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => { setCart([]); toast("Cart cleared"); }}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="card-retail rounded-2xl flex-1 overflow-hidden">
            {cart.length === 0 ? (
              <div className="min-h-[220px] flex flex-col items-center justify-center text-gray-600 gap-3">
                <span className="text-4xl opacity-40">🛒</span>
                <p className="text-sm">No items yet</p>
                <p className="text-xs text-gray-700">Add products using the form on the left</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_80px_88px_96px_32px] gap-2 px-4 py-2.5 border-b border-[rgb(31,41,55)] text-xs text-gray-500 uppercase tracking-wider">
                  <span>Product</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>

                <div className="overflow-y-auto divide-y divide-[rgb(31,41,55)]">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_80px_88px_96px_32px] gap-2 items-center px-4 py-3 hover:bg-[rgb(31,41,55)]/50 transition-colors animate-slide-in-right"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <CategoryBadge cat={item.category} />
                          {item.barcode && (
                            <span className="text-xs text-gray-600 font-mono">{item.barcode}</span>
                          )}
                        </div>
                      </div>

                      <span className="text-sm text-gray-300 text-center">
                        ${item.price.toFixed(2)}
                      </span>

                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] text-gray-300 text-sm font-bold flex items-center justify-center transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] text-gray-300 text-sm font-bold flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-white text-right">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center text-sm transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card-retail rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <label className="text-gray-400 font-medium">Tax Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={30}
                  step={0.1}
                  className="w-16 px-2 py-1 rounded-md bg-[rgb(31,41,55)] border border-[rgb(55,65,81)] text-white text-sm text-right focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>

            <div className="border-t border-[rgb(31,41,55)] pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax ({taxRate}%)</span>
                <span className="text-white font-medium">${taxAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[rgb(31,41,55)] text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {!connected && cart.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-400">
                ⚠ Connect your wallet (top-right) to accept Solana Pay
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-2 glow-blue"
            >
              ◎ Pay with Solana — ${total.toFixed(2)}
            </button>

            {cart.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    addTransaction({
                      id: `tx-${Date.now()}`,
                      signature: `cash-${Date.now()}`,
                      amount: total,
                      timestamp: new Date(),
                      status: "confirmed",
                      reference: `cash-${Date.now()}`,
                      items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
                      payment_method: "cash",
                    });
                    setCart([]);
                    toast.success("Cash payment recorded.");
                  }}
                  className="py-2.5 rounded-xl border border-[rgb(55,65,81)] text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => {
                    addTransaction({
                      id: `tx-${Date.now()}`,
                      signature: `card-${Date.now()}`,
                      amount: total,
                      timestamp: new Date(),
                      status: "confirmed",
                      reference: `card-${Date.now()}`,
                      items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
                      payment_method: "card",
                    });
                    setCart([]);
                    toast.success("Card payment recorded.");
                  }}
                  className="py-2.5 rounded-xl border border-[rgb(55,65,81)] text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
                >
                  💳 Card
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
