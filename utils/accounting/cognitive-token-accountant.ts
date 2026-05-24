/**
 * Cognitive Token Accountant
 * 
 * Exposes utilities to measure human cognitive contribution (natural agent tokens) 
 * against machine computational tokens, computing equity value and minting 
 * Humanitarian Equity Framework (HEF) compliant RDF graphs.
 */

import {
  createSolidDataset,
  buildThing,
  createThing,
  setThing,
  SolidDataset
} from '@inrupt/solid-client';

// ─── Namespace Declarations ───────────────────────────────────────────────────
const RDF  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const PROV = "http://www.w3.org/ns/prov#";
const DC   = "http://purl.org/dc/terms/";
const SCHEMA = "https://schema.org/";

const WZ_ST = "https://mediaprophet.org/ext/webizen/stewardship#";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface EquivalenceOptions {
  /** AI market price per token (e.g. $0.000002 for Claude Sonnet / GPT-4o level outputs) */
  aiTokenMarketPrice: number;
  /** Premium multiplier reflecting the value of human subjective experience/qualia (e.g. 1000x) */
  qualiaPremiumMultiplier: number;
  /** Baseline living wage rate to bridge and protect human dignity (e.g. $30.00/hour) */
  hourlyWageRate: number;
  /** Estimated average human cognitive tokens produced per hour of focus (e.g. 1500 words = ~2000 tokens) */
  tokensPerHourRate: number;
}

export interface CognitiveContributionInput {
  contributorWebId: string;
  projectUri: string;
  contributionText: string;
  options: EquivalenceOptions;
  description?: string;
}

// Default standard accounting options
export const DEFAULT_EQUIVALENCE_OPTIONS: EquivalenceOptions = {
  aiTokenMarketPrice: 0.000005,      // $5 per million tokens
  qualiaPremiumMultiplier: 1200,     // 1200x value multiplier for subjective qualia
  hourlyWageRate: 35.00,             // $35/hour minimum target wage
  tokensPerHourRate: 2000,           // ~1500 words per hour
};

// ─── Core Accounting Methods ──────────────────────────────────────────────────

/**
 * Calculates human cognitive tokens.
 * Approximates tokens based on natural language word boundaries.
 * BPE (Byte Pair Encoding) typically maps 1 word to ~1.33 tokens.
 */
export function calculateCognitiveTokens(text: string): number {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.33);
}

/**
 * Computes the economic and computational equivalence of natural agent tokens.
 *
 * Implements a "Dignity Floor": guarantees that the human contribution is valued
 * at least at the baseline living wage rate, preventing machine-token price dumping
 * from commodifying human cognitive work under liveable thresholds.
 */
export function computeEquivalence(
  tokens: number,
  options: EquivalenceOptions
): {
  computationalEquivalence: number;
  obligationValue: number;
  valuationMethod: 'qualia-premium' | 'dignity-floor';
  currency: string;
} {
  // 1. Calculate value based on equivalent computational token footprint + qualia multiplier
  const computationalEquivalence = tokens * options.qualiaPremiumMultiplier;
  const qualiaValue = computationalEquivalence * options.aiTokenMarketPrice;

  // 2. Calculate value based on human living wage (dignity floor bridge)
  // Hours spent = tokens / tokens-per-hour-rate
  const hoursSpent = tokens / options.tokensPerHourRate;
  const wageValue = hoursSpent * options.hourlyWageRate;

  // 3. Enforce dignity floor (take the higher of the two valuations)
  const useDignityFloor = wageValue > qualiaValue;
  const obligationValue = useDignityFloor ? wageValue : qualiaValue;

  return {
    computationalEquivalence,
    obligationValue: parseFloat(obligationValue.toFixed(4)),
    valuationMethod: useDignityFloor ? 'dignity-floor' : 'qualia-premium',
    currency: 'USD'
  };
}

/**
 * Mints an RDF Solid Dataset representing the Human Cognitive Contribution.
 *
 * The contribution is typed as hef:CognitiveContribution (subClassOf prov:Activity)
 * and holds the tokens, equivalence values, and ties directly to the project's
 * cost obligation tracking graphs.
 */
export function mintContributionDataset(
  input: CognitiveContributionInput
): SolidDataset {
  const {
    contributorWebId,
    projectUri,
    contributionText,
    options,
    description = "Natural Agent Cognitive Contribution"
  } = input;

  const tokens = calculateCognitiveTokens(contributionText);
  const { computationalEquivalence, obligationValue, valuationMethod, currency } = computeEquivalence(tokens, options);

  const contributionId = `contribution-${Date.now()}`;
  const now = new Date();
  const baseUri = "https://mediaprophet.org/ext/webizen/accounting";
  const costUrl = `${baseUri}#cost`;
  const contributionUrl = `${baseUri}#${contributionId}`;

  // 1. Obligation Cost Node (subClassOf schema:MonetaryAmount)
  const costThing = buildThing(createThing({ url: costUrl }))
    .addUrl(`${RDF}type`,                       `${WZ_ST}ObligationCost`)
    .addUrl(`${RDF}type`,                       `${SCHEMA}MonetaryAmount`)
    .addUrl(`${WZ_ST}relatedProject`,         projectUri)
    .addStringNoLocale(`${SCHEMA}currency`,      currency)
    .addDecimal(`${SCHEMA}value`,                obligationValue)
    .addStringNoLocale(`${DC}description`,       `Obligation equity contribution value of ${obligationValue} USD`)
    .build();

  // 2. Contribution Activity Node
  const contributionThing = buildThing(createThing({ url: contributionUrl }))
    .addUrl(`${RDF}type`,                       `${WZ_ST}CognitiveContribution`)
    .addUrl(`${RDF}type`,                       `${PROV}Activity`)
    // Provenance associations
    .addUrl(`${PROV}wasAssociatedWith`,         contributorWebId)
    .addUrl(`${PROV}used`,                      projectUri)
    .addDatetime(`${PROV}startedAtTime`,        now)
    .addDatetime(`${PROV}endedAtTime`,          now)
    // Metadata
    .addStringNoLocale(`${DC}description`,      description)
    // Cognitive token metrics
    .addInteger(`${WZ_ST}cognitiveTokens`, tokens)
    .addInteger(`${WZ_ST}computationalEquivalence`, computationalEquivalence)
    .addDecimal(`${WZ_ST}qualiaMultiplier`, options.qualiaPremiumMultiplier)
    .addStringNoLocale(`${WZ_ST}valuationMethod`, valuationMethod)
    // Link to the obligation cost node
    .addUrl(`${WZ_ST}obligationCost`,        costThing.url)
    .build();

  let dataset = createSolidDataset();
  dataset = setThing(dataset, contributionThing);
  dataset = setThing(dataset, costThing);

  return dataset;
}
