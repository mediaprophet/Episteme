import fs from 'fs';
import path from 'path';

console.log('=== STARTING CONFIGURATION VALIDATION TOOL ===');

const semanticDictPath = path.resolve('semantic-dictionary.json');
const configPath = path.resolve('.agents', 'config.json');
const knowledgeIndexPath = path.resolve('.agents', 'knowledge-index.json');
const semanticIndexPath = path.resolve('.agents', 'semantic-index.json');
const customAddonsDir = path.resolve('custom-addons');

let hasErrors = false;
let hasWarnings = false;

function logError(msg) {
  console.error(`❌ ERROR: ${msg}`);
  hasErrors = true;
}

function logWarning(msg) {
  console.warn(`⚠️ WARNING: ${msg}`);
  hasWarnings = true;
}

// 1. Validate semantic-dictionary.json and modes schema
const schemaPath = path.resolve('dictionary-schema.json');
if (!fs.existsSync(schemaPath)) {
  logError(`dictionary-schema.json not found in root: ${schemaPath}`);
} else {
  console.log('✅ dictionary-schema.json found.');
}

function validateModeFileSchema(modeJson, filePath) {
  const fileName = path.basename(filePath);
  if (!modeJson || typeof modeJson !== 'object' || Array.isArray(modeJson)) {
    logError(`[Schema] Mode file ${fileName} is not a valid JSON object.`);
    return;
  }
  
  const requiredRootKeys = ['@context', 'mode', 'settings', 'terms'];
  for (const key of requiredRootKeys) {
    if (!(key in modeJson)) {
      logError(`[Schema] Mode file ${fileName} is missing required root property: "${key}".`);
    }
  }
  
  if (modeJson['@context']) {
    const ctx = modeJson['@context'];
    if (typeof ctx !== 'object' || Array.isArray(ctx)) {
      logError(`[Schema] Mode file ${fileName} "@context" must be an object.`);
    } else {
      const requiredContextKeys = ['skos', 'dct', 'mode', 'definition', 'related_terms'];
      for (const key of requiredContextKeys) {
        if (!(key in ctx)) {
          logError(`[Schema] Mode file ${fileName} "@context" is missing key: "${key}".`);
        }
      }
    }
  }
  
  if (modeJson.settings) {
    const settings = modeJson.settings;
    if (typeof settings !== 'object' || Array.isArray(settings)) {
      logError(`[Schema] Mode file ${fileName} "settings" must be an object.`);
    } else {
      if (typeof settings.strict_w3c_compliance !== 'boolean') {
        logError(`[Schema] Mode file ${fileName} "settings.strict_w3c_compliance" must be a boolean.`);
      }
      if (typeof settings.primary_focus !== 'string') {
        logError(`[Schema] Mode file ${fileName} "settings.primary_focus" must be a string.`);
      }
    }
  }
  
  if (modeJson.terms) {
    const terms = modeJson.terms;
    if (typeof terms !== 'object' || Array.isArray(terms)) {
      logError(`[Schema] Mode file ${fileName} "terms" must be an object.`);
    } else {
      for (const [termName, termData] of Object.entries(terms)) {
        if (!termData || typeof termData !== 'object' || Array.isArray(termData)) {
          logError(`[Schema] Mode file ${fileName} term "${termName}" must be an object.`);
          continue;
        }
        if (!termData.definition || typeof termData.definition !== 'string') {
          logError(`[Schema] Mode file ${fileName} term "${termName}" is missing "definition" string.`);
        }
        if (!termData.related_terms || !Array.isArray(termData.related_terms)) {
          logError(`[Schema] Mode file ${fileName} term "${termName}" is missing "related_terms" array.`);
        } else {
          for (let i = 0; i < termData.related_terms.length; i++) {
            if (typeof termData.related_terms[i] !== 'string') {
              logError(`[Schema] Mode file ${fileName} term "${termName}" "related_terms[${i}]" must be a string.`);
            }
          }
        }
        const allowedTermKeys = ['definition', 'related_terms'];
        for (const k of Object.keys(termData)) {
          if (!allowedTermKeys.includes(k)) {
            logError(`[Schema] Mode file ${fileName} term "${termName}" contains forbidden property: "${k}".`);
          }
        }
      }
    }
  }
}

if (!fs.existsSync(semanticDictPath)) {
  logError(`semantic-dictionary.json not found in root: ${semanticDictPath}`);
} else {
  try {
    const semanticDict = JSON.parse(fs.readFileSync(semanticDictPath, 'utf8'));
    console.log('✅ semantic-dictionary.json parsed successfully.');
    
    if (!semanticDict.modes_index) {
      logError('semantic-dictionary.json is missing "modes_index" block.');
    } else {
      for (const [modeKey, modeInfo] of Object.entries(semanticDict.modes_index)) {
        const modeFilePath = path.resolve(path.dirname(semanticDictPath), modeInfo.path);
        if (!fs.existsSync(modeFilePath)) {
          logError(`Mode file not found for "${modeKey}" at: ${modeFilePath}`);
        } else {
          try {
            const modeJson = JSON.parse(fs.readFileSync(modeFilePath, 'utf8'));
            validateModeFileSchema(modeJson, modeFilePath);
            if (!modeJson.terms || Object.keys(modeJson.terms).length === 0) {
              logWarning(`Mode file "${modeKey}" has empty "terms" block.`);
            } else {
              console.log(`✅ Mode "${modeKey}" terms validated against schema (${Object.keys(modeJson.terms).length} terms).`);
            }
          } catch (err) {
            logError(`Failed to parse Mode file "${modeKey}": ${err.message}`);
          }
        }
      }
    }
  } catch (err) {
    logError(`Failed to parse semantic-dictionary.json: ${err.message}`);
  }
}

// 2. Validate .agents/config.json
if (!fs.existsSync(configPath)) {
  logError(`.agents/config.json not found: ${configPath}`);
} else {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ .agents/config.json parsed successfully.');
    const project = config.project;
    if (!project) {
      logError('config.json is missing "project" root key.');
    } else {
      if (project.mode !== 'solid-agent-config') {
        logWarning(`Non-standard agent config mode declared: "${project.mode}"`);
      }
      if (!project.core) {
        logError('config.json is missing "project.core" declaration.');
      }
      if (!project['target-platforms']) {
        logError('config.json is missing "project.target-platforms" declaration.');
      }
      if (!project['data-stack']) {
        logError('config.json is missing "project.data-stack" declaration.');
      } else {
        const approvedStacks = ['inrupt-enterprise', 'ldo-community', 'vanilla-core'];
        if (!approvedStacks.includes(project['data-stack'])) {
          logError(`Unapproved data-stack configured: "${project['data-stack']}". Must be one of: ${approvedStacks.join(', ')}`);
        } else {
          console.log(`✅ Data stack choice validated: "${project['data-stack']}"`);
        }
      }
    }
  } catch (err) {
    logError(`Failed to parse config.json: ${err.message}`);
  }
}

// 3. Validate .agents/knowledge-index.json
if (!fs.existsSync(knowledgeIndexPath)) {
  logError(`.agents/knowledge-index.json not found: ${knowledgeIndexPath}`);
} else {
  try {
    const knowledgeIndex = JSON.parse(fs.readFileSync(knowledgeIndexPath, 'utf8'));
    console.log('✅ .agents/knowledge-index.json parsed successfully.');
    if (!knowledgeIndex.knowledge || Object.keys(knowledgeIndex.knowledge).length === 0) {
      logWarning('knowledge-index.json contains no declared specifications.');
    } else {
      console.log(`✅ Knowledge index validated (${Object.keys(knowledgeIndex.knowledge).length} specs).`);
    }
  } catch (err) {
    logError(`Failed to parse knowledge-index.json: ${err.message}`);
  }
}

// 4. Validate .agents/semantic-index.json
if (!fs.existsSync(semanticIndexPath)) {
  logError(`.agents/semantic-index.json not found: ${semanticIndexPath}`);
} else {
  try {
    const semanticIndex = JSON.parse(fs.readFileSync(semanticIndexPath, 'utf8'));
    console.log('✅ .agents/semantic-index.json parsed successfully.');
    if (!semanticIndex.modules || semanticIndex.modules.length === 0) {
      logError('semantic-index.json is missing modules metadata registrations.');
    } else {
      semanticIndex.modules.forEach(mod => {
        const modPath = path.resolve(mod.path);
        if (!fs.existsSync(modPath)) {
          logError(`Registered module "${mod.name}" file not found at: ${modPath}`);
        }
      });
      console.log(`✅ Semantic index modules validated (${semanticIndex.modules.length} files checked).`);
    }
  } catch (err) {
    logError(`Failed to parse semantic-index.json: ${err.message}`);
  }
}

// 5. Check custom-addons precedence
if (fs.existsSync(customAddonsDir)) {
  const addons = fs.readdirSync(customAddonsDir).filter(f => f.endsWith('.md'));
  if (addons.length > 0) {
    console.log(`✅ custom-addons directory validated (${addons.length} markdown rules found).`);
  } else {
    logWarning('custom-addons directory is empty. No custom priority overrides exist.');
  }
}

console.log('-------------------------------------------');
if (hasErrors) {
  console.log('❌ VALIDATION FAILED: Configuration errors were encountered. Please correct them.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️ VALIDATION SUCCESSFUL WITH WARNINGS: Checks passed, but warnings were logged.');
  process.exit(0);
} else {
  console.log('✅ VALIDATION SUCCESSFUL: Project configuration is consistent and agent-ready.');
  process.exit(0);
}
