# Solid & Complementary Protocols

This directive dictates how the AI should integrate W3C Solid with adjacent decentralized technologies (Blockchains, Mixnets, VCs) while preserving Human-Centric design.

## 1. Blockchain Micropayments
**Goal:** Compensate infrastructure providers without financializing human data.
- **Rule:** When integrating crypto/blockchain payments, the code MUST exclusively target infrastructure costs (paying for Pod storage or API bandwidth).
- **Forbidden:** Never generate code that pays users to share their data, or sells access to personal attributes.
- **Implementation:** Favor lightweight Layer-2 protocols (e.g., Lightning, Solana). Enforce payment receipts as prerequisite headers before serving heavy RDF payloads.

## 2. Nym Mixnet (Metadata Privacy)
**Goal:** Prevent network-level metadata surveillance.
- **Rule:** Solid Pod communication inherently exposes IPs and traffic patterns. When requested, wrap `@inrupt/solid-client` fetch requests in a Nym Mixnet proxy.
- **Implementation:** Utilize the Nym SOCKS5 proxy or WebAssembly client to tunnel `fetch` operations.

## 3. Verifiable Credentials (VCs) & DIDs
**Goal:** Decentralized trust without global surveillance.
- **Rule:** Episteme applications treat VCs as private documents. They are stored within the user's Solid Pod as RDF resources, protected by WAC/ACP.
- **Forbidden:** Do NOT place personal VCs or DIDs on public, immutable ledgers where they can be correlated. Use `did:key` or `did:web` where appropriate.
