import { IAuthProvider } from '../interfaces/IAuthProvider';
import { login, handleIncomingRedirect, getDefaultSession } from '@inrupt/solid-client-authn-browser';

/**
 * Inrupt Auth Adapter
 * 
 * Concrete implementation of IAuthProvider wrapping @inrupt/solid-client-authn-browser.
 */
export class InruptAuthAdapter implements IAuthProvider {
  async login(issuerId: string): Promise<void> {
    console.log(`[InruptAuthAdapter] Redirecting to issuer: ${issuerId}`);
    await login({
      oidcIssuer: issuerId,
      redirectUrl: typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
      clientName: "Episteme Enterprise Client"
    });
  }

  async logout(): Promise<void> {
    console.log('[InruptAuthAdapter] Logging out session...');
    await getDefaultSession().logout();
  }

  async handleIncomingRedirect(): Promise<{ isLoggedIn: boolean; webId?: string } | null> {
    const info = await handleIncomingRedirect({ restorePreviousSession: true });
    if (info) {
      return {
        isLoggedIn: info.isLoggedIn,
        webId: info.webId
      };
    }
    return null;
  }

  getFetch(): typeof fetch {
    return getDefaultSession().fetch;
  }
}
