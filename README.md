# RezBot

RezBot is a Discord bot built with Node.js. It provides automated streamer notifications, welcome messages, embed creation, and a set of utility and setup commands. RezBot uses a lightweight SQLite database powered by better-sqlite3 to store persistent data such as streamer watchlists and server configuration.

## Features

### Streamer Live Notifications
RezBot allows administrators to add streamers to a watchlist. When a watched streamer goes live, the bot sends a notification to the configured Discord channel. Streamer data is stored in a local SQLite database for fast and reliable access.

### Welcome Messages
RezBot can send a welcome message to new members when they join the server. The welcome channel is configurable.

### Embed Builder
Users can create custom embed messages using a simple command.

### Utility and Setup Commands
RezBot includes several commands for setup and general use, such as:
- ping
- status
- verifysetup
- set-channel
- set-mod-role

### Modular Command System
Each command is stored in its own file for easy maintenance and expansion.

## Command List

```
add-streamer.js
remove-streamer.js
setwelcome.js
embed.js
set-channel.js
status.js
ping.js
set-mod-role.js
verifysetup.js
```

## Tech Stack

### Core
- Node.js  
- JavaScript

### Discord Integration
- discord.js

### Database
- better-sqlite3  
  Used for:
  - Streamer watchlist storage  
  - Server configuration (welcome channel, mod role, etc.)  
  - Fast synchronous reads and writes  

### APIs
- Twitch API (used to check when streamers go live)

### Environment
- Debian 12 running inside a Proxmox container

### Additional Tools
- dotenv for environment variables  
- fs for file operations  
- node-fetch for API requests  
