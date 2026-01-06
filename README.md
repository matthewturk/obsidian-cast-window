# Obsidian Cast Window

Casts the active Markdown note to a Chromecast device on your local network.

## Features

-   **Local Casting**: discovered Chromecasts on your local network.
-   **Theme Preservation**: Inlines Obsidian's app CSS so the note looks as it does in your vault.
-   **Image Support**: Intercepts local image links and serves them from your vault to the Chromecast.

## Security

This plugin starts a local HTTP server to host the rendered content. To protect your vault data from unauthorized access on the local network:

-   **Session Tokens**: A unique, random session token is generated for every cast. Requests without this token are rejected.
-   **Local Network Only**: The server is only accessible to devices on your local Wi-Fi. It does not expose data to the internet.

## Usage

1. Click the **Cast** icon in the ribbon or use the command "Cast active note to Chromecast".
2. The plugin will search for devices and start casting.
3. Use "Stop casting" to disconnect.

## Installation

### Community Plugin Store

(Coming soon once submitted to the Obsidian Community Plugins list)

### Manual Installation

Identify your vault's plugin folder (e.g., `VaultFolder/.obsidian/plugins/obsidian-cast-window/`).
Copy the following files from a [Release](https://github.com/matthewturk/obsidian-cast-window/releases) into that folder:

1. `main.js`
2. `manifest.json`
3. `styles.css`

## API Documentation

See https://docs.obsidian.md
