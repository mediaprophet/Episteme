---
description: Rules for testing Solid applications using the Community Solid Server (CSS) and mocking sessions.
globs: ["**/tests/**/*", "*.test.ts", "*.spec.ts", "**/vitest.config.*"]
---
# Solid Testing Rules

W3C Solid applications operate on live decentralized Pods. Therefore, end-to-end and integration tests must run against a compliant Solid server, not mocked HTTP networks.

## Core Directives
1. **Never mock the `fetch` API for Solid endpoints:** Standard HTTP mocks (like MSW or Jest mocks) fail to accurately represent the LDP protocol, WAC/ACP headers, and WebSocket notifications of a real Solid Pod.
2. **Use Community Solid Server (CSS):** Spin up an in-memory instance of `@solid/community-server` for all integration and E2E tests.
3. **Mocking Authentication:** The only thing you should mock is the `@inrupt/solid-client-authn-browser` session state. Provide a fake authenticated `fetch` function that points to your local CSS instance.

## Example: Local CSS Setup
Use the programmatic API of Community Solid Server in your test setup files:
```javascript
import { AppRunner } from '@solid/community-server';

let app;

export async function startServer() {
  app = await new AppRunner().start(
    new AppRunner().getValidCommand({
      port: 3000,
      loggingLevel: 'info',
      seededPodConfigJson: './test-pods.json' // Optional: Seed data
    })
  );
}

export async function stopServer() {
  if (app) await app.stop();
}
```
