# Solid & External Bridges (Web 2.0 & AI)

This directive governs how data is ingested from legacy Web 2.0 systems and how Solid Pods interface with external AIs via bridging protocols.

## 1. Web 2.0 Data Liberation (OAuth/APIs)
**Goal:** One-way extraction of siloed data into the user's sovereign Pod.
- **Rule:** When generating code to fetch data from Google Drive, Samsung Health, or Facebook, the OAuth tokens used for those services MUST be short-lived.
- **Rule:** Once the legacy data is fetched and transformed into RDF, the application must immediately discard the legacy tokens. The Solid Pod becomes the definitive source of truth.

## 2. Model Context Protocol (MCP) Integration
**Goal:** Safe exposure of Pod data to local or remote AI agents.
- **Rule:** If tasked with building an MCP server that reads a Solid Pod, the server MUST authenticate to the Pod using the user's WebID/DPoP token.
- **Rule:** The MCP server must strictly honor the Solid Pod's WAC/ACP permissions. It cannot bypass Access Control. If the AI requests a file the user hasn't explicitly granted the MCP server access to, it must reject the request.

## 3. Prevention of Data Leakage
- **Rule:** Never synchronize data *back* to the Web 2.0 host unless explicitly instructed. Solid architectures act as a gravity well for personal data, pulling it away from central silos, not feeding it back into them.
