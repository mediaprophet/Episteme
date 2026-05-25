/**
 * Lightning Micropayment Gateway
 * 
 * Demonstrates an Express/Node.js middleware that forces a client
 * to provide a Lightning invoice payment receipt (L402 protocol) 
 * before accessing heavy Solid resources, compensating infrastructure.
 */

import { Request, Response, NextFunction } from 'express';

// Example: L402 / LSAT verification service
async function verifyMacaroonAndPreimage(macaroon: string, preimage: string): Promise<boolean> {
  // In a real implementation, you would verify the cryptographic signature 
  // of the macaroon and that the preimage hashes to the invoice hash.
  return macaroon === "valid_macaroon" && preimage === "valid_preimage";
}

export const requireMicropayment = async (req: Request, res: Response, next: NextFunction) => {
  // Normalize header: it may be string or string[]
  const rawHeader = req.headers['authorization'];
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!authHeader || !authHeader.startsWith('LSAT ')) {
    // Return 402 Payment Required with the invoice
    return res.status(402).json({
      error: "Payment Required",
      invoice: "lnbc1...", // Generated via LND/Core Lightning
      macaroon: "AgEA..."
    });
  }

  // Extract the LSAT components: LSAT <macaroon>:<preimage>
  const lsatData = authHeader.split(' ')[1];
  const [macaroon, preimage] = lsatData.split(':');

  const isValid = await verifyMacaroonAndPreimage(macaroon, preimage);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid payment proof" });
  }

  // Payment confirmed. Proceed to serve the requested Solid resource.
  next();
};
