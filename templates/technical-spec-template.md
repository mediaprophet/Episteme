# Technical Specification: [App Name]

## 1. Stack Declaration
*Define the libraries and target environment for this specific app based on `AGENTS.md`.*
- **Target Platform:** [e.g., Static Web, Mobile Native, Browser Extension]
- **Authentication:** [e.g., @inrupt/solid-client-authn-browser]
- **Data Manipulation:** [e.g., LDO, Soukai, @inrupt/solid-client]

## 2. Ontology & Data Topology
*Define the specific RDF vocabularies being used to represent the functional nouns. Never invent proprietary JSON keys.*

| Functional Entity | RDF Ontology / Class | Description |
|---|---|---|
| User Profile | `foaf:Person` | Standard WebID profile. |
| [Entity Name] | `[namespace:Class]` | [Description] |

**Storage Strategy:** *Where does the data live? Describe the container structure within the user's Pod (e.g., `https://pod.example/public/app-data/`).*

## 3. Authentication & Network Architecture
*Based on the declared Target Platform, define the exact Auth flow.*
- **Redirect Mechanism:** [e.g., window.location.href, custom protocol `app://`, deep linking]
- **DPoP Strategy:** [e.g., Standard WebCrypto, Mobile Polyfills]

## 4. Access Control & Sovereignty (WAC/ODRL)
*Define who can access the data and what the usage constraints are.*
- **Read Permissions:** [Who can read? Public? Specific WebIDs?]
- **Write/Append Permissions:** [Who can write? (LDN Inboxes require Append)]
- **ODRL Policies:** [Are there explicit usage constraints? e.g., Expiry dates, Purpose limitations.]

## 5. Async UI & Data Binding
*Define how the app handles network latency and the Open World Assumption (OWA).*
- **State Management:** [e.g., @ldo/solid-react hooks, custom React Context]
- **Offline/Caching:** [Is local caching required?]
