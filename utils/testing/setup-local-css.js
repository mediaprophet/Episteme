import { spawn } from 'child_process';

/**
 * Starts an in-memory Community Solid Server instance using child_process
 * for use in integration and E2E testing environments (like Vitest or Jest).
 */

let cssProcess;

export async function startLocalCSS(port = 3000) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Starting Community Solid Server on port ${port}...`);
      
      // We spawn the CSS server CLI directly to avoid fragile programmatic APIs
      cssProcess = spawn('npx', [
        'community-solid-server',
        '-p', port.toString(),
        '-l', 'info',
        '-m', '.' // in-memory
      ], { stdio: 'inherit' });
      
      // Wait for the server to be ready
      setTimeout(() => {
        console.log('Community Solid Server started successfully.');
        resolve(cssProcess);
      }, 2000);
      
      cssProcess.on('error', (err) => {
        console.error('Failed to start CSS:', err);
        reject(err);
      });
      
    } catch (error) {
      console.error('Failed to start CSS:', error);
      reject(error);
    }
  });
}

export async function stopLocalCSS() {
  if (cssProcess) {
    console.log('Stopping Community Solid Server...');
    cssProcess.kill();
    console.log('Server stopped.');
  }
}
