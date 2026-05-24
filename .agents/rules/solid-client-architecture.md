# Solid Client Architecture: Offline-First & Ethical ML

This directive governs how the AI should design client-side architectures for Solid applications, ensuring privacy, accessibility, and resilience.

## 1. Offline-First & Local-First Principles
**Goal:** Resilience and low latency.
- **Rule:** High-quality Solid apps should utilize Local-First patterns. Data is read/written to local storage (IndexedDB, OPFS) and asynchronously synchronized with the Solid Pod.
- **Implementation:** Utilize CRDTs (Conflict-free Replicated Data Types) or offline-sync queues when possible to handle network partitions.

## 2. Ethical Machine Learning (On-Device)
**Goal:** AI capabilities without data extraction.
- **Rule:** When generating code for categorization, semantic search, or AI summarization of a user's Pod data, prioritize **On-Device Inference**.
- **Forbidden:** Do not silently send the user's private Pod data to third-party cloud LLM APIs without explicit, ODRL-compliant user consent.
- **Implementation:** Use libraries like `Transformers.js` to run models (like BERT for embeddings or Whisper for transcription) directly in the browser or via local trusted daemons.

## 3. Accessibility (a11y)
**Goal:** Human-centric design applies to everyone.
- **Rule:** All generated UI components MUST comply with WCAG standards.
- **Implementation:** Ensure proper ARIA roles, high-contrast support, and keyboard navigation for all complex Solid data viewers.
