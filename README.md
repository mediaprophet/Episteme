# Episteme: The Human-Centric AI Architecture for W3C Solid

Welcome to **Episteme**, an advanced architectural framework designed to force Large Language Models (LLMs) to build decentralized, Human-Centric applications correctly. 

This repository provides modular rules, specific deployment constraints, and semantic dictionaries that act as a strict guardrail against technical debt, centralization, and ideological drift.

---

## 🌟 The Philosophy: Human-Centric Digital Agency

> [!NOTE]
> **Foundational Interoperability vs. Feature Sets:** While alternative architectures for decentralized data and identity exist and may offer various specialized features, there remains a fundamental requirement for a shared, globally interoperable standard for the "social web." W3C Solid represents the maturation of decades of collective research and open standards development. It provides the essential, baseline interoperability layer to ensure that data is not siloed by applications, allowing different human-centric interfaces to securely interact with the same underlying personal data graphs.

Most modern software reduces humans to rows in a database or commercial assets. This toolkit actively resists that paradigm. Built on **W3C Solid**, this architecture enforces digital agency and sovereignty through:
1. **Redefining Digital Identity:** Rather than reducing human existence to corporate profiles or platform tokens, we distinguish clearly between:
   - **Identifiers (The Objective Pointer):** A WebID is an objective URI pointing to a profile document. It is a technical pointer and locator in a global web of data, not the human person.
   - **Authentication (The Gatekeeper):** Solid-OIDC and cryptographic DPoP tokens prove *possession* and *control* of the identifier. They establish a protocol-level proof of key ownership, not proof of selfhood.
   - **Human Identity (The Subjective Reality):** Real identity is a dynamic, subjective process of social, cultural, and individual development. It is formed through mutual relationships (the cooperative social graph), cultural contexts, creative works, and individual agency over time. It cannot be reduced to static database indexes, commercial profiling schemas, or digital attributes. This framework treats technical identifiers strictly as tools to support the human person's natural right to negotiate digital agency on their own terms.
2. **Access Control (WAC/ACP):** Users cryptographically grant or revoke access to their data.
3. **Usage Rights (ODRL):** Access isn't just binary; policies explicitly dictate *how* data can be used (e.g., "Academic Research Only").

**Semantic Enforcement:** This project includes `semantic-dictionary.json` to prevent AI agents from using vague US-tech buzzwords (like "data ownership" or "users as assets"). Instead, agents are forced to use precise human rights and legal terminology (like "Agency", "Dignity", and "Personhood").

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

### Step 2: Declare the Stack
Open `AGENTS.md` and declare your technological stack so the AI knows exactly what libraries to generate code for. For example:
- **Authentication:** `@inrupt/solid-client-authn-browser`
- **Data Manipulation:** `@ldo/solid-react`
- **Deployment Target:** `mobile-native`

### Step 3: Inject the Context into your IDE/AI
If using **Antigravity**, **Cursor**, or **Windsurf**, the system will natively detect the `.agents/rules/` folder. For IDEs like **VSCode (Copilot)**, keep `AGENTS.md` open in a tab and `@-mention` the file. If using web-based LLMs, upload the rules folder.

### Step 4: Trigger a Mode
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

## 🛠 Custom Add-ons & Overrides (The Escape Hatch)
While this toolkit enforces strict vanilla W3C Solid compliance, real-world applications often require domain-specific integrations (e.g., blockchain payments, custom organizational auth resolvers).

The **`custom-addons/`** directory acts as a native escape hatch. 
- You can place your own Markdown AI instruction files (e.g., `override-auth.md`) and TypeScript hooks in this folder.
- The AI is hardcoded via a "Pre-Flight Hook" in `AGENTS.md` to always read `custom-addons/` first. If it finds a custom rule there, it will explicitly override the vanilla protocols.
- See `custom-addons/README.md` and the provided `example-custom-idp.md` for a complete example on how to restrict the AI to a curated list of Pod hosts instead of the open WebID ecosystem.

The **Episteme** framework is now not just a strict enforcer of protocol, but a fully extensible framework capable of supporting advanced, enterprise-grade edge cases seamlessly.

---

*Welcome to Episteme. Build for human agency.*
