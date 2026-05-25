import fs from 'fs';
import path from 'path';

const configPath = path.resolve('.agents', 'config.json');

// Approved stacks lists
const APPROVED_CORE_LIBS = ['solid-protocol', 'webid', 'ldp', 'odrl', 'acp', 'wac'];
const APPROVED_PLATFORMS = [
  'nextjs',
  'node-solid-server',
  'static-web',
  'mobile-native',
  'desktop-electron',
  'headless-iot',
  'browser-extension',
  'obsidian-plugin'
];

if (!fs.existsSync(configPath)) {
  console.error(`Error: Configuration file not found at ${configPath}`);
  process.exit(1);
}

try {
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const project = configData.project;

  console.log('--- EPISTEME AGENT CONFIGURATION LOADED ---');
  console.log(`Mode:             ${project.mode}`);
  console.log(`Core Modules:     ${project.core}`);
  console.log(`Target Platforms: ${project['target-platforms']}`);
  console.log(`Custom Addons:    ${project['custom-addons']}`);
  console.log('-------------------------------------------');

  // --- STACK VALIDATION ---
  const coreLibs = project.core.split(',').map(s => s.trim().toLowerCase());
  const platforms = project['target-platforms'].split(',').map(s => s.trim().toLowerCase());

  let validationFailed = false;

  coreLibs.forEach(lib => {
    if (!APPROVED_CORE_LIBS.includes(lib)) {
      console.warn(`⚠️ WARNING: Unapproved core module declared: "${lib}"`);
      validationFailed = true;
    }
  });

  platforms.forEach(platform => {
    if (!APPROVED_PLATFORMS.includes(platform)) {
      console.warn(`⚠️ WARNING: Unapproved target platform declared: "${platform}"`);
      validationFailed = true;
    }
  });

  if (validationFailed) {
    console.warn('⚠️ Stack validation finished with warnings. Please inspect config boundaries.');
  } else {
    console.log('✅ Stack validation successful. All core modules and platforms are approved.');
  }
  
  // --- CONTEXT POLICY CHECKS ---
  if (project['context-policy'] && project['context-policy']['flush-after-config']) {
    console.log('\n--- CONTEXT FLUSH & RE-INIT INSTRUCTION ---');
    console.log('CONTEXT_FLUSH_REQUIRED=true');
    
    const helpers = project['context-policy']['reinit-helpers']
      .split(',')
      .map(s => s.trim());
      
    console.log('REINIT_HELPERS_COUNT=' + helpers.length);
    helpers.forEach((helper, idx) => {
      console.log(`HELPER_${idx + 1}=${helper}`);
      if (!fs.existsSync(path.resolve(helper))) {
        console.error(`❌ ERROR: Specified reinit-helper file does not exist: "${helper}"`);
      }
    });
    console.log('-------------------------------------------');
  } else {
    console.log('CONTEXT_FLUSH_REQUIRED=false');
  }
} catch (err) {
  console.error('Error parsing agent config:', err.message);
  process.exit(1);
}
