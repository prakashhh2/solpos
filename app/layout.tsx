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
  title: "QuickPOS — Smart Retail Point of Sale",
  description:
    "AI-powered point-of-sale terminal. Scan products, auto-price with Gemini, and checkout instantly.",
  keywords: ["POS", "Retail", "Point of Sale", "AI", "Gemini", "Barcode Scanner"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-[rgb(11,17,32)] text-white">
        <SolanaProvider>
          <TransactionProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "rgb(17,24,39)",
                  border: "1px solid rgba(59,130,246,0.3)",
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
