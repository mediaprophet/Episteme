import { 
  createSolidDataset, 
  buildThing, 
  createThing, 
  saveSolidDatasetAt 
} from "@inrupt/solid-client";
import { FOAF, VCARD, RDF } from "@inrupt/vocab-common-rdf";
// In a real test environment, this would be an authenticated fetch from a mock session
// For example, using the Session object from @inrupt/solid-client-authn-node
import { fetch } from "@inrupt/solid-client-authn-browser"; 

/**
 * Seeds a local Community Solid Server with dummy WebID profile data.
 * This ensures tests have a predictable state to run against.
 * 
 * @param podUrl The base URL of the user's pod on the local CSS (e.g., http://localhost:3000/alice/)
 */
export async function seedTestData(podUrl: string) {
  const profileUrl = `${podUrl}profile/card`;
  const webId = `${profileUrl}#me`;

  console.log(`Seeding data for WebID: ${webId}`);

  // Build a dummy profile Thing
  const profileThing = buildThing(createThing({ name: "me" }))
    .addUrl(RDF.type, FOAF.Person)
    .addStringNoLocale(FOAF.name, "Alice Tester")
    .addStringNoLocale(VCARD.fn, "Alice Tester")
    .addUrl(VCARD.hasPhoto, `${podUrl}profile/avatar.png`)
    // Adding dummy friends
    .addUrl(FOAF.knows, "http://localhost:3000/bob/profile/card#me")
    .addUrl(FOAF.knows, "http://localhost:3000/charlie/profile/card#me")
    .build();

  // Create a new dataset and insert the Thing
  let dataset = createSolidDataset();
  dataset = Object.assign(dataset, { graphs: { default: { [webId]: profileThing } } }); // Simplified insertion

  try {
    // Save to the local CSS instance
    await saveSolidDatasetAt(profileUrl, dataset, { fetch });
    console.log("Test data seeded successfully.");
  } catch (error) {
    console.error("Failed to seed test data:", error);
    throw error;
  }
}
