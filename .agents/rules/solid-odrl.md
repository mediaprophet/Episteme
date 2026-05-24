---
description: Rules for enforcing Open Digital Rights Language (ODRL) policies on personal data to protect human-centric usage rights.
globs: ["**/policies/**/*", "**/consent/**/*", "**/rights/**/*", "*.ts"]
---
# Open Digital Rights Language (ODRL) Rules

While Access Control (ACL) dictates *who* can access a resource, ODRL dictates *how* they are legally/ethically permitted to use it. This is the cornerstone of Human-Centric data agency.

## Core Directives

### 1. Augmenting ACL with Policies
- **Action:** When creating a sensitive data vault or granting third-party app access, do not stop at WAC/ACP. You MUST generate an ODRL policy attached to the dataset.
- **Vocabulary:** Use the ODRL namespace (`http://www.w3.org/ns/odrl/2/`).

### 2. Human-Centric Rule Mapping
- **Constraint:** Policies should express precise human rights contexts. 
- **Action:** Define explicit `odrl:Rule` entities. For example:
  - **Purpose Limitation:** Restrict usage to academic research, preventing commercial exploitation.
  - **Temporal Expiry:** Set explicit deletion or revocation dates.
  - **Attribution:** Require the data subject's agency to be acknowledged.

### 3. Defensive Interoperability
- **Action:** ODRL policies should be stored either within the same RDF document as the sensitive data (as metadata) or linked via an `odrl:hasPolicy` predicate from the target resource.
- **Compliance:** Note that while WAC/ACP is enforced cryptographically by the Solid server, ODRL is often a contractual/ethical enforcement layer that the consuming application must respect. Document this distinction in your code comments.
