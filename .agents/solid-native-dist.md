# Rules as Solid Resources (solid-native)

This document describes the distribution model where Episteme rules are hosted directly within a user's or organization's Solid Pod container (LDP Container) rather than loaded locally. This supports dynamic updates, remote agent configurations, and centralized governance.

---

## 1. Hosting Rules in a Pod

A rules collection is represented as an **LDP Container** (`http://www.w3.org/ns/ldp#BasicContainer`).
Here is the Turtle description of a `/rules/` container hosting the Episteme rules:

```turtle
@prefix ldp: <http://www.w3.org/ns/ldp#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<https://pod.example/rules/>
    a ldp:BasicContainer, ldp:Container ;
    dcterms:title "Episteme AI Agent Rules Container" ;
    rdfs:comment "Contains modular rules and constraints served as native resources." ;
    ldp:contains 
        <https://pod.example/rules/solid-auth.md> ,
        <https://pod.example/rules/solid-data.md> ,
        <https://pod.example/rules/solid-permissions.md> ,
        <https://pod.example/rules/solid-vocabularies.md> .
```

Each referenced rule resource (e.g. `solid-auth.md`) is a non-RDF source resource or standard RDF dataset that the agent can read via `GET`.

---

## 2. solid-native Loader Protocol

When configured in `solid-native` mode in `.agents/config.ttl`:

1.  **Rule Discovery:** The agent queries the container URL (e.g. `https://pod.example/rules/`) with a `GET` request, parsing the `ldp:contains` links to identify available rules.
2.  **Rule Fetching:** The agent issues standard HTTP `GET` requests to load specific rule files on demand.
3.  **Authentication:** The agent passes its delegated OIDC/DPoP credentials in the request headers:
    ```http
    GET /rules/solid-auth.md HTTP/1.1
    Host: pod.example
    Authorization: Bearer <dpop-bound-access-token>
    DPoP: <dpop-proof-token>
    ```
4.  **Real-Time Subscriptions:** The agent negotiates a notification channel (e.g. `WebSocketChannel2023`) on the rules container to receive real-time events (`Update`, `Create`) when rules change.

---

## 3. Benefits of solid-native Mode

*   **Zero Local Storage:** Agents don't need to download or bundle rule files with their binaries or clones.
*   **Centralized Rule Governance:** Teams can update standard rules in a shared organization Pod, and all running agent instances immediately receive the updated rules at session startup.
*   **Security & Encryption:** Access to proprietary rule sets can be controlled via standard ACP/WAC permissions at the Pod boundary.
