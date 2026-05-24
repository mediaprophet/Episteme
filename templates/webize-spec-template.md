# Webize Functional Specification: [Project Name]

## 1. Architectural Shift
| Feature | As-Is (Centralized) | To-Be (Decentralized / Solid) |
| :--- | :--- | :--- |
| **Identity** | e.g., Auth0 / Users Table | Solid-OIDC & WebID |
| **Storage** | e.g., MongoDB / AWS S3 | User Pods / Project Pods |
| **Permissions**| e.g., Role-Based Access Control | WAC / ACP (universalAccess) |

## 2. Entity & Vocabulary Mapping
*How traditional database tables translate to Linked Data.*

- **Legacy Entity:** `[e.g., Employee]`
  - **Solid Concept:** `[e.g., Contributor]`
  - **RDF Class:** `[e.g., foaf:Person]`
  - **Storage Location:** `[e.g., The Contributor's Personal Pod]`
  
- **Legacy Entity:** `[e.g., Company Workspace]`
  - **Solid Concept:** `[e.g., Cooperative Project]`
  - **RDF Class:** `[e.g., org:Organization or doap:Project]`
  - **Storage Location:** `[e.g., A dedicated Shared Pod]`

## 3. Storage Topology & Discovery
*How applications find the data.*
- [ ] Uses Public Type Index to discover `[Class]`
- [ ] Uses explicit URI sharing for `[Class]`

## 4. UI Refactoring Checklist
- [ ] Convert `[Component A]` to fetch via WebID.
- [ ] Remove synchronous Redux/Context state from `[Component B]`.
