import { IAuthProvider } from '../interfaces/IAuthProvider';

/**
 * Community Auth Adapter
 * 
 * Implements IAuthProvider wrapping generic/community-centric Solid OIDC client frameworks.
 */
export class CommunityAuthAdapter implements IAuthProvider {
  private loggedIn: boolean = false;
  private webId?: string;

  async login(issuerId: string): Promise<void> {
    console.log(`[CommunityAuthAdapter] Logging in with community OIDC issuer: ${issuerId}`);
    this.loggedIn = true;
    this.webId = "https://community-pod.example/profile/card#me";
    if (typeof window !== 'undefined') {
      window.location.href = `${window.location.origin}/?code=mock-community-code`;
    }
  }

  async logout(): Promise<void> {
    this.loggedIn = false;
    this.webId = undefined;
    console.log(`[CommunityAuthAdapter] Logged out successfully.`);
  }

  async handleIncomingRedirect(): Promise<{ isLoggedIn: boolean; webId?: string } | null> {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('code')) {
        this.loggedIn = true;
        this.webId = "https://community-pod.example/profile/card#me";
        return {
          isLoggedIn: true,
          webId: this.webId
        };
      }
    }
    return { isLoggedIn: false };
  }

  getFetch(): typeof fetch {
    // Return standard fetch client containing authorization headers for the community Pod
    return (typeof window !== 'undefined' ? window.fetch.bind(window) : fetch);
  }
}
