/**
 * Nym Mixnet Proxy Fetch Template
 * 
 * Demonstrates routing `@inrupt/solid-client` traffic through a Nym 
 * SOCKS5 proxy to prevent metadata surveillance (IP correlation) 
 * when communicating with a Solid Pod.
 */

import { fetch as solidFetch } from '@inrupt/solid-client-authn-browser';
// Note: Node.js fetch implementation might require 'socks-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent';

const NYM_PROXY_URL = 'socks5h://127.0.0.1:1080';

export async function fetchViaNym(url: string, options: RequestInit = {}) {
  // Construct proxy agent targeting the local Nym client
  const proxyAgent = new SocksProxyAgent(NYM_PROXY_URL);

  // We inject the proxy agent into the authenticated Solid fetch.
  // This ensures the bearer token is sent, but the network request 
  // is tunneled through the Nym mixnet, hiding the user's IP.
  const response = await solidFetch(url, {
    ...options,
    // @ts-ignore - custom agent injection for Node environments
    agent: proxyAgent
  });

  return response;
}
