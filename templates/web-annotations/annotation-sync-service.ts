/**
 * W3C Web Annotation Sync Service
 * 
 * Demonstrates creating and retrieving user-generated highlights 
 * and notes using the standard `oa:Annotation` vocabulary, saving 
 * them directly to the user's Solid Pod.
 */

import { Session } from '@inrupt/solid-client-authn-browser';
import { 
  createSolidDataset, 
  buildThing, 
  createThing, 
  setThing, 
  saveSolidDatasetAt,
  getSolidDataset,
  getThingAll,
  getUrl
} from '@inrupt/solid-client';

const OA = "http://www.w3.org/ns/oa#";
const AS = "https://www.w3.org/ns/activitystreams#";

export async function createWebAnnotation(
  targetUrl: string, 
  bodyText: string, 
  solidSession: Session, 
  podStorageUrl: string
) {
  if (!solidSession.info.isLoggedIn) throw new Error("User must be logged in");

  const webId = solidSession.info.webId!;
  
  // Create the Annotation body (the text note)
  const bodyThing = buildThing(createThing({ name: 'body' }))
    .addStringNoLocale('http://www.w3.org/1999/02/22-rdf-syntax-ns#value', bodyText)
    .build();

  // Create the standard Web Annotation
  const annotationThing = buildThing(createThing({ name: `annotation-${Date.now()}` }))
    .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${OA}Annotation`)
    .addUrl(`${OA}hasTarget`, targetUrl)
    .addUrl(`${OA}hasBody`, bodyThing.url)
    .addUrl(`${AS}author`, webId)
    .addDatetime('http://purl.org/dc/terms/created', new Date())
    .build();

  // Combine into a dataset
  let dataset = createSolidDataset();
  dataset = setThing(dataset, bodyThing);
  dataset = setThing(dataset, annotationThing);

  // Store in the user's dedicated annotations container
  const annotationsContainer = `${podStorageUrl}annotations/`;
  await saveSolidDatasetAt(annotationsContainer + Date.now() + ".ttl", dataset, {
    fetch: solidSession.fetch
  });

  return dataset;
}
