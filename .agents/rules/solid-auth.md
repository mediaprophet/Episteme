---
description: Rules for handling Solid-OIDC authentication, WebIDs, and session management based on the declared stack.
globs: ["**/auth/**/*", "**/login/**/*", "**/components/*Login*", "*.ts", "*.tsx", "**/App.tsx", "**/index.tsx"]
---
# Solid Authentication Rules

Check `AGENTS.md` for the declared Authentication library before writing code. All Solid apps use Solid-OIDC, but the implementation differs drastically between stacks.

## Core Directives (All Stacks)
1. **No Standard JWT/OAuth2:** Never build custom JWT handlers or standard OAuth2 flows. Solid Identity Providers (IdPs) require specific Solid-OIDC flows.
2. **WebID as the Root:** Authentication always yields a WebID (a URI). This WebID is the starting point for all user data discovery.

---

## 1. If the stack uses LDO (@ldo/solid-react):
- **Core Concept:** LDO manages the authenticated session globally via React Context. You do not need to pass an authenticated `fetch` function manually to data hooks.
- **Provider Injection:** The entire application MUST be wrapped in `<BrowserSolidLdoProvider>`. 
- **Pattern:** Use the `useSolidAuth()` hook to access login methods and session state.

### LDO Implementation Pattern:
```tsx
import { BrowserSolidLdoProvider, useSolidAuth } from '@ldo/solid-react';

// 1. Wrap the app at the root level
export const App = () => (
  <BrowserSolidLdoProvider>
    <LoginComponent/>
  </BrowserSolidLdoProvider>
);

// 2. Use the hook inside components
export const LoginComponent = () => {
  const { login, logout, session } = useSolidAuth();

  if (session.isLoggedIn) {
    return (
      <div>
        <p>Logged in as: {session.webId}</p>
        <button onClick={logout}>Log Out</button>
      </div>
    );
  }

  return (
    <button onClick={() => login('https://solidcommunity.net')}>
      Log In with SolidCommunity
    </button>
  );
};
```

---

## 2. If the stack uses @inrupt/solid-client-authn-browser:
- **Core Concept:** You manage the Session instance. The most critical export is the authenticated `fetch` function from the session, which MUST be passed into all data-fetching methods.
- **Pattern:** Handle the incoming redirect on mount (`handleIncomingRedirect`).
- **Storage:** Do not attempt to store the tokens manually. The library handles token storage in `localStorage` securely.

### Inrupt Implementation Pattern:
```tsx
import { login, handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser";

// Must be called on page load to handle the OAuth redirect back from the Pod
handleIncomingRedirect({
  restorePreviousSession: true,
}).then((info) => {
  if (info?.isLoggedIn) {
    console.log("Logged in as:", info.webId);
  }
});

// Triggering Login
export function triggerLogin(issuerUrl = "https://solidcommunity.net") {
  login({
    oidcIssuer: issuerUrl,
    redirectUrl: window.location.href,
    clientName: "My Solid Application"
  });
}
```
