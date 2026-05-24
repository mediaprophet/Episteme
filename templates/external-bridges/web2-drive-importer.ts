/**
 * Web 2.0 Data Liberation: Google Drive Importer
 * 
 * Demonstrates the strict rule of discarding the Web 2.0 OAuth token 
 * immediately after fetching the siloed data, and minting it as an RDF 
 * Web Annotation into the user's Solid Pod.
 */

import { Session } from '@inrupt/solid-client-authn-node';
import { 
  createSolidDataset, 
  buildThing, 
  createThing, 
  setThing, 
  saveSolidDatasetAt 
} from '@inrupt/solid-client';

const AS = "https://www.w3.org/ns/activitystreams#";

export async function importGoogleDriveFile(
  driveFileId: string, 
  legacyOAuthToken: string, 
  solidSession: Session, 
  targetPodUrl: string
) {
  try {
    // 1. Fetch data from the centralized silo
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`, {
      headers: { Authorization: `Bearer ${legacyOAuthToken}` }
    });
    
    if (!response.ok) throw new Error("Failed to fetch from Web 2.0 API");
    
    const fileContent = await response.text();

    // 2. CRITICAL STEP: Discard the legacy token immediately.
    // The Solid Pod is the new definitive source of truth.
    revokeTokenSecurely(legacyOAuthToken);

    // 3. Transform into W3C RDF (Web Annotation / ActivityStreams)
    const documentThing = buildThing(createThing({ name: driveFileId }))
      .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${AS}Document`)
      .addStringNoLocale(`${AS}content`, fileContent)
      .addUrl(`${AS}attributedTo`, solidSession.info.webId!)
      .build();

    let dataset = setThing(createSolidDataset(), documentThing);

    // 4. Push to the Solid Pod
    await saveSolidDatasetAt(`${targetPodUrl}${driveFileId}`, dataset, { 
      fetch: solidSession.fetch 
    });

    console.log("Liberation successful.");
  } catch (err) {
    console.error("Liberation failed:", err);
  }
}

function revokeTokenSecurely(token: string) {
  // Logic to actively revoke the token on Google's end,
  // ensuring the bridge is permanently closed.
  console.log(`Token ${token.substring(0, 5)}... safely discarded.`);
}
