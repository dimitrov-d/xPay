import { wrap } from "@faremeter/fetch";
import { lookupKnownSPLToken } from "@faremeter/info/solana";
import { createPaymentHandler } from "@faremeter/payment-solana/exact";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import express from "express";
import * as fs from "fs";

const app = express();
app.use(express.json());

// Load keypair and setup payment handler
const keypairData = JSON.parse(fs.readFileSync("./payer-wallet.json", "utf-8"));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));

const network = "mainnet-beta";
const connection = new Connection(clusterApiUrl(network));
const usdcMint = new PublicKey(lookupKnownSPLToken(network, "USDC")!.address);

const wallet = {
  network,
  publicKey: keypair.publicKey,
  updateTransaction: async (tx: VersionedTransaction) => {
    tx.sign([keypair]);
    return tx;
  },
};

const paymentHandler = createPaymentHandler(wallet, usdcMint, connection);
const fetchWithPayer = wrap(fetch, { handlers: [paymentHandler] });

// Proxy MCP requests
app.all("/mcp", async (req, res) => {
  const mcpServerUrl = "https://your-mcp-server.com/mcp";

  // Bypass payment for MCP protocol methods
  const bypassMethods = [
    "initialize",
    "tools/list",
    "prompts/list",
    "resources/list",
  ];
  const shouldBypassPayment =
    req.body?.method && bypassMethods.includes(req.body.method);

  const fetchFn = shouldBypassPayment ? fetch : fetchWithPayer;

  const response = await fetchFn(mcpServerUrl, {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  const data = await response.text();
  res.status(response.status).send(data);
});

app.listen(8402, () => {
  console.log("MCP proxy running on http://localhost:8402/mcp");
});
