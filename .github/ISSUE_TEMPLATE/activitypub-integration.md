# ActivityPub Integration

**Title Suggestion:** [Enhancement] Add comprehensive ActivityPub rules, templates and federation patterns

**Body:**

Current state:
- Partial support exists via ActivityStreams 2.0 vocabulary in `solid-ldn.md`.
- No dedicated rules or templates for full ActivityPub (actors, outbox, inbox, federation, following, etc.).

Tasks:
- Create new rule file `.agents/rules/solid-activitypub.md`
- Add templates for ActivityPub actors, objects, and interactions that comply with Solid + LDN.
- Update AGENTS.md and semantic-dictionary if needed.
- Ensure compatibility with existing LDN and Web Annotation rules.

**Part of:** Epic #14 or new federation epic

**Labels:** enhancement, rules, solid, activitypub