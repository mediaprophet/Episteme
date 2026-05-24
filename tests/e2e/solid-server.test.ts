import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { startLocalCSS, stopLocalCSS } from '../../utils/testing/setup-local-css';
import { seedTestData } from '../../utils/testing/seed-test-data';
import { getProfile } from '../../templates/profile-viewer';

// We run the CSS on a test-specific port
const TEST_PORT = 3001;
const POD_URL = `http://localhost:${TEST_PORT}/alice/`;

describe('E2E Solid Server Integration', () => {

  beforeAll(async () => {
    // 1. Spin up the in-memory Community Solid Server
    await startLocalCSS(TEST_PORT);
    
    // 2. Seed it with the dummy RDF data (Alice Tester & friends)
    await seedTestData(POD_URL);
  });

  afterAll(async () => {
    // 3. Tear down the server
    await stopLocalCSS();
  });

  it('should successfully fetch and parse a WebID profile from a live Pod', async () => {
    const webId = `${POD_URL}profile/card#me`;
    
    // We utilize the template function we built, which relies on @inrupt/solid-client
    // In a true E2E, the `getProfile` function uses an authenticated fetch, 
    // but our CSS test instance allows public reads on the seeded profile.
    const profile = await getProfile(webId);

    // Assert that the RDF was successfully parsed into the JavaScript object
    expect(profile).toBeDefined();
    expect(profile.webId).toBe(webId);
    expect(profile.name).toBe('Alice Tester');
    expect(profile.avatar).toBe(`${POD_URL}profile/avatar.png`);
  });

  it('should respect the Open World Assumption for missing properties', async () => {
    // We know from seed-test-data.ts that we did not populate the `friends` array
    // using `getIriAll` in the profile viewer, so it returns an empty array fallback.
    const webId = `${POD_URL}profile/card#me`;
    const profile = await getProfile(webId);

    expect(profile.friends).toEqual([]);
  });

});
