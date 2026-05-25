import fs from 'fs';
import path from 'path';

const configPath = path.resolve('.agents', 'config.json');

if (!fs.existsSync(configPath)) {
  console.error(`Error: Configuration file not found at ${configPath}`);
  process.exit(1);
}

try {
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const project = configData.project;

  console.log('--- EPISTEME AGENT CONFIGURATION LOADED ---');
  console.log(`Mode:             ${project.mode}`);
  console.log(`Core:             ${project.core}`);
  console.log(`Target Platforms: ${project['target-platforms']}`);
  console.log(`Custom Addons:    ${project['custom-addons']}`);
  console.log('-------------------------------------------');
  
  if (project['context-policy'] && project['context-policy']['flush-after-config']) {
    console.log('CONTEXT_FLUSH_REQUIRED=true');
    console.log(`REINIT_HELPERS=${project['context-policy']['reinit-helpers']}`);
  } else {
    console.log('CONTEXT_FLUSH_REQUIRED=false');
  }
} catch (err) {
  console.error('Error parsing agent config:', err.message);
  process.exit(1);
}
