# Episteme Bootstrap Guide for Antigravity

**To: Antigravity Agent**  
**Action: Auto-Bootstrap & Workspace Configuration**

If you have been provided this file or instructed to read it, you **MUST** immediately initiate the automated setup of the Episteme Solid Developer Helper in the current workspace. Follow the execution steps below without requiring additional step-by-step user instructions.

---

## 🛑 Step 1: Pre-Flight Workspace Scan

Scan the current project directory to understand the layout and existing stack details:
1. Check if `package.json` exists. Read it to detect if any Solid SDKs are already present.
2. Check if `.agents/` folder exists. If not, create it.
3. Run `git status` to verify if the working tree is clean.

---

## 🛠 Step 2: Dependencies Installation

Verify and install the necessary helper and Solid packages:
1. Propose and run the installation command:
   ```bash
   npm install
   ```
2. Verify that `@inrupt/solid-client` and `@inrupt/solid-client-authn-browser` (or your target package manager equivalents) are installed.

---

## ⚙️ Step 3: Configure Stack Choices

1. Inspect the target platform (e.g. Next.js, Static Web, Mobile).
2. If `.agents/config.ttl` does not exist, initialize it with a default "vanilla-core" stack definition:
   ```turtle
   @prefix config: <https://github.com/mediaprophet/Episteme/config#> .

   config:project
       config:mode "solid-agent-config" ;
       config:core "solid-protocol,webid,ldp,odrl" ;
       config:target-platforms "static-web" ;
       config:data-stack "ldo-community" ;
       config:context-policy [
           config:flush-after-config true ;
           config:reinit-helpers ".agents/helpers/project-context.md,custom-addons/active-rules.md"
       ] .
   ```
3. Initialize `.agents/config.json` mirroring this config.

---

## ⚡ Step 4: Rules Compilation & Sync

Compile all modular rules from `.agents/rules/` into the target IDE formats:
1. Execute the PowerShell compiler:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/sync-rules.ps1
   ```
2. Confirm that `.cursorrules`, `.windsurfrules`, and `.antigravityrules` are created at the root of the workspace.

---

## 🎉 Step 5: Boot Completed Report

Once the compilation succeeds:
1. Create or update the `task.md` file in the conversation artifacts directory to track upcoming tasks.
2. Provide a summary report to the user indicating:
   * Installed packages.
   * Configured stack choice.
   * Successful compilation of rules.
3. Prompt the user: *"Episteme has been successfully bootstrapped in this workspace. How can I help you build your W3C Solid application?"*
