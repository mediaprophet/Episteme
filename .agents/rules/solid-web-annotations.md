# W3C Web Annotations in Solid

This directive standardizes how AI agents generate code for user-generated content (notes, highlights, bookmarks, reading progress) using the official W3C Web Annotation Data Model (`oa:Annotation`).

## 1. The Ban on Proprietary Schemas
**Goal:** Prevent lock-in for user-generated content.
- **Rule:** Never model a user's comment, note, or highlight using a custom JSON structure or a proprietary database row.
- **Forbidden:** Do not use `schema:Comment` if a more precise `oa:Annotation` is applicable.

## 2. Structure of an Annotation
**Goal:** Maintain semantic interoperability across applications.
- **Rule:** Every annotation MUST have an `oa:hasTarget` (the URI of the webpage, book, or resource being annotated).
- **Rule:** Every annotation MUST have an `oa:hasBody` (the content of the note or highlight) unless it is a simple bookmark or progress marker.
- **Rule:** Annotations MUST be attributed to the user's WebID via `as:author` or `dcterms:creator`.

## 3. Storage Location
**Goal:** Data Sovereignty.
- **Rule:** Annotations are stored in the user's Solid Pod (e.g., `/annotations/`), NEVER in the application provider's backend.
- **Implementation:** Applications must query the user's Pod to discover their annotations for a given target, joining that data dynamically at the client layer.
