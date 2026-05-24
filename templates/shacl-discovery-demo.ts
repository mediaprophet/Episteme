/**
 * SHACL Shape Discovery & Validation Pattern
 * 
 * Demonstrates the core discovery workflows outlined in the W3C Solid community's 
 * solid-llm-skills guidelines, including HTTP Link header parsing, metadata graph queries, 
 * referencing the Solid SHACL Shapes Catalogue, and executing graceful validation fallbacks.
 */

import {
  SolidDataset,
  getSolidDataset,
  getThing,
  getUrl,
  getUrlAll,
  getThingAll
} from '@inrupt/solid-client';

// Core namespace constants
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const SOLID_SHAPE = "http://www.w3.org/ns/solid/terms#shape";

/**
 * 1. HTTP HEAD Link Header Discovery
 * Parses HTTP headers to discover a resource's governing shape/schema URI.
 * Solid servers should expose this via rel="describedby" Link headers.
 */
export async function discoverShapeFromHeaders(
  resourceUri: string,
  authFetch: typeof fetch = fetch
): Promise<string | null> {
  try {
    const response = await authFetch(resourceUri, { method: 'HEAD' });
    const linkHeader = response.headers.get('Link');
    if (!linkHeader) return null;

    // Parse standard RFC 5988 Link headers: e.g., <https://example.org/shapes/project.ttl>; rel="describedby"
    const links = linkHeader.split(',').map(part => part.trim());
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (match && match[2] === 'describedby') {
        return match[1];
      }
    }
  } catch (error) {
    console.warn(`[SHACL Discovery] Failed to fetch Link headers for ${resourceUri}:`, error);
  }
  return null;
}

/**
 * 2. Resource Metadata Discovery
 * Queries the resource metadata graph for a solid:shape or similar declaration.
 */
export function discoverShapeFromMetadata(
  dataset: SolidDataset,
  resourceUri: string
): string | null {
  const thing = getThing(dataset, resourceUri);
  if (!thing) return null;

  // Retrieve the value of the solid:shape predicate
  return getUrl(thing, SOLID_SHAPE);
}

/**
 * 3. Shape Catalogue Reference
 * Maps common rdf:type URIs to their well-known SHACL shapes in the
 * Solid SHACL Shapes Catalogue (github.com/solid/shapes).
 */
export const SHACL_SHAPES_CATALOGUE: Record<string, string> = {
  "http://xmlns.com/foaf/0.1/Person": "https://raw.githubusercontent.com/solid/shapes/main/vcard.ttl",
  "http://www.w3.org/2006/vcard/ns#Individual": "https://raw.githubusercontent.com/solid/shapes/main/vcard.ttl",
  "http://usefulinc.com/ns/doap#Project": "https://raw.githubusercontent.com/mediaprophet/Episteme/main/utils/shapes/project-shape.ttl"
};

/**
 * Falls back to looking up standard class shapes from the global SHACL Shapes Catalogue.
 */
export function discoverShapeFromCatalogue(dataset: SolidDataset, resourceUri: string): string | null {
  const thing = getThing(dataset, resourceUri);
  if (!thing) return null;

  // Get the rdf:type values
  const types = getUrlAll(thing, RDF_TYPE);
  for (const type of types) {
    if (SHACL_SHAPES_CATALOGUE[type]) {
      return SHACL_SHAPES_CATALOGUE[type];
    }
  }
  return null;
}

/**
 * 4. Combined Discovery Orchestrator
 * Performs the standard multi-tiered discovery pipeline.
 */
export async function discoverShape(
  resourceUri: string,
  dataset: SolidDataset,
  authFetch: typeof fetch = fetch
): Promise<string | null> {
  // Tier 1: Check Link headers on the live resource
  let shapeUri = await discoverShapeFromHeaders(resourceUri, authFetch);
  if (shapeUri) return shapeUri;

  // Tier 2: Check inside the resource graph for inline metadata (solid:shape)
  shapeUri = discoverShapeFromMetadata(dataset, resourceUri);
  if (shapeUri) return shapeUri;

  // Tier 3: Check standard type mappings in the SHACL Shapes Catalogue
  shapeUri = discoverShapeFromCatalogue(dataset, resourceUri);
  if (shapeUri) return shapeUri;

  return null;
}

/**
 * 5. Dynamic Validation & Graceful Fallback
 * Demonstrates compiling error reports (justification trees) and enforcing
 * the "degraded UI fallback" model instead of hard crashes.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export async function validateResource(
  resourceUri: string,
  dataset: SolidDataset,
  shapeUri: string | null
): Promise<ValidationResult> {
  const errors: string[] = [];

  if (!shapeUri) {
    // If no shape is discovered, perform basic data-driven structural check (fallback)
    const thing = getThing(dataset, resourceUri);
    if (!thing) {
      return { isValid: false, errors: ["Resource contains no readable data (no subject found)."] };
    }
    // Basic heuristics (e.g. must have some properties)
    const predicates = Object.keys(thing.predicates);
    if (predicates.length === 0) {
      errors.push("Data-driven check: Resource contains no predicates.");
    }
    return { isValid: errors.length === 0, errors };
  }

  // Simulated execution of an RDF SHACL engine (like rdf-validate-shacl)
  // In production, you would load the shapeUri graph, parse both graphs using N3, and execute:
  // const validator = new SHACLValidator(shapeDataset);
  // const report = validator.validate(dataDataset);
  
  const thing = getThing(dataset, resourceUri);
  if (!thing) {
    return { isValid: false, errors: [`Subject ${resourceUri} not found in dataset.`] };
  }

  // Basic mock implementation of key constraints (matching our project-shape.ttl validation)
  if (shapeUri.includes("project")) {
    const name = getUrl(thing, "http://usefulinc.com/ns/doap#name");
    if (!name) {
      errors.push("SHACL Violation: doap:name is a mandatory property of doap:Project.");
    }
    const maintainer = getUrl(thing, "http://usefulinc.com/ns/doap#maintainer");
    if (!maintainer) {
      errors.push("SHACL Violation: doap:maintainer must point to a maintainer WebID.");
    }
    const provider = getUrl(thing, "https://schema.org/hostingProvider");
    if (!provider) {
      errors.push("SHACL Violation: schema:hostingProvider must point to a hosting provider WebID/IRI.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
