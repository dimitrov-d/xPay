import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

/**
 * Verifies a Solana wallet signature
 * @param walletAddress - The public key of the wallet
 * @param message - The message that was signed
 * @param signature - The signature in base58 or base64 format
 * @returns true if signature is valid, false otherwise
 */
export function verifySolanaSignature(
  walletAddress: string,
  message: string,
  signature: string,
): boolean {
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);

    let signatureBytes: Uint8Array;
    try {
      signatureBytes = bs58.decode(signature);
    } catch {
      // If base58 fails, try base64
      try {
        signatureBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
      } catch {
        console.error('Invalid signature format');
        return false;
      }
    }

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
