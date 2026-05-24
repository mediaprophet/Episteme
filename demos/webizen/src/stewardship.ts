import { 
  createSolidDataset, 
  buildThing, 
  createThing, 
  setThing, 
  saveSolidDatasetAt,
  SolidDataset
} from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

const ODRL = "http://www.w3.org/ns/odrl/2/";
const FOAF = "http://xmlns.com/foaf/0.1/";
const DC = "http://purl.org/dc/terms/";
const HCAI = "https://w3id.org/hcai/agreements#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

export async function createCoStewardshipProject(
  creatorWebId: string,
  projectName: string,
  coStewardsWebIds: string[],
  policyType: string,
  valueConstraint: string,
): Promise<SolidDataset> {
  const projectId = `project-${Date.now()}`;
  const policyId = `policy-${Date.now()}`;

  // 1. Project Resource
  const projectThing = buildThing(createThing({ name: projectId }))
    .addUrl(`${RDF}type`, `${FOAF}Project`)
    .addStringNoLocale(`${DC}title`, projectName)
    .build();

  // 2. ODRL Policy Resource binding multi-agents
  let policyThingBuilder = buildThing(createThing({ name: policyId }))
    .addUrl(`${RDF}type`, `${ODRL}Policy`)
    .addUrl(`${ODRL}target`, `#${projectId}`) // Linking internally to the project graph
    .addUrl(`${ODRL}assigner`, creatorWebId)
    .addStringNoLocale(`${HCAI}valueCredential`, valueConstraint);

  // Add all co-stewards as assignees
  for (const steward of coStewardsWebIds) {
    policyThingBuilder = policyThingBuilder.addUrl(`${ODRL}assignee`, steward);
  }

  // Assign action based on policyType
  if (policyType === 'co-authorship') {
    policyThingBuilder = policyThingBuilder.addUrl(`${ODRL}action`, `${ODRL}modify`);
  } else if (policyType === 'delegated') {
    policyThingBuilder = policyThingBuilder.addUrl(`${ODRL}action`, `${ODRL}distribute`);
  }

  const policyThing = policyThingBuilder.build();

  let dataset = createSolidDataset();
  dataset = setThing(dataset, projectThing);
  dataset = setThing(dataset, policyThing);

  const storageUrl = new URL(creatorWebId).origin + `/projects/${projectId}.ttl`;

  await saveSolidDatasetAt(storageUrl, dataset, { fetch });

  return dataset;
}
