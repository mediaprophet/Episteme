import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { startLocalCSS, stopLocalCSS } from '../../utils/testing/setup-local-css.js';

describe('E2E Solid Server Integration', () => {
  let cssProcess;

  beforeAll(async () => {
    console.log('🚀 Starting E2E Solid Server test environment...');
    cssProcess = await startLocalCSS(3001);
    // Simple delay to ensure server is fully stable
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 180000); // 3 minute timeout for beforeAll in CI

  afterAll(async () => {
    await stopLocalCSS();
  });

  it('should start Community Solid Server successfully', () => {
    expect(cssProcess).toBeDefined();
  });

  it('should be able to connect to the Solid server', async () => {
    const response = await fetch('http://localhost:3001/.well-known/solid');
    expect(response.ok).toBe(true);
  });
});