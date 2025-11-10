import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xPay – Instantly Monetize Any API, AI Agent, or MCP Server",
  description:
    "xPay lets you transform APIs, AI agents, and MCP servers into revenue streams with one click. Deploy x402-protected endpoints and accept payments instantly, no code required.",
  authors: [
    { name: "xPay", url: "https://usexpay.xyz" },
    { name: "xPay Team", url: "https://twitter.com/xPay" },
  ],
  keywords: [
    "API monetization",
    "x402 protocol",
    "Solana",
    "no-code",
    "AI agent payments",
    "MCP paywall",
    "xPay"
  ],
  openGraph: {
    title: "xPay – Instantly Monetize Any API, AI Agent, or MCP Server",
    description:
      "xPay lets you transform APIs, AI agents, and MCP servers into revenue streams with one click. Deploy x402-protected endpoints and accept payments instantly, no code required.",
    type: "website",
    url: "https://usexpay.xyz",
    images: [
      {
        url: "http://usexpay.xyz/banner.png",
        width: 1200,
        height: 630,
        alt: "xPay banner",
      },
    ],
    siteName: "xPay",
  },
  twitter: {
    card: "summary_large_image",
    site: "@xPay",
    creator: "@xPay",
    images: ["http://usexpay.xyz/banner.png"],
    title: "xPay – Instantly Monetize Any API, AI Agent, or MCP Server",
    description: "xPay enables API, AI, and MCP monetization with instant x402 paywalls.",
  },
  metadataBase: new URL("https://usexpay.xyz"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
