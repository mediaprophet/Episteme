import { describe, it, expect } from 'vitest';
import {
  getThing,
  getThingAll,
  getUrl,
  getInteger,
  getDecimal,
  getStringNoLocale
} from '@inrupt/solid-client';
import {
  calculateCognitiveTokens,
  computeEquivalence,
  mintContributionDataset,
  DEFAULT_EQUIVALENCE_OPTIONS,
  EquivalenceOptions
} from '../../utils/accounting/cognitive-token-accountant';

describe('Cognitive Token Accountant', () => {

  describe('calculateCognitiveTokens', () => {
    it('should return 0 for empty or whitespace text', () => {
      expect(calculateCognitiveTokens('')).toBe(0);
      expect(calculateCognitiveTokens('   ')).toBe(0);
    });

    it('should approximate token count from word count correctly', () => {
      // 10 words * 1.33 = 13.3 -> rounded up to 14
      const text = "This is a simple text sentence representing ten words exactly.";
      expect(calculateCognitiveTokens(text)).toBe(14);
    });
  });

  describe('computeEquivalence', () => {
    const customOptions: EquivalenceOptions = {
      aiTokenMarketPrice: 0.000005,       // $5 per million tokens ($0.000005 per token)
      qualiaPremiumMultiplier: 1000,      // 1000x human value premium
      hourlyWageRate: 40.00,              // $40/hour dignity floor
      tokensPerHourRate: 2000,            // 2000 tokens per hour
    };

    it('should use the qualia-premium valuation if it exceeds the dignity floor', () => {
      // Setup high token count (e.g. 200,000 tokens)
      // wage-value = (200000 / 2000) * $40 = 100 * $40 = $4000
      // qualia-value = 200000 * 1000 * $0.000005 = 200,000,000 * $0.000005 = $1000
      // Wait, let's reverse the numbers to make qualia value higher than wage value:
      // If qualiaPremiumMultiplier = 20000 (20,000x premium):
      // qualia-value = 200000 * 20000 * $0.000005 = 4,000,000,000 * $0.000005 = $20,000 (which exceeds $4000)
      const optionsWithHighPremium = {
        ...customOptions,
        qualiaPremiumMultiplier: 20000
      };

      const result = computeEquivalence(200000, optionsWithHighPremium);
      expect(result.valuationMethod).toBe('qualia-premium');
      expect(result.obligationValue).toBe(20000); // 20000 USD
      expect(result.computationalEquivalence).toBe(4000000000);
    });

    it('should fall back to the dignity-floor valuation if machine equivalents are undervalued', () => {
      // 100 tokens
      // wage-value = (100 / 2000) * $40 = 0.05 * $40 = $2.00
      // qualia-value = 100 * 1000 * $0.000005 = 100,000 * $0.000005 = $0.50
      // $2.00 > $0.50, so it must trigger the dignity floor!
      const result = computeEquivalence(100, customOptions);
      expect(result.valuationMethod).toBe('dignity-floor');
      expect(result.obligationValue).toBe(2.00); // Guarantees $2.00 minimum
    });
  });

  describe('mintContributionDataset', () => {
    it('should build a valid RDF dataset representing the cognitive contribution and obligation cost', () => {
      const input = {
        contributorWebId: 'https://pod.example/alice#me',
        projectUri: 'https://pod.example/projects/project1#it',
        contributionText: 'This is a brief natural human input showing dynamic agent token metrics.', // 11 words
        options: DEFAULT_EQUIVALENCE_OPTIONS,
        description: 'Mocked human writing task'
      };

      const dataset = mintContributionDataset(input);
      expect(dataset).toBeDefined();

      // Find the contribution Thing
      // Since name is contributionId (which contains 'contribution-'), we inspect all things
      const things = getThingAll(dataset);
      const contribThing = things.find(t => t.url.includes('contribution-'));
      expect(contribThing).toBeDefined();

      const contribSubject = contribThing!.url;
      expect(contribThing).toBeDefined();

      // Verify predicates
      expect(getUrl(contribThing!, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBe(
        'http://example.org/humanitarian-equity-framework/ontology/contributors#CognitiveContribution'
      );
      expect(getUrl(contribThing!, 'http://www.w3.org/ns/prov#wasAssociatedWith')).toBe(input.contributorWebId);
      expect(getUrl(contribThing!, 'http://www.w3.org/ns/prov#used')).toBe(input.projectUri);
      
      const tokensCount = calculateCognitiveTokens(input.contributionText); // 15 tokens
      expect(getInteger(contribThing!, 'http://example.org/humanitarian-equity-framework/ontology/contributors#cognitiveTokens')).toBe(tokensCount);

      // Verify linked obligation cost
      const costThing = getThing(dataset, `${contribSubject!.split('#')[0]}#cost`);
      expect(costThing).toBeDefined();
      expect(getUrl(costThing!, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBe(
        'http://example.org/humanitarian-equity-framework/ontology/cost-model#ObligationCost'
      );
      expect(getStringNoLocale(costThing!, 'https://schema.org/currency')).toBe('USD');
      
      // Since it's a small input (15 tokens), it triggers the dignity floor
      // (15 / 2000) * $35 = 0.0075 * $35 = $0.2625
      expect(getDecimal(costThing!, 'https://schema.org/value')).toBe(0.2625);
    });
  });

});
