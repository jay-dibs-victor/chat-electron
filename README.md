# Secure Messenger Desktop (Chat List + Sync Simulator)

A high-performance Electron desktop application built with React, TypeScript, and SQLite.

## Architecture Overview

### Data Layer (SQLite)
- **Local Persistence**: Uses `better-sqlite3` for efficient local storage.
- **Schema**:
  - `chats`: Stores chat metadata, last message timestamp, and unread counts.
  - `messages`: Stores message history linked to chats.
- **Performance**:
  - Indexed queries for chat lists and message history.
  - Paginated fetching (50 items at a time) to ensure UI responsiveness.
  - Seeded with 200 chats and 20,000+ messages to demonstrate scale handling.

### Sync Simulator (WebSocket)
- **Real-time Updates**: An internal WebSocket server periodically emits new messages.
- **Reliability**:
  - Connection health indicator (Connected / Reconnecting / Offline).
  - Heartbeat/Ping every 10 seconds.
  - Exponential backoff strategy for reconnection.
  - IPC bridge to update the UI and database simultaneously.

### UI / Frontend (React)
- **State Management**: Redux Toolkit for predictable state transitions and async data fetching.
- **Virtualized Lists both Chatlist and Messages**: `react-window` used for the chat list to handle 200+ chats with zero lag + Scroll to last message.
- **Design**: Material UI with a dark "Premium" aesthetic, focusing on visual excellence and smooth micro-interactions.

- **Additional Feature**: Chat Box with chat functionality to add chat to currentl chat


### Security
- **E2EE**: Implements robust End-to-End Encryption using AES-GCM (WebCrypto in renderer, node:crypto in simulator).
- **Module Boundary**: All encryption/decryption is encapsulated within `SecurityService`.
- **Leak Prevention**: 
  - Sensitive message bodies are never logged to the console.
  - Log wrappers ensure only metadata (e.g., content length) is exposed in debug logs.
  - In a real system, encryption would happen at the edge before storage, and keys would be stored in the OS Keychain/Secret Service.

## Setup & Run

### Prerequisites
- Node.js (v16+)
- npm

### Installation
```bash
npm install
```


## Notr: 
- npm run build throws negligible warnings errors on mui lib.. this dont affect build 
- build would still run successfully

### Development
```bash
npm run build; npm run electron:dev
```

### Build
```bash
npm run electron:build
```

## Trade-offs & Future Improvements
1. **File Upload**: Extend with file upload feature not implemented. file upload service would be implemented as well as a database model for it to properly tie entities of the chat list with the current user
2. **Audio Chat** No Audio feature
3. **Quick Voice over call**: No Voice over feature: Feature for enhancement would need the html audio element , and electron functionality to make this operational
4. **Warning errors**: Mui outputs warning errors during build this was not handled but it does not affect working or successful build
5. ***Windows Tested**: tested on window with a fall back to linux command. not enough time to re-test on linux. see scripts/start-electron.js a script hack written to lauch electron on diff os

## Tech Stack Details
- **Build Tool**: [electron-vite]- provides a fast and streamlined development experience.
- **SQLite**: [better-sqlite3] - the fastest and most stable SQLite library for Node.js.
- **UI**: [Material UI] - for a consistent and professional component library.
- **Virtualization**: [react-window] - for high-performance list rendering.
