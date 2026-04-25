"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface KeypadProps {
  onAmountChange: (amount: string) => void;
  onCharge: (amount: number) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export function Keypad({ onAmountChange, onCharge }: KeypadProps) {
  const [display, setDisplay] = useState("0");

  const handleKey = useCallback(
    (key: string) => {
      setDisplay((prev) => {
        let next = prev;

        if (key === "⌫") {
          next = prev.length <= 1 ? "0" : prev.slice(0, -1);
        } else if (key === ".") {
          if (prev.includes(".")) return prev;
          next = prev + ".";
        } else {
          // Limit to 2 decimal places
          if (prev.includes(".")) {
            const [, decimals] = prev.split(".");
            if (decimals && decimals.length >= 2) return prev;
          }
          next = prev === "0" ? key : prev + key;
          // Prevent numbers longer than 6 digits before decimal
          const [integer] = next.split(".");
          if (integer.length > 6) return prev;
        }

        onAmountChange(next);
        return next;
      });
    },
    [onAmountChange]
  );

  const amount = parseFloat(display) || 0;
  const canCharge = amount > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Amount display */}
      <div className="w-full text-center">
        <span className="text-xs uppercase tracking-widest text-zinc-500 mb-1 block">
          Amount (USDC)
        </span>
        <div className="text-7xl font-bold tracking-tight text-white">
          <span className="text-3xl text-zinc-400 mr-1">$</span>
          {display}
        </div>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            className={cn(
              "h-16 rounded-2xl text-xl font-semibold transition-all duration-100",
              "active:scale-95 select-none",
              key === "⌫"
                ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
            )}
            aria-label={key === "⌫" ? "Backspace" : key}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Charge button */}
      <button
        onClick={() => canCharge && onCharge(amount)}
        disabled={!canCharge}
        className={cn(
          "w-full max-w-xs h-16 rounded-2xl text-xl font-bold transition-all duration-200",
          "flex items-center justify-center gap-2",
          canCharge
            ? "bg-gradient-to-r from-[#9945FF] to-[#7c3aed] hover:from-[#8835ee] hover:to-[#6d29dc] text-white shadow-lg glow-purple"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        )}
        aria-label={`Charge $${display}`}
      >
        Charge ${display}
      </button>
    </div>
  );
}
