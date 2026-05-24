import { useEffect, useState } from "react";
import { login, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";

/**
 * Custom Hook: useSolidAuth
 * Separates Solid authentication logic from UI components.
 */
export function useSolidAuth() {
  const [webId, setWebId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Handle redirect on component mount
    handleIncomingRedirect({
      restorePreviousSession: true
    }).then((info) => {
      if (info?.isLoggedIn && info.webId) {
        setWebId(info.webId);
      }
    }).catch(console.error)
      .finally(() => setIsInitializing(false));
  }, []);

  const authenticate = async (issuer: string = "https://solidcommunity.net", clientName: string = "My Solid App") => {
    await login({
      oidcIssuer: issuer,
      redirectUrl: window.location.href,
      clientName: clientName
    });
  };

  return {
    webId,
    isLoggedIn: !!webId,
    isInitializing,
    authenticate
  };
}
