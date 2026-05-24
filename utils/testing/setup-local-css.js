import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

/**
 * Starts an ephemeral Community Solid Server for E2E tests with robust health checking.
 */

let cssProcess = null;

async function isServerReady(port = 3001) {
  const urls = [
    `http://localhost:${port}/`,
    `http://localhost:${port}/.well-known/solid`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[Health Check] ${url} → ${response.status}`);

      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (err) {
      // Ignore connection errors during startup
    }
  }
  return false;
}

export async function startLocalCSS(port = 3001) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`🚀 Starting Community Solid Server on port ${port}...`);

      cssProcess = spawn('npx', [
        '@solid/community-server',
        '--port', port.toString(),
        '--loggingLevel', 'info'
      ], {
        stdio: 'inherit',
        env: { ...process.env, FORCE_JAVA: 'true' }
      });

      cssProcess.on('error', (err) => {
        console.error('❌ Failed to spawn CSS process:', err);
        reject(err);
      });

      const MAX_WAIT = 120000; // 2 minutes for CI
      const CHECK_INTERVAL = 1000;
      let elapsed = 0;

      console.log('⏳ Waiting for CSS to start...');

      while (elapsed < MAX_WAIT) {
        if (await isServerReady(port)) {
          console.log(`✅ Community Solid Server ready on http://localhost:${port}`);
          resolve(cssProcess);
          return;
        }

        await sleep(CHECK_INTERVAL);
        elapsed += CHECK_INTERVAL;

        if (elapsed % 10000 === 0) {
          console.log(`⏳ Still waiting... (${Math.round(elapsed/1000)}s)`);
        }
      }

      console.error('❌ CSS failed to start within timeout');
      if (cssProcess) cssProcess.kill();
      reject(new Error(`CSS did not start within ${MAX_WAIT}ms`));
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
    await sleep(2000);
    console.log('✅ Server stopped.');
  }
}
