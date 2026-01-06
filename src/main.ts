import { Notice, Plugin, MarkdownView, setIcon } from "obsidian";
import { CastingServer } from "./casting-server";
import { renderNoteToHtml } from "./renderer";
import { CastingManager } from "./casting-manager";
import { getInternalIp } from "./utils/ip-utils";
import {
	CastPluginSettings,
	DEFAULT_SETTINGS,
	CastSettingTab,
} from "./settings";

export default class CastPlugin extends Plugin {
	settings: CastPluginSettings;
	server: CastingServer;
	castingManager: CastingManager;
	private ribbonIconEl: HTMLElement;
	private isCasting: boolean = false;

	async onload() {
		await this.loadSettings();

		this.server = new CastingServer(this.app);
		this.castingManager = new CastingManager(this.app);

		this.server.setDebug(this.settings.debug);
		this.castingManager.setDebug(this.settings.debug);

		// Start the server
		const ip = getInternalIp();
		if (!ip) {
			new Notice(
				"Could not detect internal IP address. Casting might not work."
			);
		}
		this.server.start(this.settings.port);

		// Add ribbon icon
		this.ribbonIconEl = this.addRibbonIcon(
			"cast",
			"Cast active note",
			() => {
				this.castActiveNote();
			}
		);

		// Add command
		this.addCommand({
			id: "cast-active-note",
			name: "Cast active note to Chromecast",
			callback: () => this.castActiveNote(),
		});

		this.addCommand({
			id: "stop-casting",
			name: "Stop casting",
			callback: () => {
				this.stopCasting();
			},
		});

		this.addSettingTab(new CastSettingTab(this.app, this));

		console.log("Obsidian Cast Window loaded");
	}

	onunload() {
		this.server.stop();
		this.castingManager.stopCasting();
		console.log("Obsidian Cast Window unloaded");
	}

	private updateRibbonIcon() {
		if (this.isCasting) {
			setIcon(this.ribbonIconEl, "monitor-play");
			this.ribbonIconEl.addClass("is-casting");
			this.ribbonIconEl.setAttribute(
				"aria-label",
				"Casting active (Click to cast again)"
			);
		} else {
			setIcon(this.ribbonIconEl, "cast");
			this.ribbonIconEl.removeClass("is-casting");
			this.ribbonIconEl.setAttribute("aria-label", "Cast active note");
		}
	}

	private stopCasting() {
		this.castingManager.stopCasting();
		this.server.setAllowedIp(null);
		this.isCasting = false;
		this.updateRibbonIcon();
		new Notice("Casting stopped");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.server.setDebug(this.settings.debug);
		this.castingManager.setDebug(this.settings.debug);
		// Restart server with new port if needed (simplified: just restart)
		this.server.stop();
		this.server.start(this.settings.port);
	}

	async castActiveNote() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView || !activeView.file) {
			new Notice("No active Markdown note to cast");
			return;
		}

		const ip = getInternalIp();
		if (!ip) {
			new Notice("Internal IP not found. Cannot cast.");
			return;
		}

		const serverUrl = `http://${ip}:${this.settings.port}`;

		try {
			new Notice("Preparing content...");
			const token = this.server.getSessionToken();
			const html = await renderNoteToHtml(
				this.app,
				activeView.file,
				serverUrl,
				token
			);
			this.server.updateHtml(html);

			new Notice("Searching for Chromecast...");
			this.castingManager.startCasting(
				`${serverUrl}/?token=${token}`,
				(ip) => {
					this.server.setAllowedIp(ip);
					this.isCasting = true;
					this.updateRibbonIcon();
					new Notice(`Casting to device at ${ip}`);
				},
				this.isCasting ? () => this.stopCasting() : undefined
			);
		} catch (e) {
			console.error("Failed to cast note", e);
			new Notice("Failed to cast note. See console for details.");
		}
	}
}
