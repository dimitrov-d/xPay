import { FileText, Github } from "lucide-react";
import Image from "next/image";

export const Footer = () => (
  <footer className="border-t border-border bg-card py-12 px-4">
    <div className="container mx-auto max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-start justify-center gap-1 md:gap-12 mb-8">
        <div className="flex flex-col gap-3 max-w-md w-full md:w-2/5 md:items-end">
          <div className="flex items-center gap-2 shrink-0 mb-2">
            <Image src="/logo.png" alt="xPay" width={72} height={72} className="w-20 h-20" />
            <span className="text-xl font-bold">xPay</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed md:text-right">
            No-code API monetization powered by x402 protocol. Transform any API, AI agent, or MCP server into a revenue stream instantly.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0 mt-4 md:mt-0 min-h-40 md:w-2/5">
          <h3 className="font-semibold mb-0 text-sm">Product</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-foreground transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#marketplace" className="hover:text-foreground transition-colors">
                Marketplace
              </a>
            </li>
            <li>
              <a href="https://docs.usexpay.xyz/" className="hover:text-foreground transition-colors">
                Documentation
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border gap-4">
        <p className="text-sm text-muted-foreground">
          © 2025 xPay. Built for the Solana x402 Protocol Hackathon.
        </p>
        <div className="flex items-center gap-4">
          <a href="#github" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
