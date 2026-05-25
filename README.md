# Episteme: The Human-Centric AI Architecture for W3C Solid

Welcome to **Episteme**, an advanced architectural framework designed to force Large Language Models (LLMs) to build decentralized, Human-Centric applications correctly. 

This repository provides modular rules, specific deployment constraints, and semantic dictionaries that act as a strict guardrail against technical debt, centralization, and ideological drift.

### Branching Strategy
- **`main` branch:** Dedicated exclusively to strict **"Vanilla Solid" compatibility** and backwards-compatible profiles. It acts as the stable baseline for W3C Solid compliance.
- **`0.0.4-dev` branch:** The active development branch for experimental extensions and custom add-ons (such as advanced Webizen ecology models, Nym mixnet integration, and accounting tokens) designed to extend the capabilities of Solid-based systems.

---

## 🌟 Philosophical Design

For a detailed review of the core philosophical principles underpinning the Episteme project—including the distinction between objective identifiers and human identity, considerations of epistemology, personal ontology, and the history of W3C Solid development—please refer to the **[Philosophical Design Guide](Philosophica-design.md)**.

**Semantic Enforcement:** This project includes `semantic-dictionary.json` to prevent AI agents from using vague US-tech buzzwords (like "data ownership" or "users as assets"). Instead, agents are forced to use precise human rights and legal terminology (like "Agency", "Dignity", and "Personhood"). The semantic dictionary is designed to adapt dynamically to the nomenclature of your selected project configuration (e.g., `solid` nomenclature vs. `webizen` nomenclature). 

To illustrate these semantic differences:
*   The **Solid** standards specifications focus strictly on technical and architectural decentralization, avoiding philosophical terms like *"human-centric"* (which is introduced in the **Webizen** edge configuration to represent localized personal agency).
*   While many Web3/blockchain vendors promote *"identity wallets,"* the Solid paradigm (led by Inrupt) describes a **"data wallet"**—since the objective identity pointer (WebID) is decoupled from the storage container (the Pod) where the personal data graphs reside.

## 🌐 Vanilla Solid Mode

The vanilla Solid configuration operates strictly within W3C Solid standards using standard HTTP/LDP fetches and standard decentralized protocol layers. This baseline compatibility mode provides support for:
- **Identifiers (The Objective Pointer):** A WebID is an objective URI pointing to a profile document. It serves strictly as a technical pointer and locator in a global web of data, not as a representation of the human person.
- **Authentication (The Gatekeeper):** Solid-OIDC and cryptographic DPoP tokens prove *possession* and *control* of the identifier. They establish a protocol-level proof of key ownership, not proof of selfhood.
- **Access Control (WAC/ACP):** Users cryptographically grant, append, or revoke access permissions to their datasets.
- **Usage Rights (ODRL):** Access is not merely binary; policies explicitly dictate *how* data can be used (e.g., "Academic Research Only").

---

## 🚀 System Modes (AI Triggers)

This repository equips AI assistants with specialized "Modes" that shift their architectural logic. Trigger these modes by using the bolded phrases in your prompts:

1. **`Dictionary Enforcement Mode`** (Always Active)
   - The AI continuously cross-references `semantic-dictionary.json` to ensure precise semantic meaning in generated code and documentation.
2. **`App Architect Mode`** (Trigger: *"Design a new app"*)
   - The AI stops writing code and conducts a structured interview to define the application's vision, user flows, and W3C ontology mapping. It outputs `functional-spec.md` and `technical-spec.md` for flawless execution.
3. **`Refactoring & Review Mode`** (Trigger: *"Review this codebase"*)
   - The AI halts feature generation to perform a 4-step structural audit (Modularity, Semantics, Open World Assumption, Performance), delivering a `Refactoring-Audit.md` report before refactoring.
4. **`Webize Mode`** (Trigger: *"Webize this project"*)
   - Instructs the AI to dismantle a legacy, centralized app (e.g., ripping out SQL tables) and decentralize it into URI-driven micro-components.
5. **`Data Liberation Mode`** (Trigger: *"Liberate this data"*)
   - The AI acts as an ETL engineer, generating Node.js scripts that safely extract siloed data (e.g., CSV exports) and map them to standard RDF ontologies (SOSA, FHIR) to push to a Pod.
6. **`Ontology Creation Mode`** (Trigger: *"Create/Map this ontology"*)
   - The AI acts as a Semantic Architect using SHACL to model personal domain logic, actively defending against legacy CRM ontologies (like Schema.org) that classify humans as property.

---

## 🏗 AI Rule Architecture

The `.agents/rules/` directory contains strict LLM instructions mapped directly to W3C specifications.

### Core Protocols
- **`solid-auth.md`**: Enforcing OIDC context providers and redirect handles.
- **`solid-data.md`**: Data manipulation rules supporting LDO, Soukai, and Inrupt.
- **`solid-permissions.md`**: Safe abstraction of WAC/ACP via `universalAccess`.
- **`solid-vocabularies.md`**: Mandatory standard ontologies (FOAF, VCARD, AS2).
- **`solid-shape-trees.md`**: Structural validation using SHACL constraints.
- **`solid-notifications.md`**: Real-time event handling via WebSockets/Webhooks.
- **`solid-ldn.md`**: Linked Data Notifications for cross-pod ActivityStreams messaging.
- **`solid-odrl.md`**: Open Digital Rights Language for precise usage constraints.
- **`solid-ui-binding.md`**: Async component lifecycles for high-latency networks.

### Target Platforms (Deployment Awareness)
Because Solid relies heavily on WebCrypto for DPoP tokens and rigid URI redirect flows, the AI must know the deployment platform. See `.agents/rules/target-platforms/`:
- `01-static-web.md`: Standard browser CORS and WebCrypto flows.
- `02-mobile-native.md`: Deep-linking (`myapp://`) and Crypto polyfills for iOS/Android.
- `03-desktop-electron.md`: Strict IPC isolation and loopback servers for secure desktop auth.
- `04-headless-iot.md`: Client Credentials Grant and token caching for autonomous Node scripts.
- `05-browser-extension.md`: Manifest V3 constraints using `chrome.identity`.
- `06-obsidian-plugin.md`: Bridging local Vault APIs with RDF graphs using custom protocol handlers.

---

## 🤖 How to Use This Toolkit

### Step 1: Clone the Repository
It is highly recommended that you clone this repository to serve as the foundational architecture for your new project *before* making any customizations.
```bash
git clone https://github.com/mediaprophet/Episteme.git my-solid-app
cd my-solid-app
```

### Step 2: Configure the Stack & Agentic Mode
Define your technological stack and loading behavior directly in `.agents/config.ttl` (or the JSON mirror `.agents/config.json`).
For example, in `.agents/config.ttl`:
```turtle
config:project
    config:mode "solid-agent-config" ;
    config:core "solid-protocol,webid,ldp,odrl" ;
    config:target-platforms "nextjs,node-solid-server" ;
    config:custom-addons "my-policy-addon" ;
    config:context-policy [
        config:flush-after-config true ;
        config:reinit-helpers ".agents/helpers/project-context.md,custom-addons/active-rules.md"
    ] .
```

### Step 3: Run Configuration Pre-Flight Validation
Ensure your configuration is correct and matches the available manifest, knowledge index, and custom overrides:
```bash
# Validate workspace configuration and custom addons
node .agents/utils/validate-config.js

# Verify stack whitelists and view context reinitialization rules
node .agents/utils/agent-config-loader.js
```

### Step 4: Load Rules Dynamically (Local vs Solid-Native)
To minimize context window bloat, the agent follows the hierarchical loading sequence defined in `.agents/manifest.md` and only loads rules on demand:
*   **Local Filesystem Mode (`local-fs`)**: The loader reads rules locally:
    ```bash
    node .agents/utils/agent-loader.js --rule solid-auth
    ```
*   **Solid-Native Mode (`solid-native`)**: Rules can be fetched dynamically from a W3C Solid Pod Rules container via LDP:
    ```bash
    node .agents/utils/agent-loader.js --rule solid-auth --mode solid-native --pod https://pod.example/rules/
    ```

### Step 5: Inject the Context into your IDE/AI
This repository features out-of-the-box support for modern AI-assisted IDEs:
- **Antigravity:** Native support via [.agents/rules/solid-antigravity.md](file:///.agents/rules/solid-antigravity.md), which automatically maps developer workflows using the compiled root-level `.antigravityrules` file.
  *   **Automated Bootstrap:** This repository includes a **[bootstrap-antigravity.md](bootstrap-antigravity.md)** file at the root. Simply drag-and-drop or mention this file to the Antigravity agent in a new chat, or prompt: *"Please read bootstrap-antigravity.md and set up the project."* The agent will automatically perform the pre-flight scan, resolve dependencies, configure defaults, and sync all rules.
- **Cursor:** Automatically loads the custom `.mdc` rules files in `.cursor/rules/` (`solid-core.mdc`, `solid-data.mdc`, `solid-auth.mdc`, `solid-modes.mdc`) based on active file extensions, as well as the root-level legacy `.cursorrules` file.
- **Windsurf:** Automatically reads the root `.windsurfrules` file to apply the core Solid directives and coordinate system modes during code editing.
- **Sync Rules Utility:** To compile all changes in `.agents/rules/` and `semantic-dictionary.json` into `.cursorrules`, `.windsurfrules`, and `.antigravityrules`, run the synchronizer:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/sync-rules.ps1
  ```

### Step 6: Trigger a Mode
Start your conversation.
- *Starting fresh?* Say: **"Enter Architect Mode"**.
- *Migrating old code?* Say: **"Webize this project"**.
- *Ready to build?* Follow the technical specifications the AI generated for you.

---

## 🧬 Templates & Testing

- **/templates**: Features working blueprints for Profile Viewers (Inrupt/LDO), Mobile/Extension Auth flows, LDN senders, and ODRL policy generators.
- **/utils/testing**: Exposes hooks to run an ephemeral **Community Solid Server (CSS)** locally and seed it with dummy RDF data.

**To run the E2E Test Suite against the local CSS:**
```bash
npm install
npm run test
```

---

## ⚙️ Universal Adapter Pattern & Cross-Vendor Portability

To prevent lock-in to specific Solid server implementations (Enterprise ESS vs. Community CSS vs. Vanilla LDP), Episteme decouples the client application layer from vendor-specific SDKs using the **Universal Adapter Pattern**.

### 1. Unified Engine Interfaces
All core actions are written against the unified interfaces located under `vanilla-core/interfaces/`:
*   **[IAuthProvider](file:///C:/antigravity/New%20folder/vanilla-core/interfaces/IAuthProvider.ts)**: Unifies authentication lifecycles (`login()`, `logout()`, `handleIncomingRedirect()`, and `getFetch()`).
*   **[IDataProvider](file:///C:/antigravity/New%20folder/vanilla-core/interfaces/IDataProvider.ts)**: Unifies RDF graph CRUD operations (`read()`, `write()`, and `validatePortability()`).
*   **[INotificationProvider](file:///C:/antigravity/New%20folder/vanilla-core/interfaces/INotificationProvider.ts)**: Unifies live updates via WebSocket and webhook protocols (`subscribeToResource()`, `unsubscribe()`, and `onConnectionLost()`).

### 2. Stack Adapters & Runtime Factory
Adapters are provided under `vanilla-core/adapters/`:
*   `InruptAuthAdapter` and `CommunityAuthAdapter` for authentication.
*   `InruptDataAdapter` and `LDODataAdapter` for data interactions.
*   `InruptNotificationAdapter` and `CommunityNotificationAdapter` for real-time WebSocket messaging.
*   **[useSolidAuth](file:///C:/antigravity/New%20folder/vanilla-core/templates/hooks/useSolidAuth.ts)**: Exposes a runtime factory hook that dynamically instantiates the correct adapter depending on the active stack choice configured in `.agents/config.ttl` (`config:data-stack`).

### 3. Portability Checker
Adapters implement validation checking to warn developers when targeting incompatible schemas:
*   The `InruptDataAdapter` warns if WAC (ACL) rules are written to an Access Control Policies (ACP) environment.
*   The `LDODataAdapter` warns if ACP rules are written to a Web Access Control (WAC) environment.

---

## 🛠 Custom Add-ons & Overrides (The Escape Hatch)
While this toolkit enforces strict vanilla W3C Solid compliance, real-world applications often require domain-specific integrations (e.g., blockchain payments, offline mobile routing).

The **`custom-addons/`** directory acts as a native escape hatch and edge sandbox.
- You can place your own Markdown AI instruction files (e.g., `override-auth.md`) and TypeScript/Javascript hooks in this folder.
- The AI is hardcoded via a "Pre-Flight Hook" in `AGENTS.md` to always read `custom-addons/` first. If it finds a custom rule there, it will explicitly override the vanilla protocols.

### Webizen: Offline-First Edge Autonomy (Active Development)
The **Webizen** custom-addons profile is designed as a more advanced "offline" and "local-first" solution. It enables the means for a natural person to act as their own "platform provider," operating local-first data storage on personal devices that syncs securely with the broader web.
Episteme includes a complete bridge routing middleware to reconcile offline mobile/edge operation with remote W3C Solid Pods:
*   **`custom-addons/webizen-edge/sqlite-wrapper.ts`**: Provides a simulated SQLite local storage wrapper caching datasets and queueing pending offline writes.
*   **`custom-addons/p2p-sync/reconciler.ts`**: Reconciles the offline synchronization queue back to the remote Solid Pod via HTTP LDP protocols on reconnection.
*   **`custom-addons/network-broker.ts`**: Implements the *Network State & Interop Broker* that listens to connectivity changes and routes reads/writes dynamically between local SQLite cache and remote Pod storage.
*   **`custom-addons/rights-ontology.ttl`**: Extends the Open Digital Rights Language (ODRL) with custom edge-device constraints (`webizen:maxCacheDuration`, `webizen:OnDeviceProcessingOnly`, and `webizen:secureEnclaveRequired`).

### RWW-NeXT: Historical Simplicity & Edge Autonomy (Active Development)
The **RWW-NeXT** custom-addons profile represents a reimagined, highly simplified version of read-write web capabilities. It draws direct inspiration from precursor works in Read-Write Web (RWW) history—such as [Joe Presbrey's MIT doctoral thesis on decentralized data](https://dig.csail.mit.edu/2014/Papers/presbrey/thesis.pdf), early linked data architectures (like [github.com/linkeddata/](https://github.com/linkeddata/)), and Tim Berners-Lee's original SWAP (Semantic Web Area Processor) project ([github.com/linkeddata/swap](https://github.com/linkeddata/swap)).
RWW-NeXT focuses on lightweight, edge-autonomous data structures and raw semantic manipulation, bypassing complex enterprise requirements to deliver simple, high-performance read-write mechanisms directly to independent local nodes.

### Solid Application Interoperability (SAI)
To ensure core operations govern access securely in enterprise landscapes, `/vanilla-core/sai-interop.ts` exposes helper classes to manage **Application Registries**, **Access Grants**, and **Data Grants** in alignment with the SAI specification.

The **Episteme** framework is now not just a strict enforcer of protocol, but a fully extensible framework capable of supporting advanced, offline-first edge cases and enterprise authorization controls.

---

*Welcome to Episteme. Build for human agency.*
