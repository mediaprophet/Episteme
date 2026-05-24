import { bootSoukai, setEngine, FieldType } from 'soukai';
import { SolidModel, bootSolidModels, SolidEngine } from 'soukai-solid';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';

/**
 * Soukai Solid Profile Template
 * 
 * Notice how Soukai abstracts RDF into an Active-Record pattern. 
 * Instead of dealing with Datasets and Things, we define a Model class 
 * that maps directly to RDF vocabularies under the hood.
 */

// 1. Model Definition
export class Profile extends SolidModel {
  // Define the RDF classes this model represents
  static timestamps = false;
  static rdfContexts = {
    foaf: 'http://xmlns.com/foaf/0.1/',
  };
  static rdfsClasses = ['foaf:Person'];

  // Define the fields and their mapping to RDF properties
  static fields = {
    name: {
      type: FieldType.String,
      rdfProperty: 'foaf:name',
    },
    // Adding friends list as an array of WebIDs
    friends: {
      type: FieldType.Array,
      rdfProperty: 'foaf:knows',
      items: FieldType.Key,
    }
  };
}

// 2. Bootstrapping the Engine
export function initializeSoukai() {
  // Boot the models so Soukai knows their schemas
  bootSoukai();
  bootSolidModels();

  // Inject the authenticated fetch into Soukai's engine
  // This must be done AFTER the user logs in via Solid-OIDC
  const session = getDefaultSession();
  if (session.info.isLoggedIn) {
    setEngine(new SolidEngine(session.fetch));
  }
}

// 3. Usage Example
export async function updateProfileName(webId: string, newName: string) {
  try {
    // Active-Record 'find' method fetches the dataset and parses it into the model
    const profile = await Profile.find(webId);
    
    if (profile) {
      console.log(`Current name: ${profile.name}`);
      
      // Mutate the object directly
      profile.name = newName;
      
      // Save changes back to the Pod
      await profile.save();
      console.log('Profile updated successfully!');
    }
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
}

export async function createNewProfile(containerUrl: string, name: string) {
  // Create a new instance
  const newProfile = new Profile({ name });
  
  // Save it to a specific container in the Pod
  // Soukai automatically generates the Minted URI and saves the graph
  await newProfile.save(containerUrl);
  return newProfile.url;
}
