/**
 * Solid Compliance Checker
 * 
 * A utility for tests and CI pipelines to assert that generated 
 * datasets adhere strictly to Episteme's W3C rules before they are 
 * deployed or pushed to a user's Pod.
 */

import { SolidDataset, getThingAll, getUrl } from '@inrupt/solid-client';

const OA = "http://www.w3.org/ns/oa#";

/**
 * Asserts that any Web Annotation in the dataset is well-formed.
 * Throws an error if compliance fails.
 */
export function assertWebAnnotationCompliance(dataset: SolidDataset): void {
  const things = getThingAll(dataset);
  
  for (const thing of things) {
    const types = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') || [];
    const isAnnotation = Array.isArray(types) ? types.includes(`${OA}Annotation`) : types === `${OA}Annotation`;

    if (isAnnotation) {
      const hasTarget = getUrl(thing, `${OA}hasTarget`);
      if (!hasTarget) {
        throw new Error(`Compliance Failure: Web Annotation ${thing.url} is missing an oa:hasTarget property.`);
      }
    }
  }
}
