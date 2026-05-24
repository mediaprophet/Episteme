# Episteme Architecture

Episteme is a framework composed of modular AI rules, templates, and escape hatches designed to ensure Large Language Models build W3C Solid applications that protect human dignity and agency.

## The Three Pillars

### 1. The Core Rules (`.agents/rules/`)
This directory contains strict MarkDown directives that map directly to W3C Solid specifications.
- **Identity & Auth**: `solid-auth.md`, `solid-permissions.md`
- **Data Modeling**: `solid-ontology-creation.md`, `solid-web-annotations.md`
- **Infrastructure**: `solid-testing.md`, `solid-client-architecture.md`

### 2. The Dictionary (`semantic-dictionary.json`)
A JSON file that acts as a linguistic constraint layer. It actively forbids AIs from using corporate data-harvesting terminology, forcing them to model applications using legal and human rights semantics.

### 3. The Escape Hatch (`custom-addons/`)
Real-world systems often require domain-specific overrides (like custom blockchain payment integrations). This directory is parsed *before* the Core Rules. If a developer provides an override here, the AI respects the custom integration over the vanilla protocol.

## System Workflow
1. The AI ingests the target platform (`target-platforms/`).
2. The AI reads the `custom-addons/` directory.
3. The AI reads the Core Rules.
4. The AI cross-references all generated code against `semantic-dictionary.json`.
5. The AI outputs W3C Solid-compliant code.
