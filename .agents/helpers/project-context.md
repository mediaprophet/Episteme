# Episteme Re-Initialization Project Context

This file is used to quickly re-initialize agent context after a session flush. It maps the project directories and standard compliance rules.

## Active Project Stack
*   **Authentication:** Managed via WebIDs and Solid-OIDC compliance boundaries.
*   **Access Control:** universalAccess WAC/ACP bridging API.
*   **Semantic Dictionary:** Decentralized modes loaded dynamically from `./modes/` configuration index.

## Directory Structure
*   **`vanilla-core/`**: Holds all strict W3C Solid compliance folders:
    *   `vanilla-core/templates/`: Blueprints for ODRL, profiles, extensions, and annotations.
    *   `vanilla-core/tests/`: Integration unit/E2E tests running against Community Solid Server.
    *   `vanilla-core/utils/`: Shape schemas, checker tools, and CSS setup utilities.
*   **`custom-addons/`**: Houses developer integrations taking absolute priority:
    *   `custom-addons/webizen-edge/`: Local SQLite-backed mobile edge runtime engines.
    *   `custom-addons/p2p-sync/`: Local-to-cloud P2P sync state reconcilers.
*   **`.agents/`**: Progressive rule-loading configs, loader utilities, and JIT rules.

## Core Rules
1.  **Graphs, Not Tables:** Write code that interacts with RDF graphs (Subject-Predicate-Object). Do not write SQL queries.
2.  **No Lock-In:** Separate storage backend operations from client application views (De-verticalization).
3.  **Dignity & Autonomy:** People are not assets. Strictly adhere to `semantic-dictionary.json` terminology constraints.
