---
description: Rules for handling W3C Solid access control (WAC and ACP) and setting permissions on resources.
globs: ["**/api/**/*", "**/services/**/*", "**/permissions/**/*", "**/access/**/*", "*.ts", "*.tsx"]
---
# Solid Access Control Rules

Solid Pods enforce data sovereignty through either Web Access Control (WAC) or Access Control Policies (ACP). Applications must be interoperable with both.

## Core Directives
1. **Never write raw ACL or ACP graph data manually.** The LLM must not attempt to manipulate `.acl` files or ACR (Access Control Resource) graphs directly using RDF.
2. **Default to the Universal API:** For standard CRUD permission sharing, always use the `universalAccess` module from `@inrupt/solid-client`. It automatically detects whether the target Pod uses WAC or ACP and applies the correct underlying specification.
3. **Access Modes:** Permissions are defined using five explicit boolean flags: `read`, `append`, `write`, `controlRead`, and `controlWrite`. Always provide explicit true/false values to avoid overriding state unintentionally.
4. **Advanced Policies:** Only drop down to the specific ACP APIs (e.g., `acp_ess_2`) if the feature explicitly requires complex policy matchers (like restricting access to specific Client IDs or building `allOf`/`anyOf` rule chains).

## Example Pattern: Universal Access
```javascript
import { universalAccess } from "@inrupt/solid-client";

/**
 * Grants specific access to a single user (Agent)
 */
async function shareWithUser(datasetUrl, agentWebId, session) {
  await universalAccess.setAgentResourceAccess(
    datasetUrl,
    agentWebId,
    { 
      read: true, 
      append: false, 
      write: false, 
      controlRead: false, 
      controlWrite: false 
    },
    { fetch: session.fetch }
  );
}

/**
 * Makes a resource publicly readable
 */
async function makePubliclyReadable(datasetUrl, session) {
  await universalAccess.setPublicResourceAccess(
    datasetUrl,
    { read: true, append: false, write: false, controlRead: false, controlWrite: false },
    { fetch: session.fetch }
  );
}

```
