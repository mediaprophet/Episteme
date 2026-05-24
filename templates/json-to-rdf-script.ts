import { Session } from '@inrupt/solid-client-authn-node';
import { buildThing, createThing, setThing, saveSolidDatasetAt, createSolidDataset } from '@inrupt/solid-client';
import { FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf';
import * as fs from 'fs';

/**
 * Solid Data Migration Template
 * 
 * This script migrates a legacy centralized JSON array of "Users" into 
 * individual decentralized FOAF Profiles in a target Solid Pod container.
 */

async function runMigration() {
  const session = new Session();

  // 1. Authenticate in a Node environment
  await session.login({
    oidcIssuer: 'https://solidcommunity.net',
    clientName: 'Webize Migration Script',
    handleRedirect: (url) => {
      console.log(`\nPlease visit this URL to authenticate the migration script:\n${url}\n`);
    }
  });

  if (!session.info.isLoggedIn) {
    throw new Error('Login failed');
  }

  // 2. Load Legacy Data
  const legacyData = JSON.parse(fs.readFileSync('./legacy-users.json', 'utf-8'));
  const targetContainer = 'https://my-pod.solidcommunity.net/migrated-users/';

  console.log(`Starting migration of ${legacyData.length} records...`);

  // 3. Process with Concurrent Batching & Null Checks
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < legacyData.length; i += BATCH_SIZE) {
    const batch = legacyData.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (legacyUser: any) => {
      // Map legacy JSON to RDF Vocabularies
      let builder = buildThing(createThing({ name: legacyUser.id }))
        .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', FOAF.Person);

      // Open World Assumption: Defensive Null Checks
      if (legacyUser.fullName) {
        builder = builder.addStringNoLocale(FOAF.name, legacyUser.fullName);
      }
      if (legacyUser.emailAddress) {
        builder = builder.addStringNoLocale(SCHEMA_INRUPT.email, legacyUser.emailAddress);
      }

      const userThing = builder.build();

      let dataset = createSolidDataset();
      dataset = setThing(dataset, userThing);

      // Mint the new URI
      const targetUrl = `${targetContainer}${legacyUser.id}`;

      try {
        // 4. Save to the Pod using the authenticated fetch
        await saveSolidDatasetAt(targetUrl, dataset, { fetch: session.fetch });
        console.log(`Migrated: ${legacyUser.fullName || legacyUser.id} -> ${targetUrl}`);
      } catch (error) {
        console.error(`Failed to migrate ${legacyUser.id}:`, error);
      }
    }));
    
    // Minimal delay between chunks to respect strict Solid server rate limits
    await new Promise(resolve => setTimeout(resolve, 100)); 
  }

  console.log('Migration complete.');
}

runMigration();
