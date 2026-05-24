import {
  createSolidDataset,
  buildThing,
  createThing,
  setThing,
  saveSolidDatasetAt,
  SolidDataset
} from '@inrupt/solid-client';

// ─── Namespace Declarations ───────────────────────────────────────────────────
const RDF    = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS   = "http://www.w3.org/2000/01/rdf-schema#";
const OWL    = "http://www.w3.org/2002/07/owl#";
const ODRL   = "http://www.w3.org/ns/odrl/2/";
const DC     = "http://purl.org/dc/terms/";
const FOAF   = "http://xmlns.com/foaf/0.1/";
const PROV   = "http://www.w3.org/ns/prov#";
const NYM_EXT = "https://mediaprophet.org/ext/nym#";

// W3C DOAP – Description of a Project
// https://github.com/ewilderj/doap
const DOAP   = "http://usefulinc.com/ns/doap#";

// Schema.org
const SCHEMA = "https://schema.org/";

// Webizen Extension Vocabularies
const WZ_ST = "https://mediaprophet.org/ext/webizen/stewardship#";
const WZ_AG = "https://mediaprophet.org/ext/webizen/agreements#";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectGuardianshipInput {
  guardianWebId: string;
  purpose: 'financial' | 'legal' | 'governance' | 'supervision' | 'healthcare';
}

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
  guardians?: ProjectGuardianshipInput[];
  nymEnabled?: boolean;
  nymSocksUrl?: string;
  nymClientAddress?: string;
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
  input: StewardshipProjectInput,
  authFetch: typeof fetch = globalThis.fetch
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
    guardians = [],
    nymEnabled = false,
    nymSocksUrl,
    nymClientAddress,
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
    // Webizen ODRL policy link
    .addUrl(`${ODRL}hasPolicy`,  `#${policyId}`)
    // Webizen claim procedure link
    .addUrl(`${WZ_ST}hasClaimProcess`, `#${claimId}`);

  if (nymEnabled) {
    projectBuilder = projectBuilder.addUrl(`${NYM_EXT}hasNymConfig`, `#nym-config`);
  }

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

  // Guardianship relations (optional)
  const guardianThings: any[] = [];
  guardians.forEach((g, idx) => {
    const gId = `guardian-agreement-${Date.now()}-${idx}`;
    projectBuilder = projectBuilder.addUrl(`${WZ_AG}hasAgreement`, `#${gId}`);

    const gThing = buildThing(createThing({ name: gId }))
      .addUrl(`${RDF}type`, `${WZ_AG}Agreement`)
      .addUrl(`${RDF}type`, `${ODRL}Policy`)
      .addUrl(`${WZ_AG}principalAgent`, creatorWebId)
      .addUrl(`${WZ_AG}guardianAgent`, g.guardianWebId)
      .addStringNoLocale(`${WZ_AG}domainOfAgency`, g.purpose)
      .addUrl(`${WZ_AG}valueCredential`, unUri)
      .addDatetime(`${DC}created`, now)
      .build();

    guardianThings.push(gThing);
  });

  const projectThing = projectBuilder.build();

  // ── 2. ODRL Policy Thing ────────────────────────────────────────────────────
  // Governs multi-agent rights over the project content (odrl:modify / odrl:distribute)
  let policyBuilder = buildThing(createThing({ name: policyId }))
    .addUrl(`${RDF}type`,         `${ODRL}Policy`)
    .addUrl(`${ODRL}target`,      `#${projectId}`)
    .addUrl(`${ODRL}assigner`,    creatorWebId)
    .addUrl(`${WZ_AG}valueCredential`,   unUri)
    .addStringNoLocale(`${DC}description`, `${policyType} governance policy for ${projectName}`);

  const odrlAction = policyType === 'co-authorship'
    ? `${ODRL}modify`
    : `${ODRL}distribute`;

  for (const steward of coStewardsWebIds) {
    policyBuilder = policyBuilder.addUrl(`${ODRL}assignee`, steward);
  }
  policyBuilder = policyBuilder.addUrl(`${ODRL}action`, odrlAction);

  const policyThing = policyBuilder.build();

  // ── 3. Webizen License Thing ────────────────────────────────────────────────
  // wz-st:License (subClassOf odrl:Policy) — references the ODRL policy and the
  // UN human rights value constraint as the boundary condition.
  const licenseThing = buildThing(createThing({ name: licenseId }))
    .addUrl(`${RDF}type`,             `${WZ_ST}License`)
    .addUrl(`${RDF}type`,             `${ODRL}Policy`)
    .addUrl(`${WZ_ST}governedBy`, `#${policyId}`)
    .addUrl(`${WZ_ST}valueInstrument`, unUri)
    .addStringNoLocale(`${DC}title`,  `Episteme Co-Stewardship License – ${policyType}`)
    .build();

  // ── 4. Webizen Claim Process Thing ─────────────────────────────────────────
  // wz-st:ClaimProcess (subClassOf odrl:Policy) — the mechanism by which
  // contributors can assert rights over their contributions.
  const claimThing = buildThing(createThing({ name: claimId }))
    .addUrl(`${RDF}type`,             `${WZ_ST}ClaimProcess`)
    .addUrl(`${RDF}type`,             `${ODRL}Policy`)
    .addUrl(`${WZ_ST}relatedPolicy`, `#${policyId}`)
    .addUrl(`${ODRL}assigner`,        creatorWebId)
    .addStringNoLocale(`${DC}description`, `Contribution claim procedure for project: ${projectName}`)
    .build();

  // ── 5. Webizen Obligation Cost Thing ───────────────────────────────────────
  // wz-st:ObligationCost (subClassOf schema:MonetaryAmount) — tracks the
  // aggregated value of contributor effort. Initialised to 0 as a stub;
  // future tooling can update this as work is contributed.
  const costThing = buildThing(createThing({ name: costId }))
    .addUrl(`${RDF}type`,                     `${WZ_ST}ObligationCost`)
    .addUrl(`${RDF}type`,                     `${SCHEMA}MonetaryAmount`)
    .addUrl(`${WZ_ST}relatedProject`,      `#${projectId}`)
    .addStringNoLocale(`${SCHEMA}currency`,   "USD")
    .addDecimal(`${SCHEMA}value`,             0)
    .addStringNoLocale(`${DC}description`,
      `Aggregated contribution obligation cost for project: ${projectName} (initial value 0)`)
    .build();

  // ── 6. Nym Mixnet Config Thing ─────────────────────────────────────────────
  let nymConfigThing: any = null;
  if (nymEnabled) {
    let nymBuilder = buildThing(createThing({ name: 'nym-config' }))
      .addUrl(`${RDF}type`, `${NYM_EXT}NymConfiguration`)
      .addBoolean(`${NYM_EXT}nymEnabled`, true);

    if (nymSocksUrl) {
      nymBuilder = nymBuilder.addStringNoLocale(`${NYM_EXT}socksProxyUrl`, nymSocksUrl);
    }
    if (nymClientAddress) {
      nymBuilder = nymBuilder.addStringNoLocale(`${NYM_EXT}clientAddress`, nymClientAddress);
    }
    nymConfigThing = nymBuilder.build();
  }

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
  if (nymConfigThing) {
    dataset = setThing(dataset, nymConfigThing);
  }
  guardianThings.forEach(gThing => {
    dataset = setThing(dataset, gThing);
  });

  // Mint to Pod: /projects/<id>.ttl
  const storageUrl = new URL(creatorWebId).origin + `/projects/${projectId}.ttl`;
  await saveSolidDatasetAt(storageUrl, dataset, { fetch: authFetch });

  return dataset;
}
