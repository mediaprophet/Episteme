import { Session } from '@inrupt/solid-client-authn-browser';

/**
 * Manifest V3 Extension Authentication Flow
 * 
 * Demonstrates intercepting the Solid-OIDC redirect using the Chrome Identity API,
 * allowing the user to authenticate without closing the extension popup.
 */

export async function loginWithExtension(oidcIssuer: string) {
  const session = new Session();
  
  // 1. Get the exact redirect URL for this specific browser extension
  const redirectUrl = chrome.identity.getRedirectURL('solid-auth');

  return new Promise((resolve, reject) => {
    // 2. Start the Inrupt login process, but do NOT let it alter window.location
    session.login({
      oidcIssuer,
      redirectUrl,
      clientName: "Solid WebClip Extension",
      handleRedirect: (authUrl: string) => {
        // 3. Instead of redirecting the tab, we pass the URL to the Chrome Identity API
        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl,
            interactive: true,
          },
          async (callbackUrl) => {
            if (chrome.runtime.lastError || !callbackUrl) {
              return reject(chrome.runtime.lastError);
            }

            // 4. The user logged in. Pass the resulting URL back to Inrupt to finalize the session
            await session.handleIncomingRedirect(callbackUrl);
            
            // 5. Save the session tokens to chrome.storage.local so the Service Worker can use them
            if (session.info.isLoggedIn && session.info.sessionId) {
              await chrome.storage.local.set({ solidSessionId: session.info.sessionId });
              resolve(session);
            }
          }
        );
      }
    });
  });
}
