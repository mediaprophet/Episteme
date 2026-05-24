---
description: Rules for validating RDF graphs using Shape Trees and SHACL.
globs: ["**/validation/**/*", "**/schemas/**/*", "**/shapes/**/*", "*.ts"]
---
# Solid Shape Trees and SHACL Discovery/Validation Rules

In a decentralized ecosystem operating under the Open World Assumption, data can be sparse, extended, or structured differently by various applications. Shape Trees and SHACL (Shapes Constraint Language) provide mechanisms to discover, validate, and enforce expected RDF shapes without violating data interoperability.

## 1. Core Concepts
- **`sh:NodeShape`:** Defines a set of validation constraints on an RDF resource node.
- **`sh:targetClass`:** Links a NodeShape to a specific class (e.g. `foaf:Person`, `doap:Project`), asserting that the shape applies to any resources of that type.
- **`sh:property`:** Defines individual property constraints (predicate paths, expected datatypes, minimum/maximum counts).

---

## 2. SHACL & Shape Tree Discovery
Applications must discover schemas dynamically rather than assuming a static local definition:
- **`Link` Header Discovery:** Check the HTTP headers of a resource for `Link: <shape-uri>; rel="describedby"`. This indicates the SHACL shape or Shape Tree governing the resource.
- **Resource Metadata:** Check the resource's metadata graph for predicates linking to validation shapes (such as `solid:shape` or shape tree assignments).
- **The Solid SHACL Shapes Catalogue:** Actively reference the official catalogue of shared shapes at [github.com/solid/shapes](https://github.com/solid/shapes) for common structures (e.g., vCards, physical addresses, calendar events).
- **Automated Generation (Astrea):** Leverage translation engines (like Astrea) to generate SHACL shape definitions directly from standardized ontologies.
- **Data-Driven Inference:** If no shape is declared, fall back to analyzing instance triples (data-driven schema discovery) or prompting the user to associate a shape.

---

## 3. Core Directives & Best Practices

1. **Validate Before Write:** Use Shape Trees or SHACL engines (e.g., `rdf-validate-shacl`) to ensure your application constructs valid RDF graphs before saving them back to the Pod.
2. **Prioritize Interoperability over Strictness:** 
   - Write shapes that enforce *minimum requirements* (e.g., must have a name, must have a WebID) rather than strict closed boundaries.
   - Do not use `sh:closed true` unless you have explicit security/system reasons. Doing so prevents other Solid applications from enriching the same resources with useful complementary metadata.
3. **Link Resources to Their Shapes:** When creating new containers or resources, declare their governing shapes or shape trees in the metadata so other client applications can discover how to render and edit them.
4. **Graceful Fallbacks:** If a fetched resource fails shape validation, do not crash the application. Log the validation errors (generating descriptive "justification trees") and render a degraded UI with the fields that are present.

---

## 4. Forbidden Patterns & Anti-patterns

- **No JSON Schema Validation:** Do not attempt to use JSON Schema (`ajv`, etc.) to validate Solid datasets. JSON schema is designed for strict JSON tree hierarchies, whereas RDF data models are directed graphs.
- **No Blind Trust:** Never blindly assume that resources inside a public folder conform to your expected schema. Always check for a governing shape tree or run a validator.
- **Overly Rigid Constraints:** Do not define shapes that fail validation on unexpected extra triples. Under the Open World Assumption, another app adding `schema:birthDate` to a profile must not break your profile-viewer.
- **Failing to Publish Shapes:** Never write a Solid application that uses a proprietary, un-published shape structure. Store your SHACL shape documents in public, linkable locations (either on the Web or in a public folder on the user's Pod).

---

## 5. Example Pattern: SHACL Validation Concept
*(Using standard RDF/JS concepts)*
```javascript
// Validating an incoming dataset against a SHACL shape before processing
async function validateProfileData(dataset, shaclShape) {
  // Convert SolidDataset to an RDF/JS dataset (e.g. via N3.js)
  // Run SHACL engine (like rdf-validate-shacl) against the dataset
  // If validation fails, throw an explicit Error detailing the missing predicates
}
```
