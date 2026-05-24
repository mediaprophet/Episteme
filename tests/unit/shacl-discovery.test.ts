import { describe, it, expect, vi } from 'vitest';
import {
  createSolidDataset,
  buildThing,
  setThing,
} from '@inrupt/solid-client';
import {
  discoverShapeFromHeaders,
  discoverShapeFromMetadata,
  discoverShapeFromCatalogue,
  discoverShape,
  validateResource
} from '../../templates/shacl-discovery-demo';

describe('SHACL Shape Discovery & Validation', () => {

  describe('discoverShapeFromHeaders', () => {
    it('should parse rel="describedby" Link header correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        headers: {
          get: (name: string) => {
            if (name === 'Link') {
              return '<https://example.org/shapes/project.ttl>; rel="describedby", <https://example.org/profile>; rel="alternate"';
            }
            return null;
          }
        }
      } as any);

      const shapeUri = await discoverShapeFromHeaders('https://pod.example/project1', mockFetch);
      expect(shapeUri).toBe('https://example.org/shapes/project.ttl');
      expect(mockFetch).toHaveBeenCalledWith('https://pod.example/project1', { method: 'HEAD' });
    });

    it('should return null if describedby is missing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        headers: {
          get: (name: string) => {
            if (name === 'Link') {
              return '<https://example.org/profile>; rel="alternate"';
            }
            return null;
          }
        }
      } as any);

      const shapeUri = await discoverShapeFromHeaders('https://pod.example/project1', mockFetch);
      expect(shapeUri).toBeNull();
    });
  });

  describe('discoverShapeFromMetadata', () => {
    it('should extract shape URI from solid:shape predicate', () => {
      const resourceUri = 'https://pod.example/project1';
      const shapeUri = 'https://example.org/shapes/project.ttl';
      
      const thing = buildThing({ url: resourceUri })
        .addUrl('http://www.w3.org/ns/solid/terms#shape', shapeUri)
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const discovered = discoverShapeFromMetadata(dataset, resourceUri);
      expect(discovered).toBe(shapeUri);
    });

    it('should return null if solid:shape is missing', () => {
      const resourceUri = 'https://pod.example/project1';
      const thing = buildThing({ url: resourceUri })
        .addStringNoLocale('http://usefulinc.com/ns/doap#name', 'My Project')
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const discovered = discoverShapeFromMetadata(dataset, resourceUri);
      expect(discovered).toBeNull();
    });
  });

  describe('discoverShapeFromCatalogue', () => {
    it('should resolve standard shapes from the catalogue map', () => {
      const resourceUri = 'https://pod.example/alice';
      const thing = buildThing({ url: resourceUri })
        .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://xmlns.com/foaf/0.1/Person')
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const discovered = discoverShapeFromCatalogue(dataset, resourceUri);
      expect(discovered).toBe('https://raw.githubusercontent.com/solid/shapes/main/vcard.ttl');
    });

    it('should resolve DOAP project from catalogue map', () => {
      const resourceUri = 'https://pod.example/project1';
      const thing = buildThing({ url: resourceUri })
        .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://usefulinc.com/ns/doap#Project')
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const discovered = discoverShapeFromCatalogue(dataset, resourceUri);
      expect(discovered).toBe('https://raw.githubusercontent.com/mediaprophet/Episteme/main/utils/shapes/project-shape.ttl');
    });
  });

  describe('Combined discoverShape Pipeline', () => {
    it('should execute full tiered pipeline (falling back to catalogue if metadata/headers fail)', async () => {
      const resourceUri = 'https://pod.example/project1';
      
      // Simulate no headers
      const mockFetch = vi.fn().mockResolvedValue({
        headers: {
          get: () => null
        }
      } as any);

      // Create dataset with no solid:shape metadata, but with rdf:type doap:Project
      const thing = buildThing({ url: resourceUri })
        .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://usefulinc.com/ns/doap#Project')
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const shapeUri = await discoverShape(resourceUri, dataset, mockFetch);
      expect(shapeUri).toBe('https://raw.githubusercontent.com/mediaprophet/Episteme/main/utils/shapes/project-shape.ttl');
    });
  });

  describe('validateResource with fallbacks', () => {
    it('should successfully validate project with correct predicates', async () => {
      const resourceUri = 'https://pod.example/project1';
      const shapeUri = 'https://raw.githubusercontent.com/mediaprophet/Episteme/main/utils/shapes/project-shape.ttl';

      const thing = buildThing({ url: resourceUri })
        .addUrl('http://usefulinc.com/ns/doap#name', 'My Project')
        .addUrl('http://usefulinc.com/ns/doap#maintainer', 'https://pod.example/alice#me')
        .addUrl('https://schema.org/hostingProvider', 'https://pod.example/alice#me')
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const result = await validateResource(resourceUri, dataset, shapeUri);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation and return error reports (justification trees) when properties are missing', async () => {
      const resourceUri = 'https://pod.example/project1';
      const shapeUri = 'https://raw.githubusercontent.com/mediaprophet/Episteme/main/utils/shapes/project-shape.ttl';

      // Missing doap:maintainer and schema:hostingProvider
      const thing = buildThing({ url: resourceUri })
        .addUrl('http://usefulinc.com/ns/doap#name', 'My Project')
        .build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const result = await validateResource(resourceUri, dataset, shapeUri);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SHACL Violation: doap:maintainer must point to a maintainer WebID.');
      expect(result.errors).toContain('SHACL Violation: schema:hostingProvider must point to a hosting provider WebID/IRI.');
    });

    it('should fall back to data-driven structure validation if no shape is found', async () => {
      const resourceUri = 'https://pod.example/unknown-thing';

      // Normal empty thing should have validation warnings
      const thing = buildThing({ url: resourceUri }).build();
      
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const result = await validateResource(resourceUri, dataset, null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data-driven check: Resource contains no predicates.');
    });
  });

});
