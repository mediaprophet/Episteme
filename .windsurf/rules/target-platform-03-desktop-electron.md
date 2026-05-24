---
description: Rules for generating W3C Solid apps running as Desktop applications (Electron, Tauri).
globs: ["**/*"]
---
# Solid Desktop Electron Deployment Rules

Check `AGENTS.md` for the declared Deployment Target. When targeting `desktop-electron`, you must bridge a Node.js backend with a web frontend.

## 1. Security Isolation (IPC)
- **Constraint:** Never put the Solid-OIDC authentication flow or DPoP private keys inside the renderer process (the frontend).
- **Action:** Handle authentication in the Main process (Node.js) and pass the resulting session or data safely to the renderer via IPC (Inter-Process Communication).

## 2. Authentication Flow (Loopback Servers)
- **Constraint:** Standard redirects will break the Chromium webview.
- **Action:** The OIDC flow must open the system's default browser for login (`shell.openExternal`). 
- **Callback Catching:** Spin up a temporary local loopback web server in the Main process (e.g., `http://127.0.0.1:45321/callback`) to catch the auth redirect, or register a custom desktop protocol handler (`app://`).

## 3. Data Topology
- **Action:** Be explicitly clear about where data is being saved. Differentiate between saving to the local machine's physical disk versus pushing data to the decentralized WebID Pod.
