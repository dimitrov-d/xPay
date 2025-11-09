import { wrap as wrapFetch } from '@faremeter/fetch';
import { lookupKnownSPLToken } from '@faremeter/info/solana';
import { createPaymentHandler } from '@faremeter/payment-solana/exact';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from '@solana/web3.js';
import * as fs from 'fs';

/**
 * Test the paywall using Corbits + Faremeter fetch wrapper with payment
 */
async function main() {
  // Load keypair from file
  const keypairData = JSON.parse(fs.readFileSync('./payer-wallet.json', 'utf-8'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));

  const network = 'mainnet-beta';
  const connection = new Connection(clusterApiUrl(network));
  // Lookup USDC mint address
  const usdcMint = new PublicKey(lookupKnownSPLToken(network, 'USDC')!.address);

  // Create wallet interface
  const wallet = {
    network,
    publicKey: keypair.publicKey,
    updateTransaction: async (tx: VersionedTransaction) => {
      tx.sign([keypair]);
      return tx;
    },
  };

  // Create payment handler and wrap fetch
  const handler = createPaymentHandler(wallet, usdcMint, connection);
  const fetchWithPayer = wrapFetch(fetch, {
    handlers: [handler],
  });

  // Make a paid API request
  const response = await fetchWithPayer('https://helius.api.corbits.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBlockHeight',
    }),
  });

  const data = await response.json();
  console.log(data);
}

main();
