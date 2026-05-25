import fs from 'fs';
import path from 'path';

// Source directories
const agentsRulesDir = path.resolve('.agents', 'rules');
const agentsMdPath = path.resolve('AGENTS.md');
const semanticDictPath = path.resolve('semantic-dictionary.json');

// Target directories
const cursorRulesDir = path.resolve('.cursor', 'rules');
const windsurfRulesDir = path.resolve('.windsurf', 'rules');
const cursorrulesPath = path.resolve('.cursorrules');
const windsurfrulesPath = path.resolve('.windsurfrules');

// Recreate target directories
[cursorRulesDir, windsurfRulesDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
});

console.log('Synchronizing AI rules...');

const modularRules = [];

// Recursive function to scan and process rules
function processDir(dirPath, prefix = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Map "target-platforms" to "target-platform-" for consistency
      const folderPrefix = entry.name === 'target-platforms' ? 'target-platform-' : `${entry.name}-`;
      processDir(fullPath, `${prefix}${folderPrefix}`);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const baseName = path.basename(entry.name, '.md');
      const cursorName = `${prefix}${baseName}.mdc`;
      const windsurfName = `${prefix}${baseName}.md`;

      // 1. Copy to Cursor rules
      let cursorContent = content;
      // If no frontmatter block, prepend a default one
      if (!content.trim().startsWith('---')) {
        const desc = `Rules for ${baseName.replace(/-/g, ' ')}`;
        cursorContent = `---\ndescription: ${desc}\nglobs: ["**/*"]\nalwaysApply: false\n---\n${content}`;
      }
      fs.writeFileSync(path.join(cursorRulesDir, cursorName), cursorContent, 'utf8');

      // 2. Copy to Windsurf rules
      fs.writeFileSync(path.join(windsurfRulesDir, windsurfName), content, 'utf8');

      // 3. Save for root rules assembly
      // Strip frontmatter if present for the combined files
      let cleanContent = content;
      if (content.trim().startsWith('---')) {
        const parts = content.split('---');
        cleanContent = parts.slice(2).join('---').trim();
      }
      modularRules.push({
        name: `${prefix.replace(/-/g, ' ')}${baseName.replace(/-/g, ' ')}`.toUpperCase(),
        content: cleanContent
      });

      console.log(`Synced ${entry.name} -> Cursor (${cursorName}) & Windsurf (${windsurfName})`);
    }
  }
}

// Start processing modular rules
processDir(agentsRulesDir);

// 4. Assemble root-level .cursorrules and .windsurfrules
let rootRulesHeader = `# Episteme AI Context & Rules

This project uses W3C Solid to build Human-Centric applications. Adhere strictly to these rules.

## 🛑 Pre-Flight Check
Before writing code or reading rules, check \`custom-addons/\`. Any custom instructions there (e.g. custom authentication, payment/accounting hooks) completely override standard W3C rules.

## Core Identity & Architecture Directives
1. **RDF Graphs, Not RDBMS:** All data is Linked Data modeled in RDF. Never use SQL or local databases for personal data.
2. **Decentralized Identity:** Authenticate via WebIDs and Solid-OIDC. Never cache credentials or profile tables on app servers.
3. **Dynamic Pod Storage Discovery:** Resolve storage roots (\`pim:storage\`) dynamically from the user's WebID profile.
4. **Standard Vocabularies Only:** Never invent custom JSON keys. Reuse standard vocabularies (FOAF, VCARD, SCHEMA, LDP, PIM, DCTERMS) and their corresponding Inrupt library constants.
5. **No JSON Schema:** Use SHACL shapes (\`rdf-validate-shacl\`) or Shape Trees for data validation.

`;

// Read semantic dictionary terms to output a concise summary
let semanticDictText = `## Semantic Dictionary Boundaries
Adhere strictly to the legal and terminology boundaries in \`semantic-dictionary.json\`:
`;
if (fs.existsSync(semanticDictPath)) {
  try {
    const dict = JSON.parse(fs.readFileSync(semanticDictPath, 'utf8'));
    for (const [term, meta] of Object.entries(dict.terms || {})) {
      semanticDictText += `- **${term}**: ${meta.definition || meta.legalDefinition || ''}\n`;
      if (meta.forbiddenContexts) {
        semanticDictText += `  - *Forbidden contexts*: ${meta.forbiddenContexts.join(', ')}\n`;
      }
      if (meta.architecturalCorrection) {
        semanticDictText += `  - *Correction*: ${meta.architecturalCorrection}\n`;
      }
    }
    if (dict.modes) {
      for (const [modeName, modeMeta] of Object.entries(dict.modes)) {
        semanticDictText += `\n### Mode/Namespace: ${modeName} - ${modeMeta.description || ''}\n`;
        for (const [term, meta] of Object.entries(modeMeta.terms || {})) {
          semanticDictText += `- **${term}**: ${meta.definition || meta.legalDefinition || ''}\n`;
          if (meta.forbiddenContexts) {
            semanticDictText += `  - *Forbidden contexts*: ${meta.forbiddenContexts.join(', ')}\n`;
          }
          if (meta.architecturalCorrection) {
            semanticDictText += `  - *Correction*: ${meta.architecturalCorrection}\n`;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error parsing semantic-dictionary.json:', err);
  }
}

// Read AGENTS.md system modes
let systemModesText = `\n## System Modes & Triggers\n`;
if (fs.existsSync(agentsMdPath)) {
  const agentsMd = fs.readFileSync(agentsMdPath, 'utf8');
  const modesSection = agentsMd.split('## 🚀 System Modes');
  if (modesSection.length > 1) {
    systemModesText += '### System Modes\n' + modesSection[1].split('## ⚙️ Stack Declaration')[0].trim();
  }
}

// Assemble the files
const finalCombinedRules = `${rootRulesHeader}\n${semanticDictText}\n${systemModesText}\n\n## Modular Technical Directives\n${modularRules.map(r => `### ${r.name}\n${r.content}`).join('\n\n')}`;

fs.writeFileSync(cursorrulesPath, finalCombinedRules, 'utf8');
fs.writeFileSync(windsurfrulesPath, finalCombinedRules, 'utf8');

console.log('Compiled .cursorrules and .windsurfrules successfully.');
