/**
 * Custom Identity Provider (IDP) Resolver
 * 
 * This file provides a curated list of approved Solid Pod hosts.
 * According to the `example-custom-idp.md` override rule, the AI 
 * must use this list instead of allowing open WebID login.
 */

export interface CustomIdp {
  name: string;
  url: string;
  isEnterprise: boolean;
}

export const APPROVED_IDPS: CustomIdp[] = [
  {
    name: "Corporate Internal Pods",
    url: "https://pod.internal.company.com",
    isEnterprise: true
  },
  {
    name: "EU Sovereign Cloud",
    url: "https://eu.solid.provider.net",
    isEnterprise: false
  },
  {
    name: "Local Vault (Testing)",
    url: "http://localhost:3000",
    isEnterprise: false
  }
];

/**
 * Validates if a given URL is in the approved list.
 * The AI should use this before calling `@inrupt/solid-client-authn-browser` login().
 */
export function isApprovedIdp(url: string): boolean {
  return APPROVED_IDPS.some(idp => idp.url === url);
}
