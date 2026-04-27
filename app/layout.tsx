import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/WalletProvider";
import { TransactionProvider } from "@/context/TransactionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SolPOS — Smart Retail Point of Sale",
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      {/* Anti-flash: apply saved theme before React hydrates */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pos-theme');if(t!=='light')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <SolanaProvider>
            <TransactionProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "!font-sans",
                  style: { fontFamily: "var(--font-geist-sans)" },
                }}
              />
            </TransactionProvider>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
