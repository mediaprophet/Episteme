# Solid Server Portability & Adapter Pattern Rules

To defend against vendor lock-in and support dynamic switching of data and authentication stacks, all agents and developers MUST write core components against Episteme's universal interfaces rather than importing specific Solid SDKs directly into UI components.

## ⚔️ The "Browser Wars" Analogy
Just as the early web suffered from fragmented, browser-specific DOM implementation layers (Netscape vs. IE), the contemporary W3C Solid ecosystem is split between:
1.  **Enterprise Targets (Inrupt ESS):** Proprietary SDKs, Access Control Policies (ACP), and custom WebSockets event channels.
2.  **Community Targets (CSS, NSS):** Open-source libraries, Web Access Control (WAC/ACL), and standard W3C WebSockets.
3.  **Vanilla Generic Targets:** Raw HTTP LDP request operations.

Episteme abstracts these differences using the **Universal Adapter Pattern**.

---

## 🛠 Directives & Guardrails

1.  **Do Not Direct Import:**
    *   *Anti-Pattern:* Importing `login` from `@inrupt/solid-client-authn-browser` directly inside a React component.
    *   *Correction:* Import and invoke the `useSolidAuth` hook, which uses the `IAuthProvider` factory.
2.  **Use Portability Checkers:**
    *   Always run `validatePortability()` on the active data provider (`IDataProvider`) before committing RDF payloads.
    *   The `InruptDataAdapter` will flag warning errors if WAC/ACL namespace rules are targeted at ESS.
    *   The `LDODataAdapter` will flag warning errors if ACP policies are targeted at CSS.

---

## ⚡ Abstraction Interface Schema Reference

### Authentication Abstraction (`IAuthProvider`)
Exposes unified login, logout, and token-injecting fetch client:
```typescript
export interface IAuthProvider {
  login(issuerId: string): Promise<void>;
  logout(): Promise<void>;
  handleIncomingRedirect(): Promise<{ isLoggedIn: boolean; webId?: string } | null>;
  getFetch(): typeof fetch;
}
```

### Data Manipulation Abstraction (`IDataProvider`)
Handles portable read/write operations and schema verification:
```typescript
export interface IDataProvider {
  read(uri: string): Promise<string | null>;
  write(uri: string, data: string): Promise<void>;
  validatePortability(data: string): { portable: boolean; warnings: string[] };
}
```

### Notification Abstraction (`INotificationProvider`)
Exposes unified resource synchronization:
```typescript
export interface INotificationProvider {
  subscribeToResource(uri: string, callback: (data: string) => void): Promise<void>;
  unsubscribe(uri: string): Promise<void>;
  onConnectionLost(callback: () => void): void;
}
```
