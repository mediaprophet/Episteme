import { 
  createSolidDataset, 
  buildThing, 
  createThing, 
  setThing, 
  saveSolidDatasetAt,
  SolidDataset
} from '@inrupt/solid-client';
const WZ_AG = "https://mediaprophet.org/ext/webizen/agreements#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

export async function mintGuardianshipAgreement(
  userWebId: string,
  targetAgentWebId: string,
  domainType: string,
  valueConstraint: string,
  podBaseUrl: string,
  authFetch: typeof fetch = globalThis.fetch
): Promise<SolidDataset> {
  
  // Construct the Agreement Resource
  const agreementId = `agreement-${Date.now()}`;
  const agreementThing = buildThing(createThing({ name: agreementId }))
    .addUrl(`${RDF}type`, `${WZ_AG}Agreement`)
    .addUrl(`${WZ_AG}principalAgent`, userWebId)
    .addUrl(`${WZ_AG}guardianAgent`, targetAgentWebId)
    .addStringNoLocale(`${WZ_AG}domainOfAgency`, domainType)
    .addStringNoLocale(`${WZ_AG}valueCredential`, valueConstraint)
    .addDatetime('http://purl.org/dc/terms/created', new Date())
    .build();

  let dataset = createSolidDataset();
  dataset = setThing(dataset, agreementThing);

  // Determine storage location based on Pod URL root
  // For demo, we just append /agreements/ to the user's webID root
  // In production, we'd look up the storage root via the profile
  const storageUrl = new URL(userWebId).origin + `/agreements/${agreementId}.ttl`;

  await saveSolidDatasetAt(storageUrl, dataset, { fetch: authFetch });

  return dataset;
}
