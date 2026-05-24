---
description: Rules for writing Node.js scripts that migrate legacy JSON/SQL data into decentralized W3C Solid RDF datasets.
globs: ["**/scripts/*migrate*", "**/scripts/*import*", "**/migration/**/*.js", "**/migration/**/*.ts"]
---
# Solid Data Migration Script Rules

When generating scripts to migrate legacy centralized data (JSON/CSV) into a Solid Pod, the script must run in a Node.js environment and strictly adhere to the mappings defined in `webize-spec.md`.

## Core Directives

### 1. Node.js Authentication
- **Action:** Do not use `@inrupt/solid-client-authn-browser`. 
- **Rule:** Migration scripts must use `@inrupt/solid-client-authn-node`. Use `interactiveLogin` for developer-run scripts, or Client Credentials for automated server-to-Pod migrations.

### 2. URI Minting & Distribution
- **Action:** Break apart monolithic JSON arrays.
- **Rule:** Do not upload a single `users.json` file. Iterate through the legacy data and mint a unique URI for each entity (e.g., `https://pod.example/projects/123e4567-e89b-12d3...`). Save each entity as its own RDF graph or group them logically in a specific container.

### 3. Rate Limiting & Async Batching
- **Action:** Respect the target Pod's server limits.
- **Rule:** Do not execute hundreds of concurrent `PUT` or `POST` requests. Solid servers (like CSS or ESS) will rate-limit or crash. Use batching (e.g., processing chunks of 10-20 items) and include artificial delays if necessary.

### 4. Relational Linking
- **Action:** Preserve legacy foreign keys as Linked Data URIs.
- **Rule:** If Legacy User A belongs to Legacy Project B, the migrated RDF for User A must use a property like `org:memberOf` pointing to the newly minted URI of Project B. You must maintain a temporary mapping dictionary in memory during the script execution to link these new URIs together.
