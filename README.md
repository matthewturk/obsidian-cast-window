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

## First time developing plugins?

Quick starting guide for new plugin devs:

-   Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
-   Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
-   Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
-   Install NodeJS, then run `npm i` in the command line under your repo folder.
-   Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
-   Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
-   Reload Obsidian to load the new version of your plugin.
-   Enable plugin in settings window.
-   For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

-   Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
-   Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
-   Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
-   Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
-   Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

-   Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
-   Publish an initial version.
-   Make sure you have a `README.md` file in the root of your repo.
-   Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

-   Clone this repo.
-   Make sure your NodeJS is at least v16 (`node --version`).
-   `npm i` or `yarn` to install dependencies.
-   `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

Identify your vault's plugin folder (e.g., `VaultFolder/.obsidian/plugins/obsidian-cast-window/`).
Copy the following files from the `dist/` directory into that folder:

1. `main.js`
2. `manifest.json`
3. `styles.css`

## Improve code quality with eslint

-   [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
-   This project already has eslint preconfigured, you can invoke a check by running`npm run lint`
-   Together with a custom eslint [plugin](https://github.com/obsidianmd/eslint-plugin) for Obsidan specific code guidelines.
-   A GitHub action is preconfigured to automatically lint every commit on all branches.

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
	"fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
	"fundingUrl": {
		"Buy Me a Coffee": "https://buymeacoffee.com",
		"GitHub Sponsor": "https://github.com/sponsors",
		"Patreon": "https://www.patreon.com/"
	}
}
```

## API Documentation

See https://docs.obsidian.md
