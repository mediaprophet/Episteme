---
description: Rules for reading, writing, and modeling RDF Linked Data from Solid Pods based on the declared stack.
globs: ["**/api/**/*", "**/services/**/*", "**/models/**/*", "*.ts", "*.tsx"]
---
# Solid Data Manipulation Rules

Check `AGENTS.md` for the declared Data Manipulation library before writing code.

## 1. If the stack uses LDO (Linked Data Objects):
- **Core Concept:** LDO uses Shape Expressions (ShEx) to generate TypeScript interfaces. Do not write raw RDF manipulation or use Inrupt methods.
- **Pattern:** Interact with data as standard JSON-like JavaScript objects. 
- **Writing Data:** Mutate the generated proxy object directly (e.g., `profile.name = "Alice"`), then call the commit function.
- **UI Binding:** If using React, use the `@ldo/solid-react` hooks (`useResource`, `useSubject`) to bind decentralized data to local state.

## 2. If the stack uses Soukai Solid:
- **Core Concept:** Soukai is an Active-Record ODM. It treats Solid data like documents.
- **Pattern:** Define models extending `SolidModel`.
- **Writing Data:** Use standard ODM methods like `Profile.find(webId)` or `newProfile.save()`.

## 3. If the stack uses @inrupt/solid-client:
- **Core Concept:** Immutability and pure functions.
- **Pattern:** Fetch `SolidDataset`s, extract `Thing`s, and build new datasets using `setThing`.
- **Writing Data:** Always use `@inrupt/vocab-common-rdf` for property IRIs (e.g., `FOAF.name`). Never invent string keys. Save back to the pod using `saveSolidDatasetAt`.
