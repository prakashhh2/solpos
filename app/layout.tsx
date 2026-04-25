import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/WalletProvider";
import { TransactionProvider } from "@/context/TransactionContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Solana POS — Accept USDC Payments Instantly",
  description:
    "A production-grade point-of-sale terminal powered by Solana Pay. Accept USDC in under 1 second.",
  keywords: ["Solana", "POS", "USDC", "Payments", "Crypto", "Merchant"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-[rgb(10,10,15)] text-white">
        <SolanaProvider>
          <TransactionProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "rgb(18,18,24)",
                  border: "1px solid rgba(153,69,255,0.3)",
                  color: "white",
                  fontFamily: "var(--font-geist-sans)",
                },
              }}
            />
          </TransactionProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
