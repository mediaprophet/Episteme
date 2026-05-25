import fs from 'fs';
import path from 'path';

/**
 * Simulates fetching a rule document from a Solid Pod container via LDP
 * @param {string} ruleName The filename of the rule (e.g. solid-auth.md)
 * @param {string} podUrl The base URL of the Solid Pod rules container (e.g. https://pod.example/rules/)
 * @param {object} credentials Optional credentials (e.g. access token, DPoP token)
 */
export async function fetchRuleFromPod(ruleName, podUrl, credentials = {}) {
  const targetUrl = new URL(ruleName, podUrl).toString();
  console.log(`[solid-native-loader] Requesting LDP resource: GET ${targetUrl}`);
  
  if (credentials.accessToken) {
    console.log('[solid-native-loader] Injecting Bearer access token and DPoP proof headers.');
  }

  // If pointing to the reference pod.example domain or offline, mock/fall back to local file.
  if (targetUrl.includes('pod.example') || !targetUrl.startsWith('http')) {
    console.log(`[solid-native-loader] Reference Pod host detected. Resolving mock resource locally.`);
    const fallbackPath = path.resolve('.agents', 'rules', ruleName.endsWith('.md') ? ruleName : `${ruleName}.md`);
    
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath, 'utf8');
    } else {
      throw new Error(`404 Not Found: Rule "${ruleName}" does not exist in mock rules registry.`);
    }
  }

  // Otherwise, issue standard HTTP request
  const headers = {
    'Accept': 'text/markdown, text/turtle',
    ...credentials.headers
  };
  if (credentials.accessToken) {
    headers['Authorization'] = `Bearer ${credentials.accessToken}`;
  }
  if (credentials.dpopToken) {
    headers['DPoP'] = credentials.dpopToken;
  }

  const response = await fetch(targetUrl, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} from Solid Pod at ${targetUrl}`);
  }

  return await response.text();
}
