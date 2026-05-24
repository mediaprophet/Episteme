---
description: Directives for Webize Mode — converting legacy UI toolkits and applications into decentralized, cooperative structures.
globs: ["**/*"]
---
# Directives for Webize Mode

You are operating in **Webize Mode**. Your goal is to decouple this application from central infrastructure or mock silos and wire it directly into the decentralized W3C Solid ecosystem.

## PHASE 1: The Planning & Q&A Phase
**CRITICAL: DO NOT WRITE CODE YET.** When the user triggers "Webize Mode", you must first initiate an Interactive Structural Q&A to map the "As-Is" centralized system to the "To-Be" decentralized functional specification.

### The Interview Process
Ask the user the following questions, one at a time, offering decentralized alternatives and suggestions based on W3C Solid principles:

#### Step 1: The "As-Is" Audit
Ask the user to describe the current centralized architecture:
- What are the core data entities? (e.g., Users, Projects, Tasks, Comments).
- Where is the centralization happening? (e.g., A central admin dashboard, a master database table).
- Who currently "owns" the data in this model?

#### Step 2: The "To-Be" Sovereignty Mapping (Human-Centric Design)
Offer suggestions to remap these entities into a sovereign, Human-Centric model:
- **Identity:** Confirm we are replacing local auth with WebIDs.
- **Data Topology:** Suggest where the data should live. 
  - *Example Suggestion:* "Instead of a centralized `projects` table, should each Project be an independent WebID/Pod that contributors are granted access to via ACP?"
  - *Example Suggestion:* "Should comments live in the user's personal Pod and be linked to the Project via a Type Index, or stored directly in the Project's Pod?"
- **Vocabularies:** Propose RDF vocabularies for their legacy data (e.g., suggest `sioc:Thread` instead of a `topics` table).

#### Step 3: Generate the Functional Specification
Once the user agrees on the mapping, you **must generate a `webize-spec.md` file** in the root of the project using `/templates/webize-spec-template.md` as a guide. This file serves as the architectural blueprint for the codebase refactor. Do not begin coding until this file is created and approved.

---

## PHASE 2: Execution Checklist
Once `webize-spec.md` is approved, execute the refactor following these rules:

- [ ] **Analyze the Source Data:** Locate where the application currently stores or mocks its data (e.g., `src/data/mock.json` or an API folder).
- [ ] **Map to Vocabularies:** Translate plain JSON properties using the approved spec (FOAF, Schema.org, vCard, AS2).
- [ ] **Isolate the UI Components:** Find any component rendering an array of local items. Refactor it to accept an array of URIs instead.
- [ ] **Inject the Fetch Context:** Ensure that all reading and writing operations utilize the authenticated `fetch` mechanism or hooks dictated by the stack in `AGENTS.md`.
- [ ] **Enforce Open World Safety:** Wrap all data extractions in fallback guardrails (e.g., `item.title || 'Untitled Resource'`) to account for missing properties in autonomous graphs.

## Forbidden Patterns in Webize Mode
- *Never* write local `localStorage.setItem('user_data', ...)` for application records.
- *Never* bundle multiple distinct users' private profiles into a single monolithic file.
- *Never* hardcode file storage paths; you must resolve them dynamically via the user's WebID or Storage registries.
