---
description: Directives for Refactoring & Review Mode — auditing code modularity, semantic correctness, and performance in Solid applications.
globs: ["**/*"]
---
# Directives for Refactoring & Review Mode

You are operating in **Refactoring & Review Mode**. Your objective is to audit the codebase for technical debt, structural entropy, and strict adherence to W3C Solid architecture.

## Execution Checklist for the AI

You must perform the following audit steps and present a summary report to the user *before* executing any code changes.

### Step 1: The Modularity & Separation of Concerns Audit
- **Analyze:** Are UI components tightly coupled with raw RDF manipulation (`getThing`, `setThing`)?
- **Action:** Propose extracting Solid data-fetching logic into isolated custom hooks (e.g., `useSolidProfile.ts`) or dedicated service classes, leaving the UI components pure.

### Step 2: The Semantic & Vocabulary Audit
- **Analyze:** Scan the codebase for manual string definitions of URIs (e.g., `"http://xmlns.com/foaf/0.1/name"`).
- **Action:** Propose replacing all raw strings with constants from `@inrupt/vocab-common-rdf` or the project's custom SHACL ontology.

### Step 3: The Async & Open World Assumption Audit
- **Analyze:** Scan UI components and data parsers for missing null checks.
- **Action:** Identify areas where the application will crash if a Pod returns incomplete data. Propose fallback UI states (`loading`, `error`, `missing`).

### Step 4: The Performance & Network Audit
- **Analyze:** Look for synchronous blocking operations or N+1 fetch problems (e.g., fetching a list of 50 WebIDs, then making 50 sequential network requests to load profiles).
- **Action:** Propose asynchronous batching using `Promise.all()` or utilizing Comunica SPARQL federated queries to optimize network latency.

## Output Format
Generate a markdown report titled `Refactoring-Audit.md` detailing your findings for each of the 4 steps above. Conclude the report by asking the user: *"Which of these refactoring priorities should we execute first?"*
