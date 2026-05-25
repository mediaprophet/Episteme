import { useEffect, useState } from "react";
import { IAuthProvider } from "../../interfaces/IAuthProvider";
import { InruptAuthAdapter } from "../../adapters/InruptAuthAdapter";
import { CommunityAuthAdapter } from "../../adapters/CommunityAuthAdapter";
import configData from "../../../.agents/config.json";

/**
 * Custom Hook: useSolidAuth
 * 
 * Factory-based React Hook that instantiates the proper authentication adapter
 * based on the active Episteme configuration stack selection.
 */
export function useSolidAuth() {
  const [webId, setWebId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authProvider, setAuthProvider] = useState<IAuthProvider | null>(null);

  useEffect(() => {
    // Select the provider adapter based on config stack choice
    const dataStack = (configData as any).project["data-stack"] || "ldo-community";
    let provider: IAuthProvider;
    
    if (dataStack === "inrupt-enterprise") {
      provider = new InruptAuthAdapter();
    } else {
      provider = new CommunityAuthAdapter();
    }
    
    setAuthProvider(provider);

    provider.handleIncomingRedirect().then((info) => {
      if (info?.isLoggedIn && info.webId) {
        setWebId(info.webId);
      }
    }).catch(console.error)
      .finally(() => setIsInitializing(false));
  }, []);

  const authenticate = async (issuer: string = "https://solidcommunity.net") => {
    if (authProvider) {
      await authProvider.login(issuer);
    }
  };

  const logout = async () => {
    if (authProvider) {
      await authProvider.logout();
      setWebId(null);
    }
  };

  return {
    webId,
    isLoggedIn: !!webId,
    isInitializing,
    authenticate,
    logout
  };
}
