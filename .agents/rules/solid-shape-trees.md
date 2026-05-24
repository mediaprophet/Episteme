---
description: Rules for validating RDF graphs using Shape Trees and SHACL.
globs: ["**/validation/**/*", "**/schemas/**/*", "**/shapes/**/*", "*.ts"]
---
# Solid Shape Trees and Validation Rules

In a decentralized ecosystem with the Open World Assumption, data can be sparse or malformed by other applications. Shape Trees provide a mechanism to guarantee that a specific LDP Container or Resource strictly adheres to a predefined data shape.

## Core Directives
1. **Validate Before Write:** Use Shape Trees or SHACL (Shapes Constraint Language) to ensure your application generates valid RDF before saving it back to the Pod.
2. **Discovery via Shape Trees:** When discovering data via the Solid Application Interoperability (SAI) registry, use the associated Shape Tree to instantly know what properties are guaranteed to exist on the resources within that container.
3. **Graceful Fallbacks:** If a fetched resource fails shape validation, the UI must gracefully handle the anomaly rather than crashing.

## Forbidden Patterns
- **No JSON Schema validation:** Do not attempt to use `ajv` or JSON Schema validators on Solid datasets. JSON schemas validate tree structures, whereas RDF data forms graphs.
- **No Blind Trusts:** Never blindly assume that a resource inside a generic `/public/` folder conforms to your application's expected structure.

## Example Pattern: SHACL Validation Concept
*(Using standard RDF/JS concepts)*
```javascript
// Validating an incoming dataset against a SHACL shape before processing
async function validateProfileData(dataset, shaclShape) {
  // Convert SolidDataset to an RDF/JS dataset (e.g. via N3.js)
  // Run SHACL engine (like rdf-validate-shacl) against the dataset
  // If validation fails, throw an explicit Error detailing the missing predicates
}
```
