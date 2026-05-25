import fs from 'fs';
import path from 'path';

const rulesDir = path.resolve('.agents', 'rules');

// Parse arguments
const args = process.argv.slice(2);
const queryIndex = args.indexOf('--query');
const ruleIndex = args.indexOf('--rule');

if (queryIndex === -1 && ruleIndex === -1) {
  console.log('Usage: node agent-loader.js --query <keyword> | --rule <rule-name>');
  process.exit(0);
}

function scanDir(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

if (queryIndex !== -1) {
  const keyword = args[queryIndex + 1]?.toLowerCase();
  if (!keyword) {
    console.error('Error: Please specify a keyword after --query');
    process.exit(1);
  }

  console.log(`Searching rules for keyword: "${keyword}"...`);
  const allFiles = scanDir(rulesDir);
  let matchesFound = 0;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.toLowerCase().includes(keyword)) {
      matchesFound++;
      console.log(`\n=== Match in ${path.relative(rulesDir, file)} ===`);
      // Print lines containing the keyword with context
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(keyword)) {
          const start = Math.max(0, idx - 2);
          const end = Math.min(lines.length - 1, idx + 2);
          console.log(`Lines ${start + 1}-${end + 1}:`);
          for (let i = start; i <= end; i++) {
            const prefix = i === idx ? ' > ' : '   ';
            console.log(`${prefix}${i + 1}: ${lines[i]}`);
          }
          console.log('---');
        }
      });
    }
  }
  console.log(`Search complete. Found matches in ${matchesFound} modules.`);
}

if (ruleIndex !== -1) {
  const ruleName = args[ruleIndex + 1];
  if (!ruleName) {
    console.error('Error: Please specify a rule name after --rule');
    process.exit(1);
  }

  const allFiles = scanDir(rulesDir);
  const targetFile = allFiles.find(f => path.basename(f, '.md') === ruleName || path.basename(f, '.md').includes(ruleName));

  if (!targetFile) {
    console.error(`Error: Rule "${ruleName}" not found under ${rulesDir}`);
    process.exit(1);
  }

  console.log(`\n=== Rule Content: ${path.relative(rulesDir, targetFile)} ===`);
  console.log(fs.readFileSync(targetFile, 'utf8'));
}
