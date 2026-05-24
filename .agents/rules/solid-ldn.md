---
description: Rules for handling cross-pod messaging and decentralised inboxes using Linked Data Notifications (LDN).
globs: ["**/inbox/**/*", "**/messaging/**/*", "**/notifications/**/*", "*.ts", "*.tsx"]
---
# Linked Data Notifications (LDN) Rules

W3C Solid relies on Linked Data Notifications (LDN) for asynchronous, cross-Pod communication. This is how users send messages, share requests, or trigger server-to-server events.

## Core Directives

### 1. Dynamic Inbox Discovery
- **Constraint:** Never hardcode an inbox URL (e.g., `https://pod.example/alice/inbox/`).
- **Action:** You MUST discover the target user's inbox dynamically. Fetch their WebID profile and look for the `ldp:inbox` predicate (`http://www.w3.org/ns/ldp#inbox`).

### 2. Message Formatting (ActivityStreams)
- **Constraint:** LDN dictates *how* to send a message, but not *what* the message looks like.
- **Action:** Solid ecosystem conventions strongly prefer using the **ActivityStreams 2.0** vocabulary (`https://www.w3.org/ns/activitystreams#`) for the message payload. Format messages as RDF graphs representing an `as:Create`, `as:Follow`, or `as:Accept` activity.

### 3. Dispatching (POSTing to the Inbox)
- **Action:** To send a message, you perform an HTTP `POST` to the discovered Inbox URL with the RDF payload.
- **Permissions:** Inboxes in Solid are usually configured with `Append` access for the public or specific authenticated users. You do not need `Write` or `Read` access to someone else's inbox to drop a message into it.

### 4. Reading the Inbox
- **Action:** When reading an inbox, the inbox is simply an LDP Container. Fetch the container to get the URIs of the messages inside, then fetch each message individually.
