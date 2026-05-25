# Active Custom Addons Rules

This file lists the active custom-addons configurations and overrides that are loaded into the agent context prior to standard modular W3C rules.

## Core Directives
1.  **Addon Precedence:** Custom rules defined here or in other custom-addon markdown files take absolute priority over vanilla core configurations.
2.  **Strict Compliance Boundary:** Custom logic (e.g. mobile edge database caching, P2P sync loops) must be isolated under `custom-addons/` and not contaminate standard modules inside `vanilla-core/`.

## Active Custom Rule Manifest
*   **[custom-addons/example-addon.md](file:///C:/antigravity/New%20folder/custom-addons/example-addon.md)**: Restricted Solid Identity Provider (IdP) login override.
