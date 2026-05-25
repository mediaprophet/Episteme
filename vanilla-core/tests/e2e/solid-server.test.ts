import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import type { ChildProcess } from 'child_process';
import { startLocalCSS, stopLocalCSS } from '../../utils/testing/setup-local-css.js';
import { InruptDataAdapter } from '../../adapters/InruptDataAdapter';
import { LDODataAdapter } from '../../adapters/LDODataAdapter';

describe('E2E Solid Server Integration Matrix', () => {
  let cssProcess: ChildProcess | null = null;

  beforeAll(async () => {
    console.log('🚀 Starting E2E Solid Server test environment...');
    cssProcess = await startLocalCSS(3001);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 180000);

  afterAll(async () => {
    await stopLocalCSS();
  });

  // Test Suite 1: Inrupt Data Adapter (ESS Mock / Sandbox)
  describe('InruptDataAdapter (Enterprise ESS Mock)', () => {
    const adapter = new InruptDataAdapter();

    it('should read resources from mock ESS pod', async () => {
      const data = await adapter.read('https://pod.example/enterprise/resource');
      expect(data).toContain('Inrupt Imperative Graph');
    });

    it('should write resource and not warn if portable', async () => {
      const payload = '<https://pod.example/resource> a <http://schema.org/Thing> .';
      const check = adapter.validatePortability(payload);
      expect(check.portable).toBe(true);
      expect(check.warnings.length).toBe(0);
    });

    it('should emit warnings when trying to write WAC/ACL rules to ESS server', () => {
      const payload = '<https://pod.example/resource> <http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read> .';
      const check = adapter.validatePortability(payload);
      expect(check.portable).toBe(false);
      expect(check.warnings[0]).toContain('WAC (WebAccessControl) terminology/rules detected');
    });
  });

  // Test Suite 2: LDO Data Adapter (CSS / Local Community)
  describe('LDODataAdapter (Community CSS Pod)', () => {
    const adapter = new LDODataAdapter();

    it('should read resources from local CSS pod', async () => {
      const response = await fetch('http://localhost:3001/.well-known/solid');
      expect(response.ok).toBe(true);

      const data = await adapter.read('http://localhost:3001/community/resource');
      expect(data).toContain('LDO Community Graph');
    });

    it('should write resource and not warn if portable', async () => {
      const payload = '<http://localhost:3001/resource> a <http://schema.org/Thing> .';
      const check = adapter.validatePortability(payload);
      expect(check.portable).toBe(true);
      expect(check.warnings.length).toBe(0);
    });

    it('should emit warnings when trying to write ACP policies to CSS server', () => {
      const payload = '<http://localhost:3001/resource> a <http://www.w3.org/ns/solid/acp#AccessControlPolicy> .';
      const check = adapter.validatePortability(payload);
      expect(check.portable).toBe(false);
      expect(check.warnings[0]).toContain('ACP (AccessControlPolicy) terminology/rules detected');
    });
  });
});