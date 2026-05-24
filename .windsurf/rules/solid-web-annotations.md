---
description: Rules for generating and storing user-generated content (notes, highlights, bookmarks) using the W3C Web Annotation Data Model (oa:Annotation).
globs: ["**/annotations/**/*", "**/highlights/**/*", "**/comments/**/*", "*.ts", "*.tsx"]
alwaysApply: false
---
# W3C Web Annotations in Solid

This directive standardizes how user-generated content (notes, highlights, bookmarks, reading progress) is modeled and stored using the official **W3C Web Annotation Data Model** (`http://www.w3.org/ns/oa#`).

## 1. Core Directives
1. **The Ban on Proprietary Schemas:** Never model a user's comment, note, or highlight using a custom JSON structure or a proprietary database record.
2. **Attribution:** Every annotation MUST be attributed to the user's WebID via `dcterms:creator` or `as:author`.
3. **Storage Location:** Annotations are stored in the user's Solid Pod (typically inside a dedicated container `/annotations/`), NEVER on application-specific servers.
4. **Target and Body:** Every annotation MUST have an `oa:hasTarget` (identifying the resource, paragraph, or URL annotated) and `oa:hasBody` (the content of the note/highlight).

## 2. Concrete Code Example

Here is how to create and write a compliant Web Annotation using `@inrupt/solid-client`:

```typescript
import { 
  createThing, 
  setThing, 
  buildThing, 
  createSolidDataset, 
  saveSolidDatasetAt 
} from "@inrupt/solid-client";
import { RDF, DCTERMS } from "@inrupt/vocab-common-rdf";

const OA_NAMESPACE = "http://www.w3.org/ns/oa#";
const OA = {
  Annotation: `${OA_NAMESPACE}Annotation`,
  hasTarget: `${OA_NAMESPACE}hasTarget`,
  hasBody: `${OA_NAMESPACE}hasBody`,
  TextualBody: `${OA_NAMESPACE}TextualBody`,
  chars: `${OA_NAMESPACE}chars`,
  format: `${OA_NAMESPACE}format`
};

/**
 * Creates a standard W3C Web Annotation
 * @param targetUrl The resource being annotated
 * @param commentText The body content of the annotation
 * @param authorWebId The annotator's WebID
 */
export function createWebAnnotation(
  targetUrl: string, 
  commentText: string, 
  authorWebId: string
) {
  // 1. Create the Body Thing (Textual content)
  const bodyThing = buildThing(createThing())
    .addUrl(RDF.type, OA.TextualBody)
    .addStringNoLocale(OA.chars, commentText)
    .addStringNoLocale(OA.format, "text/plain")
    .build();

  // 2. Create the Annotation Thing
  const annotationThing = buildThing(createThing())
    .addUrl(RDF.type, OA.Annotation)
    .addUrl(OA.hasTarget, targetUrl)
    .addUrl(OA.hasBody, bodyThing.url)
    .addUrl(DCTERMS.creator, authorWebId)
    .addDatetime(DCTERMS.created, new Date())
    .build();

  // 3. Assemble and save to the user's annotations container
  let dataset = createSolidDataset();
  dataset = setThing(dataset, bodyThing);
  dataset = setThing(dataset, annotationThing);

  return { dataset, annotationUrl: annotationThing.url };
}
```

## 3. Anti-Patterns
- **Anti-Pattern:** Saving comments in a central Postgres database owned by the application. This causes user lock-in and violates GDPR/sovereignty guidelines.
- **Anti-Pattern:** Using standard `schema:Comment` as a flat object without a target pointer. Annotations require the decoupling of `oa:hasTarget` and `oa:hasBody`.
- **Anti-Pattern:** Storing the comment text directly on the annotation resource rather than referencing a distinct body resource (`oa:hasBody`). Doing so violates the W3C spec graph layout.
