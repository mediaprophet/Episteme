import { getSolidDataset, getThing, getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";

/**
 * Interface representing standard User Profile Data
 */
export interface UserProfile {
  webId: string;
  name: string | null;
  avatar: string | null;
  friends: string[];
}

/**
 * Fetches a WebID profile and extracts key information using the Open World Assumption.
 * 
 * @param webId The user's Solid WebID URI
 * @returns A promise resolving to the UserProfile object
 */
export async function getProfile(webId: string, authFetch: typeof fetch = globalThis.fetch): Promise<UserProfile> {
  try {
    // 1. Fetch the dataset using the authenticated session fetch
    const dataset = await getSolidDataset(webId, { fetch: authFetch });
    
    // 2. Get the specific Thing representing the user
    const profileThing = getThing(dataset, webId);

    if (!profileThing) {
      throw new Error(`Profile Thing not found in dataset for ${webId}`);
    }

    // 3. Extract data safely. We assume data might be missing (Open World Assumption).
    const name = getStringNoLocale(profileThing, FOAF.name) || getStringNoLocale(profileThing, VCARD.fn);
    const avatar = getUrl(profileThing, VCARD.hasPhoto);
    
    // Solid graphs often use arrays for multiple values (like friends)
    // You'd typically use `getIriAll` for foaf:knows, but we'll return an empty array if none exist.
    const friends: string[] = []; // Placeholder for `getIriAll(profileThing, FOAF.knows)`

    return {
      webId,
      name,
      avatar,
      friends
    };
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
}
