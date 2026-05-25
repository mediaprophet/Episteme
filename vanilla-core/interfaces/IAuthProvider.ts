/**
 * Universal Authentication Provider Interface
 * 
 * Abstracting login, logout, and fetch capabilities across various
 * authentication libraries (e.g. Inrupt's authn-browser vs open OIDC clients).
 */
export interface IAuthProvider {
  /**
   * Initiates OIDC login flow.
   */
  login(issuerId: string): Promise<void>;

  /**
   * Clears session and logs out the user.
   */
  logout(): Promise<void>;

  /**
   * Handles incoming redirect URL parameters (such as OIDC authorization codes)
   * and completes session initialization.
   */
  handleIncomingRedirect(): Promise<{ isLoggedIn: boolean; webId?: string } | null>;

  /**
   * Returns an authenticated fetch client configured with key tokens (like DPoP).
   */
  getFetch(): typeof fetch;
}
