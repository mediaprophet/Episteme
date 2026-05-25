# Custom Addon Example: Restricted Solid Identity Provider List

This custom addon demonstrates how to restrict the allowed Solid Identity Providers (IdPs) for application login, overriding the standard open WebID lookup protocol rules.

## 🛑 OVERRIDE DIRECTIVE
This custom rule completely overrides standard vanilla rule **solid-auth.md** section *"No hardcoding allowed identity providers"*.

## Rules
1.  **Allowed IdPs:** The application MUST only allow authentication against the following trusted identity provider hosts:
    *   `https://solidcommunity.net`
    *   `https://solidweb.org`
    *   `https://inrupt.net`
2.  **Rejection Handler:** If the user inputs a custom WebID with an OIDC issuer not present in the allowed list, the login form must return a validation error: *"Identity provider is not trusted by this application configuration."*
3.  **Local Dev Exemption:** Localhost environments (`http://localhost:*`) are exempt from this restriction to facilitate local testing using CSS (Community Solid Server).
