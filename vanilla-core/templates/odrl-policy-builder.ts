import { buildThing, createThing, setThing, createSolidDataset } from '@inrupt/solid-client';

/**
 * ODRL Policy Builder Template
 * 
 * Demonstrates generating an Open Digital Rights Language (ODRL) policy 
 * to attach semantic usage constraints to a decentralized dataset.
 */

const ODRL = "http://www.w3.org/ns/odrl/2/";
const DPV = "https://w3id.org/dpv#"; // Data Privacy Vocabulary

export function createUsagePolicy(targetResourceUrl: string, assigneeWebId: string, assignerWebId: string) {
  let policyDataset = createSolidDataset();

  // 1. Define the specific rule (The Permission)
  // We are granting permission to Read the data, but ONLY for Academic Research purposes.
  const permissionRule = buildThing(createThing({ name: "permission_1" }))
    .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${ODRL}Permission`)
    .addUrl(`${ODRL}target`, targetResourceUrl)
    .addUrl(`${ODRL}assignee`, assigneeWebId)
    .addUrl(`${ODRL}assigner`, assignerWebId)
    .addUrl(`${ODRL}action`, `${ODRL}read`)
    // Add constraints: Purpose = Academic Research
    .addUrl(`${ODRL}constraint`, buildThing(createThing({ name: "constraint_1" }))
      .addUrl(`${ODRL}leftOperand`, `${DPV}Purpose`)
      .addUrl(`${ODRL}operator`, `${ODRL}eq`)
      .addUrl(`${ODRL}rightOperand`, `${DPV}AcademicResearch`)
      .build().url
    )
    .build();

  // 2. Define the overarching Policy Document
  const policy = buildThing(createThing({ name: "policy" }))
    .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${ODRL}Set`)
    .addUrl(`${ODRL}permission`, permissionRule.url)
    .build();

  policyDataset = setThing(policyDataset, permissionRule);
  policyDataset = setThing(policyDataset, policy);

  return policyDataset;
}
