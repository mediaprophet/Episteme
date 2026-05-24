---
description: Rules for using standard RDF vocabularies, mapping prefixes, and avoiding data hallucinations.
globs: ["**/data/**/*", "**/vocab/**/*", "**/rdf/**/*", "*.ts", "*.js"]
---
# Solid Well-Known Vocabularies

When writing data to a Solid Pod, you must use standard, well-known RDF vocabularies. Creating arbitrary JSON keys or hallucinating predicates destroys data interoperability.

## Core Directives
1. **Never Hallucinate Predicates:** Do not invent properties like `https://my-app.com/vocab#userName`. Use `http://xmlns.com/foaf/0.1/name` or `http://www.w3.org/2006/vcard/ns#fn`.
2. **Use the @inrupt Libraries:** Always rely on `@inrupt/vocab-common-rdf` and `@inrupt/vocab-solid` which contain pre-mapped constants for these URIs.
3. **Handle Namespaces Correctly:** If you must use a vocabulary not present in the Inrupt wrappers, clearly define the full URI string.

## The Well-Known Vocabularies List
When modeling Solid data, map your data to these core ontologies as referenced by the Solid project:

- **FOAF** (`http://xmlns.com/foaf/0.1/`): For social graphs, people, and basic profile info (e.g., `foaf:name`, `foaf:knows`).
- **VCARD** (`http://www.w3.org/2006/vcard/ns#`): For contact information (e.g., `vcard:hasPhoto`, `vcard:fn`, `vcard:hasEmail`).
- **SCHEMA** (`http://schema.org/`): For diverse entity descriptions (e.g., `schema:Person`, `schema:Date`).
- **LDP** (`http://www.w3.org/ns/ldp#`): For Linked Data Platform container definitions (e.g., `ldp:Container`, `ldp:contains`).
- **SOLID** (`http://www.w3.org/ns/solid/terms#`): For Solid-specific terms (e.g., `solid:publicTypeIndex`, `solid:privateTypeIndex`, `solid:account`).
- **PIM** (`http://www.w3.org/ns/pim/space#`): For personal workspace definitions (e.g., `pim:storage`, `pim:workspace`).
- **DCTERMS** (`http://purl.org/dc/terms/`): For generic metadata (e.g., `dct:modified`, `dct:created`).
- **ACL / ACP**: (`http://www.w3.org/ns/auth/acl#` / `http://www.w3.org/ns/solid/acp#`): For access control policies (though typically abstracted by `universalAccess`).

## Example Pattern: Using Core Vocabs
```javascript
import { getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";
import { SOLID } from "@inrupt/vocab-solid";

// Safely retrieving standard properties from a profile Thing
const name = getStringNoLocale(profileThing, FOAF.name) || getStringNoLocale(profileThing, VCARD.fn);
const avatar = getUrl(profileThing, VCARD.hasPhoto);
const storageRoot = getUrl(profileThing, "http://www.w3.org/ns/pim/space#storage");
```
