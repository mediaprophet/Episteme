---
description: Custom override instructing the AI to reject vanilla OIDC rules and use a curated corporate Identity Provider list.
globs: ["**/auth/**/*", "**/login/**/*", "*.ts", "*.tsx"]
---
# OVERRIDE: Custom Identity Provider Resolution

**ATTENTION AI:** This is a Custom Override. You must ignore the standard authentication directives in `.agents/rules/solid-auth.md` regarding open Identity Provider selection.

## New Directives
1. **No Open Login:** Do not allow the user to type in an arbitrary Solid Pod URL (like `https://solidcommunity.net` or `https://inrupt.net`).
2. **Curated List Only:** You MUST restrict login exclusively to the curated list of Identity Providers defined in `custom-addons/custom-idp-resolver.ts`.
3. **UI Constraint:** When generating a Login Component, you must generate a dropdown menu (`<select>`) populated *only* by the hosts defined in the custom resolver. Do not render a free-text `<input>` field for the WebID.
