---
description: Rules for data discovery, Solid Application Interoperability (SAI), Type Indexes, and Decentralized Identifiers (DIDs).
globs: ["**/discovery/**/*", "**/identity/**/*", "**/registry/**/*", "*.ts"]
---
# Solid Interoperability and Identity Rules

Applications must never operate in silos. They must rely on standardized discovery mechanisms to find where a user has chosen to store specific types of data, preserving the user's ultimate agency over their storage topology.

## Core Directives

1. **No Hardcoded App Folders:** Never hardcode data storage paths (e.g., `https://pod.example/my-app/data`). You must dynamically discover where the user stores specific data types.
2. **Data Discovery Methods:**
   - **Type Indexes:** Use the user's Public or Private Type Index (referenced in their WebID Profile) to locate instances of specific RDF classes.
   - **Solid Application Interoperability (SAI):** If implementing SAI, use the Application Registration and Data Registries to negotiate access to data shapes.
3. **Data Validation:** Use Shape Trees or SHACL when validating the structure of incoming RDF graphs to ensure cross-application compatibility.
4. **Identity and Cryptography:** - Standard identity resolution starts with the WebID Profile Document.
   - When integrating Verifiable Credentials or cryptographic proofs, ensure the system can resolve and interact with the `did:solid` method alongside standard HTTP-URI WebIDs. 
   
## Example Pattern: Discovering Data via Type Indexes
```javascript
import { getSolidDataset, getThing, getUrlAll } from "@inrupt/solid-client";
import { SOLID } from "@inrupt/vocab-solid";

/**
 * Discovers where a user stores a specific type of data (e.g., AddressBook)
 * by reading their Public Type Index.
 */
async function discoverDataStorage(webId, targetClass, session) {
  // 1. Fetch the WebID Profile
  const profileDataset = await getSolidDataset(webId, { fetch: session.fetch });
  const profileThing = getThing(profileDataset, webId);
  
  // 2. Locate the Public Type Index
  const typeIndexUrl = getUrl(profileThing, SOLID.publicTypeIndex);
  if (!typeIndexUrl) return [];

  // 3. Fetch the Index and find matching Type Registrations
  const indexDataset = await getSolidDataset(typeIndexUrl, { fetch: session.fetch });
  // (In practice, iterate through the index to match the `solid:forClass` property 
  // and return the `solid:instance` or `solid:instanceContainer` URLs)
}

```
