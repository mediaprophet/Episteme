import { 
  createSolidDataset, 
  buildThing, 
  createThing, 
  setThing, 
  saveSolidDatasetAt,
  SolidDataset
} from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

const HCAI = "https://w3id.org/hcai/agreements#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

export async function mintGuardianshipAgreement(
  userWebId: string,
  targetAgentWebId: string,
  domainType: string,
  valueConstraint: string,
  podBaseUrl: string
): Promise<SolidDataset> {
  
  // Construct the Agreement Resource
  const agreementId = `agreement-${Date.now()}`;
  const agreementThing = buildThing(createThing({ name: agreementId }))
    .addUrl(`${RDF}type`, `${HCAI}Agreement`)
    .addUrl(`${HCAI}principalAgent`, userWebId)
    .addUrl(`${HCAI}guardianAgent`, targetAgentWebId)
    .addStringNoLocale(`${HCAI}domainOfAgency`, domainType)
    .addStringNoLocale(`${HCAI}valueCredential`, valueConstraint)
    .addDatetime('http://purl.org/dc/terms/created', new Date())
    .build();

  let dataset = createSolidDataset();
  dataset = setThing(dataset, agreementThing);

  // Determine storage location based on Pod URL root
  // For demo, we just append /agreements/ to the user's webID root
  // In production, we'd look up the storage root via the profile
  const storageUrl = new URL(userWebId).origin + `/agreements/${agreementId}.ttl`;

  await saveSolidDatasetAt(storageUrl, dataset, { fetch });

  return dataset;
}
