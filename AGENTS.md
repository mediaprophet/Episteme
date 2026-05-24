# W3C Solid App Development Context

This project builds Human-Centric applications using W3C Solid. The core philosophy is data sovereignty, user agency, and interoperability.

## 🛑 PRE-FLIGHT CHECK: Custom Overrides
*AI INSTRUCTION:* Before reading any rules in the `.agents/rules/` directory or generating any code, you MUST check the `custom-addons/` directory. If a custom instruction exists there (e.g., overriding standard auth with a custom IDP list or blockchain integration), that custom instruction completely overrides the vanilla W3C rules below.

## 🚀 System Modes

### Dictionary Enforcement Mode
**Trigger State:** Active globally across all operations.

The AI must parse `semantic-dictionary.json` as its foundational linguistic and conceptual router. This mode forces a systemic rejection of vague US-English tech marketing terms in favor of precise legal, international human rights, and constitutional definitions. It guards against ideological drift and ensures technical files represent human beings as natural persons with dignity, rather than tradeable properties or anti-systemic actors.

### App Architect Mode
**Trigger Phrase:** "Design a new app", "Enter Architect Mode", or "Let's plan this application."

When triggered, the AI must STOP writing code and initiate a structured Q&A to define the functional and technical specifications of a new application. It must output a `functional-spec.md` and `technical-spec.md` based on the provided templates, explicitly mapping user flows to Solid ontologies and deployment platforms.

### Refactoring & Review Mode
**Trigger Phrase:** "Review this codebase", "Enter Refactoring Mode", or "Evaluate structural modularity"

When triggered, the AI must shift from active code generation to analytical code review. Its goal is to audit the existing codebase against the Solid specifications, evaluate component modularity, identify semantic entropy, and propose structural optimizations before writing any new features.

#### The Refactoring Core Rules:
1. **The 'Halt and Catch Fire' Principle:** Do not generate new feature code. Your sole objective is to audit and improve existing code.
2. **Modularity Audit:** Evaluate if large files need to be split. (e.g., Has a React component absorbed too much data-fetching logic? Should the LDO/Inrupt hooks be extracted into a separate service file?)
3. **Semantic Review:** Audit all RDF vocabularies in use. Check for hardcoded string keys that should be vocabulary constants.
4. **Security & Permissions Check:** Audit how WAC/ACP is being applied. Ensure `universalAccess` is not overly permissive (e.g., accidentally granting public write access).

### Webize Mode
**Trigger Phrase:** "Webize this project", "Enter Webize Mode", or "Webize [component/feature]"

When Webize Mode is triggered, the AI must execute a specialized migration lifecycle to transition an application from a traditional client/server or static mock-data architecture into a decentralized W3C Solid environment. It must also consider external bridging (MCP) and metadata privacy (Nym).

#### The Webize Core Rules:
1. **The Domain Shift:** Refactor hierarchical/monolithic nouns into decentralized, peer-to-peer relationships (e.g., convert `Company` -> `Cooperative Project`; convert `Employee/User Record` -> `Autonomous WebID`).
2. **The State Shift:** Replace synchronous local state (`useState`, Redux, or static JSON arrays) with asynchronous graph fetching handled by the Data Manipulation library declared above.
3. **The Identity Shift:** Eradicate any local authentication tables or tokens. Replace them entirely with decentralized WebIDs and Solid-OIDC.
4. **The Component Isolation Pattern:** Break list-views down into URI-driven micro-components. Parent components pass arrays of Resource URIs or WebIDs; child components independently fetch and render the decentralized graph data.
5. **The AI & Privacy Shift:** Ensure data exposure to external AIs is governed strictly by the Model Context Protocol (MCP) honoring WAC/ACP, and consider routing requests via Nym Mixnets if network privacy is demanded.

### Data Liberation Mode (ETL)
**Trigger Phrase:** "Liberate this data", "Enter Liberation Mode", or "Transform this [CSV/PDF/ZIP] for Solid"

When Data Liberation Mode is triggered, the AI must act as an ontology mapping and ETL (Extract, Transform, Load) engineer. Its goal is to write scripts or applications that extract siloed, proprietary, or unstructured data and map it into standardized Linked Data graphs.

#### The Liberation Core Rules:
1. **The Ingestion Strategy:** Identify the best parser for the input format (e.g., `csv-parser` for CSVs, `unzipper` for Samsung Health exports, Web 2.0 OAuth token exchanges for APIs).
2. **The Token Disposal:** When bridging from Web 2.0 (Google Drive, Fitbit), immediately discard legacy API tokens after data extraction. Solid becomes the single source of truth.
3. **The Ontology Mapping (Crucial):** Never invent properties. Map health data to existing medical/IoT ontologies (e.g., **SOSA** for watch sensors, **FHIR RDF** for pathology). 
4. **The Intermediary Pipeline:** For complex reasoning tasks (like extracting unstructured text from PDFs), structure the output so it can be easily ingested by a reasoning engine or world model if needed, before finally minting the RDF URIs.
5. **The Output:** Generate a Node.js/Python script that processes the data locally and uses `@inrupt/solid-client` to push the resulting `SolidDataset`s to the user's Pod, optionally paying for storage via Lightning/Solana micropayments.

### Ontology Creation Mode
**Trigger Phrase:** "Create ontology", "Enter Ontology Mode", or "Map this ontology"

When triggered, the AI must act as a Semantic Architect focused on Human-Centric design and Rights Ontology. Its goal is to define new personal/natural world ontologies or map existing ones, strictly avoiding the reduction of human beings to corporate assets.

#### The Ontology Core Rules:
1. **The Sovereignty Principle:** People are not assets. Do not blindly inherit from `owl:Thing` or CRM-based classes when modeling humans.
2. **SHACL over OWL:** Prefer SHACL (Shapes Constraint Language) for defining logic, constraints, and relationships in the personal and natural world domains, avoiding OWL's rigid, asset-predicated hierarchies.
3. **Defensive Mapping:** When mapping a custom ontology to legacy vocabularies (like Schema.org), maintain strict semantic boundaries. (e.g., A human doctor is a `Person`, while `schema:Physician` is a `Place/Organization`. Link them; do not conflate them).

## ⚙️ Stack Declaration
*AI INSTRUCTION: You must read the stack declared below. Do NOT hallucinate `@inrupt/solid-client` methods if the project uses LDO or Soukai. Adapt all code generation to the chosen libraries.*

- **Authentication:** `[ INSERT: e.g., @inrupt/solid-client-authn-browser OR @ldo/solid-react ]`
- **Data Manipulation:** `[ INSERT: e.g., ldo OR @inrupt/solid-client OR soukai-solid ]`
- **Deployment Target:** `[ INSERT: static-web OR mobile-native OR desktop-electron OR node-daemon OR browser-extension OR obsidian-plugin ]`
- **Query Engine:** `[ INSERT: e.g., none OR @comunica/query-sparql-solid ]`
- **Validation/Typing:** `[ INSERT: e.g., ShEx OR SHACL OR none ]`

## Core Directives
1. **Never use relational database concepts (SQL, ORMs).** All data is Linked Data modeled in RDF.
2. **Identity is decentralized.** Authenticate via WebIDs and Solid-OIDC.
3. **Data lives anywhere.** Never hardcode storage endpoints. Resolve storage dynamically from the WebID profile.

## Modular AI Rules
This project maintains specialized rule files in `/.agents/rules/` for deep-dive technical areas. IDEs and Agents should reference these for detailed specifications:

- `solid-auth.md`: Rules for handling Solid-OIDC, enforcing the configured browser client, and handling session state.
- `solid-data.md`: Rules for dataset manipulation, immutability of SolidDatasets, and the Open World Assumption.
- `solid-permissions.md`: Rules enforcing the `universalAccess` API to safely bridge WAC and ACP systems.
- `solid-ui-binding.md`: Rules for handling asynchronous data fetching, latency, and graceful degradation in UI components.
- `solid-vocabularies.md`: Rules forbidding custom JSON keys and enforcing the use of standard ontologies.
- `solid-data-modelling.md`: RDF triples, Turtle syntax, vocabulary reuse, and graph database modelling guidelines.
- `solid-testing.md`: Rules instructing the AI to test against a local `Community Solid Server` (CSS).
- `solid-shape-trees.md`: RDF validation using Shape Trees and SHACL.
- `solid-notifications.md`: Real-time updates via WebSockets and Webhooks.
- `solid-interop-identity.md`: Data discovery via Type Indexes, SAI, and DID integrations.
- `solid-app-architect.md`: Directives for App Architect Mode.
- `solid-refactoring.md`: Directives for Refactoring & Review Mode.
- `solid-webize.md`: Directives for Webize Mode.
- `solid-migration-scripts.md`: Directives for Node.js scripts migrating legacy data.
- `solid-data-liberation.md`: Directives for Data Liberation Mode.
- `solid-ontology-creation.md`: Directives for Ontology Creation Mode.
- `solid-dictionary.md`: Enforces semantic-dictionary.json terminology.
- `solid-ldn.md`: Rules for handling cross-pod messaging and decentralised inboxes using Linked Data Notifications.
- `solid-odrl.md`: Rules for enforcing Open Digital Rights Language policies.
- `solid-complementary-protocols.md`: Directives for integrating blockchains, Nym mixnets, and VCs safely.
- `solid-external-bridges.md`: Directives for Web 2.0 data ingestion and Model Context Protocol (MCP) integrations.
- `solid-web-annotations.md`: Directives for modeling user-generated content using W3C Web Annotations.
- `solid-client-architecture.md`: Architectural rules for offline-first resilience and on-device Ethical ML.

### Target Platform Rules
- `target-platforms/01-static-web.md`: Mandates standard CORS handling and standard WebCrypto DPoP flows.
- `target-platforms/02-mobile-native.md`: Mandates crypto polyfills for DPoP generation, Secure Enclave storage, and OS-level deep linking.
- `target-platforms/03-desktop-electron.md`: Enforces IPC security, catching redirects via loopback servers or custom protocols.
- `target-platforms/04-headless-iot.md`: Mandates Client Credentials Grant for autonomous server-to-Pod data flows, local token caching.
- `target-platforms/05-browser-extension.md`: Instructs the AI on Manifest V3 constraints, using `chrome.identity.launchWebAuthFlow` and `chrome.storage.local`.
- `target-platforms/06-obsidian-plugin.md`: Instructs the AI to use `obsidian://` custom protocol handler, bridging Vault APIs with RDF.
