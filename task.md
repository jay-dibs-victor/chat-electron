Title: Secure Messenger Desktop — “Chat List + Sync Simulator” (Electron/React/TS)
Goal
Build a small Electron + React + TypeScript desktop app that simulates a secure messenger client focusing on:
efficient local data access (SQLite)


stable real-time sync via WebSocket


UI performance with large lists (virtualization)


clean architecture and security hygiene


You do not need to implement real encryption; you must design the boundaries and avoid leaking sensitive data.


A short README.md with:


setup/run instructions


architecture overview (modules, data flow)


trade-offs + what you would improve with more time


(Optional) short screenshot / GIF



Functional Requirements
A) Local database (SQLite) — required
Use SQLite as local storage (e.g., better-sqlite3, sqlite3, sql.js, or any equivalent).
Data model
 Create a minimal schema with:
chats(id, title, lastMessageAt, unreadCount)
messages(id, chatId, ts, sender, body)


Seed data
 On first run (or via a button), generate:
200 chats
at least 20,000 messages distributed across chats
Queries
 Implement efficient queries:
Chat list: fetch chats sorted by lastMessageAt with pagination (e.g., 50 at a time)
Messages view: fetch the last 50 messages for a selected chat (with “load older” pagination)
Basic search: search messages by substring (in the current chat) — limit results to 50
Non-goal: Do not load all messages into memory and sort/filter in JS.

B) WebSocket sync simulator — required
Implement a WebSocket client that connects to a local WebSocket server inside the same app (or included script). The server should periodically emit “new message” events.
Event format
 { chatId, messageId, ts, sender, body }
Behavior
Every 1–3 seconds emit a new message for a random chat
Client receives event, writes message to SQLite, updates chat’s lastMessageAt and unreadCount
UI updates in near real-time


C) Connection Health — required
Implement robust connection handling:
connection state indicator: Connected / Reconnecting / Offline
heartbeat/ping every ~10s (or websocket ping equivalent)
exponential backoff reconnect strategy when connection drops
a button “Simulate connection drop” (server closes connection) and the client must recover
D) UI/Performance (React) — required
Build a minimal UI:
Left: Chat List
Right: Message View for selected chat


Performance requirements
Chat list must be virtualized (e.g., react-window or similar)
Message list should handle long histories efficiently (virtualization optional but appreciated)


Basic UX:


display unread count per chat
opening a chat marks it as read (unreadCount → 0)
“Load older messages” button


Security hygiene — required
You don’t need real encryption, but must show secure thinking:
Create a small module boundary like SecurityService with a placeholder encrypt() / decrypt()
Ensure no sensitive message bodies are written to logs (avoid console logging message text)
In README: explain where encryption would happen in a real system and how you would prevent leaks (logs/crash dumps/devtools)
Technical Constraints
Must use: TypeScript, React, Electron
State management: Redux Toolkit or an alternative (explain choice)
UI library: optional (Material UI is a plus)
Must run on macOS/Windows/Linux (as typical Electron project)
Time box
Please time-box yourself to ~4 hours. If something is not finished, document what remains and how you would do it.

Evaluation Criteria (what we look for)
SQLite usage quality (indexes, pagination, no full table loads)
Connection reliability (state machine, backoff, recovery)
React performance (virtualization, minimal re-renders)
Architecture (module boundaries, clean data flow, testability mindset)
Security discipline (no leaking message content, clear encrypt/decrypt boundary)


Optional (bonus)
Add indexes and mention them in README
Add a minimal unit test for one DB query or connection state reducer
Add message search across all chats
Implement message list virtualization