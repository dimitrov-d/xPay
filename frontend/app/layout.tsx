import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xPay - No-Code API Monetization with x402 Protocol",
  description:
    "Transform any API, AI agent, or MCP server into a revenue stream instantly. xPay creates x402-protected endpoints with zero integration effort.",
  authors: [{ name: "xPay" }],
  openGraph: {
    title: "xPay - No-Code API Monetization with x402 Protocol",
    description:
      "Transform any API, AI agent, or MCP server into a revenue stream instantly. xPay creates x402-protected endpoints with zero integration effort.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@xPay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

