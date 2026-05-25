import { Plugin, ObsidianProtocolData } from 'obsidian';
import { Session } from '@inrupt/solid-client-authn-browser';

/**
 * Obsidian Plugin Solid Authentication Template
 * 
 * Demonstrates how to open the system browser for Solid-OIDC login 
 * and catch the redirect using the `obsidian://` protocol handler.
 */

export default class SolidPlugin extends Plugin {
  solidSession!: Session;

  async onload() {
    this.solidSession = new Session();

    // 1. Register the custom protocol handler (obsidian://solid-auth)
    this.registerObsidianProtocolHandler('solid-auth', async (params: ObsidianProtocolData) => {
      // Reconstruct the full callback URL from the parsed protocol parameters
      const callbackUrl = `obsidian://solid-auth?code=${params.code}&state=${params.state}`;
      
      try {
        // 2. Pass the callback back into the Inrupt session
        await this.solidSession.handleIncomingRedirect(callbackUrl);
        
        if (this.solidSession.info.isLoggedIn) {
          console.log('Successfully connected to Pod:', this.solidSession.info.webId);
          // Save session state via this.saveData() here
        }
      } catch (error) {
        console.error('Solid authentication failed', error);
      }
    });

    // Add a command for the user to trigger login
    this.addCommand({
      id: 'login-to-solid-pod',
      name: 'Log in to Solid Pod',
      callback: () => this.login(),
    });
  }

  async login() {
    // 3. Initiate the login flow. We use the obsidian protocol as our redirect URL.
    // The IdP must have this specific obsidian:// URI whitelisted in the Client ID document.
    await this.solidSession.login({
      oidcIssuer: 'https://solidcommunity.net',
      redirectUrl: 'obsidian://solid-auth',
      clientName: 'Obsidian Solid Sync',
      // 4. IMPORTANT: Do NOT redirect the Obsidian window. Open the system browser instead.
      handleRedirect: (authUrl: string) => {
        window.open(authUrl); 
      }
    });
  }
}
