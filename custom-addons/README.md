# Custom Add-ons & Overrides

This directory is the "Escape Hatch" for the W3C Solid AI Helper toolkit.

While the `.agents/rules/` directory enforces strict, vanilla W3C Solid compliance, real-world applications often require domain-specific logic, such as integrating with a blockchain, utilizing a custom organizational identity provider, or enforcing unique payment schemas.

## How It Works: The Pre-Flight Hook

The root `AGENTS.md` file contains a **Pre-Flight Hook** that forces AI agents to read this directory *before* applying any standard rules. 

If an AI finds a `.md` rule file in this directory that conflicts with a vanilla rule in `.agents/rules/`, **the rule in this directory wins.**

## How to Add a Custom Override

1. **Write the AI Instruction (`.md`):** Create a Markdown file in this directory explaining *what* the AI should do differently. Prefix it so it's clear (e.g., `override-auth.md`).
2. **Write the Code Hook/Template (`.ts` / `.js`):** If your override requires specific logic (like a custom WebID resolver), create the template code in this directory so the AI can copy/import it when building your app.
3. **Trigger the AI:** Instruct the AI to build your feature as normal. The Pre-Flight Hook will ensure your custom instructions are executed.

## Examples Provided
- `example-custom-idp.md`: An AI instruction file that overrides standard Solid Auth rules to restrict users to a custom list of Pod providers.
- `custom-idp-resolver.ts`: The actual TypeScript implementation of that custom list.
