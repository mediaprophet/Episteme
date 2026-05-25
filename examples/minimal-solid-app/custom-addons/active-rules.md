# Example Custom Auth Override Rules

This custom rule restricts allowed Solid issuers for the minimal application.

## 🛑 OVERRIDE DIRECTIVE
This custom rule overrides standard vanilla rules for WebID OIDC authentication.

## Rules
1. Only permit sign-in via `https://solidcommunity.net`.
2. Reject any other WebID provider with an error message: *"OIDC Issuer not allowed."*
