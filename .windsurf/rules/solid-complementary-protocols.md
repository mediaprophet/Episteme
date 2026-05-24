---
description: Rules for integrating Solid with complementary protocols (Nym Mixnets, IPFS, Blockchains, VCs, and DIDs) without compromising user autonomy.
globs: ["**/complementary/**/*", "**/protocols/**/*", "**/integration/**/*", "*.ts", "*.js"]
alwaysApply: false
---
# Solid & Complementary Protocols

This directive dictates how to integrate W3C Solid with adjacent decentralized technologies (Blockchains, Mixnets, VCs, DIDs, IPFS) while preserving user autonomy and data dignity.

## 1. Core Directives

### Blockchain Micropayments (L2)
1. **Infrastructure Compensation Only:** Micropayments (e.g. Lightning Network, Solana) MUST be restricted to paying for infrastructure costs (e.g., Pod hosting, bandwidth fees, compute resource limits).
2. **Never Monetize User Data:** Never write code that pays users to share their data or sells access to personal attributes. Data is not a tradeable property asset.
3. **Receipt Verification:** Attach micropayment payment receipts to request headers (e.g., `Authorization: L402 <receipt>`) before accessing gated resources.

### Network Privacy via Nym Mixnet
1. **Metadata Obfuscation:** Standard HTTP requests expose client IPs and communication patterns to network nodes. When network privacy is demanded, wrap your fetch client in a mixnet proxy (using SOCKS5 or the Nym WASM client).
2. **Dynamic Wrapping:** Create a custom fetch client that routes traffic through the mixnet endpoints.

### Verifiable Credentials (VCs) & DIDs
1. **Pod-Based Storage:** Store VCs (tamper-evident attributes) securely inside the user's Solid Pod as RDF resources, protected by WAC/ACP.
2. **Correlation Prevention:** Do NOT store personal VCs or DIDs on public, immutable ledgers. Use localized identifiers like `did:key` or `did:web` to prevent correlative tracking.

### IPFS (InterPlanetary File System)
1. **Content-Addressable Linking:** Use IPFS for large files (videos, heavy data sets) or static, immutable assets.
2. **Immutable References:** Reference IPFS files in Solid RDF graphs using the `ipfs://<CID>` scheme or gateways, preserving graph integrity.

---

## 2. Concrete Code Example

Here is a TypeScript helper demonstrating a privacy-wrapped fetch agent that handles **Nym proxy routing** and intercepts **L402 (Lightning Network) payment requirements**:

```typescript
import { fetch as solidFetch } from "@inrupt/solid-client-authn-browser";

interface FetchOptions extends RequestInit {
  useNym?: boolean;
  paymentToken?: string;
}

/**
 * A privacy and payment-aware fetch wrapper for Solid Pod operations
 */
export async function complementaryFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});

  // 1. Inject payment tokens (L402 protocol) if available
  if (options.paymentToken) {
    headers.set("Authorization", `L402 ${options.paymentToken}`);
  }

  // 2. Wrap and route requests
  const fetchConfig: RequestInit = {
    ...options,
    headers,
  };

  // If running in Node.js, we would inject a SOCKS5 agent for Nym:
  // if (options.useNym) {
  //   const { SocksProxyAgent } = await import("socks-proxy-agent");
  //   fetchConfig.agent = new SocksProxyAgent("socks5h://127.0.0.1:1080");
  // }

  // Execute standard authenticated Solid-OIDC fetch
  const response = await solidFetch(url, fetchConfig);

  // 3. Intercept HTTP 402 (Payment Required)
  if (response.status === 402) {
    const invoice = response.headers.get("X-Lightning-Invoice");
    throw new PaymentRequiredError(
      "Payment required to access this resource.",
      invoice || ""
    );
  }

  return response;
}

class PaymentRequiredError extends Error {
  constructor(message: string, public invoice: string) {
    super(message);
    this.name = "PaymentRequiredError";
  }
}
```

---

## 3. Anti-Patterns
- **Anti-Pattern:** Saving user credentials, private keys, or wallet seed phrases in plain text JSON files or local Storage. Always delegate key signing to the wallet/browser extensions.
- **Anti-Pattern:** Placing plaintext personal identifiers (such as names or emails) or hash strings of such identifiers on a public blockchain ledger. This violates GDPR right-to-be-forgotten regulations.
- **Anti-Pattern:** Conflating IPFS content CIDs with dynamic Solid resources. IPFS is for *immutable* binary objects, whereas Solid is for *mutable* resource graphs. Use Solid RDF nodes to link and categorize IPFS URIs.
