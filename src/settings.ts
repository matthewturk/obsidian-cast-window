import { App, PluginSettingTab, Setting } from "obsidian";
import CastPlugin from "./main";

export interface CastPluginSettings {
	port: number;
	debug: boolean;
}

export const DEFAULT_SETTINGS: CastPluginSettings = {
	port: 8080,
	debug: false,
};

export class CastSettingTab extends PluginSettingTab {
	plugin: CastPlugin;

	constructor(app: App, plugin: CastPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Server port")
			.setDesc("Port for the local HTTP server")
			.addText((text) =>
				text
					.setPlaceholder("8080")
					.setValue(this.plugin.settings.port.toString())
					.onChange(async (value) => {
						const port = parseInt(value);
						if (!isNaN(port)) {
							this.plugin.settings.port = port;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Debug logging")
			.setDesc(
				"Enable detailed logging for discovery and server requests"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.debug)
					.onChange(async (value) => {
						this.plugin.settings.debug = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
