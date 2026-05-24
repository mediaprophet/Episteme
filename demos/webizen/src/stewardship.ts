import {
  createSolidDataset,
  buildThing,
  createThing,
  setThing,
  saveSolidDatasetAt,
  SolidDataset
} from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

// ─── Namespace Declarations ───────────────────────────────────────────────────
const RDF    = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS   = "http://www.w3.org/2000/01/rdf-schema#";
const OWL    = "http://www.w3.org/2002/07/owl#";
const ODRL   = "http://www.w3.org/ns/odrl/2/";
const DC     = "http://purl.org/dc/terms/";
const FOAF   = "http://xmlns.com/foaf/0.1/";
const PROV   = "http://www.w3.org/ns/prov#";

// W3C DOAP – Description of a Project
// https://github.com/ewilderj/doap
const DOAP   = "http://usefulinc.com/ns/doap#";

// Schema.org
const SCHEMA = "https://schema.org/";

// Humanitarian Equity Framework (HEF) – using current example.org base URIs
// NOTE: These should be migrated to https://w3id.org/hef/ once a persistent
// namespace is minted for the project.
const HEF_LICENSE = "http://example.org/humanitarian-equity-framework/ontology/license#";
const HEF_COST    = "http://example.org/humanitarian-equity-framework/ontology/cost-model#";
const HEF_CONTRIB = "http://example.org/humanitarian-equity-framework/ontology/contributors#";
const HEF_CLAIMS  = "http://example.org/humanitarian-equity-framework/ontology/claims-procedure#";
const HEF_RULES   = "http://example.org/humanitarian-equity-framework/ontology/project-rules#";

// HCAI Agreements
const HCAI = "https://w3id.org/hcai/agreements#";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StewardshipProjectInput {
  creatorWebId: string;
  projectName: string;
  description: string;
  homepageUrl: string;
  coStewardsWebIds: string[];
  policyType: 'co-authorship' | 'delegated';
  valueConstraint: string; // e.g. 'UDHR', 'CRC', 'CRPD'
  providerType: 'self' | 'other';
  providerName?: string;
  providerUri?: string;
}

// ─── Value Constraint → UN Instrument URI map ─────────────────────────────────
const UN_INSTRUMENT_URIS: Record<string, string> = {
  UDHR: "https://www.ohchr.org/en/human-rights/universal-declaration/translations/english",
  CRC:  "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-child",
  CRPD: "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-persons-disabilities",
};

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Creates a fully enriched Solid Dataset for a Co-Stewardship Project.
 *
 * The resulting RDF graph simultaneously conforms to:
 *  - doap:Project (FOSS project tooling)
 *  - schema:Project & schema:CreativeWork (Schema.org / SEO)
 *  - odrl:Policy (multi-agent rights governance)
 *  - HEF ontologies (contributor equity, cost tracking, claim procedures)
 *  - prov:Entity (provenance)
 */
export async function createCoStewardshipProject(
  input: StewardshipProjectInput
): Promise<SolidDataset> {
  const {
    creatorWebId,
    projectName,
    description,
    homepageUrl,
    coStewardsWebIds,
    policyType,
    valueConstraint,
    providerType,
    providerName,
    providerUri,
  } = input;

  const projectId  = `project-${Date.now()}`;
  const policyId   = `policy-${Date.now()}`;
  const licenseId  = `license-${Date.now()}`;
  const claimId    = `claim-${Date.now()}`;
  const costId     = `cost-${Date.now()}`;
  const now        = new Date();
  const unUri      = UN_INSTRUMENT_URIS[valueConstraint] ?? valueConstraint;

  // ── 1. Project Thing ────────────────────────────────────────────────────────
  // Multi-typed: doap:Project + schema:Project + schema:CreativeWork + prov:Entity
  let projectBuilder = buildThing(createThing({ name: projectId }))
    // Core types
    .addUrl(`${RDF}type`,            `${DOAP}Project`)
    .addUrl(`${RDF}type`,            `${SCHEMA}Project`)
    .addUrl(`${RDF}type`,            `${SCHEMA}CreativeWork`)
    .addUrl(`${RDF}type`,            `${PROV}Entity`)
    // DOAP identification
    .addStringNoLocale(`${DOAP}name`,        projectName)
    .addStringNoLocale(`${DOAP}description`, description)
    .addDatetime(`${DOAP}created`,           now)
    .addUrl(`${DOAP}maintainer`,             creatorWebId)
    .addUrl(`${DOAP}license`,                `#${licenseId}`)
    // Schema.org identification
    .addStringNoLocale(`${SCHEMA}name`,        projectName)
    .addStringNoLocale(`${SCHEMA}description`, description)
    .addUrl(`${SCHEMA}author`,               creatorWebId)
    // Provenance
    .addUrl(`${PROV}wasAttributedTo`,  creatorWebId)
    .addDatetime(`${PROV}generatedAtTime`, now)
    // ODRL policy link
    .addUrl(`${ODRL}hasPolicy`,  `#${policyId}`)
    // HEF claim procedure link
    .addUrl(`${HEF_CLAIMS}hasClaimProcess`, `#${claimId}`);

  // Platform Hosting Provider
  let providerThing: any = null;
  if (providerType === 'self') {
    projectBuilder = projectBuilder.addUrl(`${SCHEMA}hostingProvider`, creatorWebId);
  } else {
    const providerSubject = providerUri || `#provider`;
    projectBuilder = projectBuilder.addUrl(`${SCHEMA}hostingProvider`, providerSubject);

    // Build the nested provider details as a schema:Organization resource
    let providerBuilder = providerUri
      ? buildThing(createThing({ url: providerUri }))
      : buildThing(createThing({ name: 'provider' }));

    providerBuilder = providerBuilder
      .addUrl(`${RDF}type`, `${SCHEMA}Organization`)
      .addStringNoLocale(`${SCHEMA}name`, providerName || 'Unnamed Provider');

    providerThing = providerBuilder.build();
  }

  // doap:homepage and schema:url (optional)
  if (homepageUrl) {
    projectBuilder = projectBuilder
      .addUrl(`${DOAP}homepage`, homepageUrl)
      .addUrl(`${SCHEMA}url`,    homepageUrl);
  }

  // All co-stewards as doap:developer + schema:contributor
  for (const steward of coStewardsWebIds) {
    projectBuilder = projectBuilder
      .addUrl(`${DOAP}developer`,       steward)
      .addUrl(`${SCHEMA}contributor`,   steward);
  }

  const projectThing = projectBuilder.build();

  // ── 2. ODRL Policy Thing ────────────────────────────────────────────────────
  // Governs multi-agent rights over the project content (odrl:modify / odrl:distribute)
  let policyBuilder = buildThing(createThing({ name: policyId }))
    .addUrl(`${RDF}type`,         `${ODRL}Policy`)
    .addUrl(`${ODRL}target`,      `#${projectId}`)
    .addUrl(`${ODRL}assigner`,    creatorWebId)
    .addUrl(`${HCAI}valueCredential`,   unUri)
    .addStringNoLocale(`${DC}description`, `${policyType} governance policy for ${projectName}`);

  const odrlAction = policyType === 'co-authorship'
    ? `${ODRL}modify`
    : `${ODRL}distribute`;

  for (const steward of coStewardsWebIds) {
    policyBuilder = policyBuilder.addUrl(`${ODRL}assignee`, steward);
  }
  policyBuilder = policyBuilder.addUrl(`${ODRL}action`, odrlAction);

  const policyThing = policyBuilder.build();

  // ── 3. HEF License Thing ────────────────────────────────────────────────────
  // hef:License (subClassOf odrl:Policy) — references the ODRL policy and the
  // UN human rights value constraint as the boundary condition.
  const licenseThing = buildThing(createThing({ name: licenseId }))
    .addUrl(`${RDF}type`,             `${HEF_LICENSE}License`)
    .addUrl(`${RDF}type`,             `${ODRL}Policy`)
    .addUrl(`${HEF_LICENSE}governedBy`, `#${policyId}`)
    .addUrl(`${HEF_LICENSE}valueInstrument`, unUri)
    .addStringNoLocale(`${DC}title`,  `Episteme Co-Stewardship License – ${policyType}`)
    .build();

  // ── 4. HEF Claim Process Thing ─────────────────────────────────────────────
  // hef:ClaimProcess (subClassOf odrl:Policy) — the mechanism by which
  // contributors can assert rights over their contributions.
  const claimThing = buildThing(createThing({ name: claimId }))
    .addUrl(`${RDF}type`,             `${HEF_CLAIMS}ClaimProcess`)
    .addUrl(`${RDF}type`,             `${ODRL}Policy`)
    .addUrl(`${HEF_CLAIMS}relatedPolicy`, `#${policyId}`)
    .addUrl(`${ODRL}assigner`,        creatorWebId)
    .addStringNoLocale(`${DC}description`, `Contribution claim procedure for project: ${projectName}`)
    .build();

  // ── 5. HEF Obligation Cost Thing ───────────────────────────────────────────
  // hef:ObligationCost (subClassOf schema:MonetaryAmount) — tracks the
  // aggregated value of contributor effort. Initialised to 0 as a stub;
  // future tooling can update this as work is contributed.
  const costThing = buildThing(createThing({ name: costId }))
    .addUrl(`${RDF}type`,                     `${HEF_COST}ObligationCost`)
    .addUrl(`${RDF}type`,                     `${SCHEMA}MonetaryAmount`)
    .addUrl(`${HEF_COST}relatedProject`,      `#${projectId}`)
    .addStringNoLocale(`${SCHEMA}currency`,   "USD")
    .addDecimal(`${SCHEMA}value`,             0)
    .addStringNoLocale(`${DC}description`,
      `Aggregated contribution obligation cost for project: ${projectName} (initial value 0)`)
    .build();

  // ── Assemble Dataset ────────────────────────────────────────────────────────
  let dataset = createSolidDataset();
  dataset = setThing(dataset, projectThing);
  dataset = setThing(dataset, policyThing);
  dataset = setThing(dataset, licenseThing);
  dataset = setThing(dataset, claimThing);
  dataset = setThing(dataset, costThing);
  if (providerThing) {
    dataset = setThing(dataset, providerThing);
  }

  // Mint to Pod: /projects/<id>.ttl
  const storageUrl = new URL(creatorWebId).origin + `/projects/${projectId}.ttl`;
  await saveSolidDatasetAt(storageUrl, dataset, { fetch });

  return dataset;
}
