import { AppRunner } from '@solid/community-server';
import fs from 'fs';
import path from 'path';

/**
 * Programmatically starts an in-memory Community Solid Server instance
 * for use in integration and E2E testing environments (like Vitest or Jest).
 */

let app;

export async function startLocalCSS(port = 3000) {
  try {
    console.log(`Starting Community Solid Server on port ${port}...`);
    
    // Inrupt and standard Solid components expect standard HTTP for local testing
    // We run it purely in memory for fast tests.
    const runner = new AppRunner();
    app = await runner.start({
      port: port,
      loggingLevel: 'info',
      // Example: load a pre-configured memory setup
      // config: '@css:config/file-no-setup.json',
    });
    
    console.log('Community Solid Server started successfully.');
    return app;
  } catch (error) {
    console.error('Failed to start CSS:', error);
    throw error;
  }
}

export async function stopLocalCSS() {
  if (app) {
    console.log('Stopping Community Solid Server...');
    await app.stop();
    console.log('Server stopped.');
  }
}
