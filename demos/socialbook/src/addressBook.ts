import { getSolidDataset, getThingAll, getUrl, getStringNoLocale } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

const VCARD = "http://www.w3.org/2006/vcard/ns#";
const FOAF = "http://xmlns.com/foaf/0.1/";

export interface Contact {
  webId: string;
  name: string;
}

/**
 * Scans a user's WebID profile for known connections (foaf:knows).
 */
export async function getAddressBook(webId: string): Promise<Contact[]> {
  try {
    const profileDataset = await getSolidDataset(webId, { fetch });
    const profileThings = getThingAll(profileDataset);
    
    const contacts: Contact[] = [];

    // Look for foaf:knows links
    for (const thing of profileThings) {
      const knownWebId = getUrl(thing, `${FOAF}knows`);
      if (knownWebId) {
        // Attempt to fetch their name if possible
        let name = "Unknown Contact";
        try {
          const contactDataset = await getSolidDataset(knownWebId, { fetch });
          const contactThings = getThingAll(contactDataset);
          for (const cThing of contactThings) {
            const cName = getStringNoLocale(cThing, `${VCARD}fn`);
            if (cName) {
              name = cName;
              break;
            }
          }
        } catch (e) {
          // If we can't fetch their profile, just use WebID
          name = knownWebId;
        }

        contacts.push({ webId: knownWebId, name });
      }
    }

    // If empty, let's mock a few for the demo so the user can see the UI
    if (contacts.length === 0) {
      return [
        { webId: "https://alice.solidcommunity.net/profile/card#me", name: "Alice (Demo)" },
        { webId: "https://bob.solidcommunity.net/profile/card#me", name: "Bob (Demo)" }
      ];
    }

    return contacts;
  } catch (error) {
    console.error("Error fetching address book:", error);
    return [];
  }
}
