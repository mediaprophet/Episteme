import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

/**
 * Starts an in-memory Community Solid Server instance for E2E testing.
 * Uses proper health-check polling instead of a fragile fixed timeout.
 */

let cssProcess = null;

async function isServerReady(port) {
  const url = `http://localhost:${port}/.well-known/solid`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'HEAD',
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export async function startLocalCSS(port = 3000) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`🚀 Starting Community Solid Server on port ${port}...`);

      cssProcess = spawn('npx', [
        'community-solid-server',
        '-p', port.toString(),
        '-l', 'info',
        '-m' // in-memory storage
      ], {
        stdio: 'inherit',
        env: { ...process.env, FORCE_JAVA: 'true' }
      });

      cssProcess.on('error', (err) => {
        console.error('❌ Failed to start CSS process:', err);
        reject(err);
      });

      // Health check loop
      const MAX_WAIT = 30000;   // 30 seconds max
      const CHECK_INTERVAL = 800;
      let elapsed = 0;

      while (elapsed < MAX_WAIT) {
        if (await isServerReady(port)) {
          console.log(`✅ Community Solid Server is ready on port ${port}`);
          resolve(cssProcess);
          return;
        }

        await sleep(CHECK_INTERVAL);
        elapsed += CHECK_INTERVAL;
      }

      console.error('❌ CSS failed to start within timeout');
      if (cssProcess) cssProcess.kill();
      reject(new Error(`Community Solid Server did not start within ${MAX_WAIT}ms`));

    } catch (error) {
      console.error('❌ Error starting CSS:', error);
      if (cssProcess) cssProcess.kill();
      reject(error);
    }
  });
}

export async function stopLocalCSS() {
  if (cssProcess && !cssProcess.killed) {
    console.log('🛑 Stopping Community Solid Server...');
    cssProcess.kill();
    cssProcess = null;
    await sleep(1000);
    console.log('✅ Server stopped.');
  }
}
