import { App, Modal, Setting } from "obsidian";

export class DiscoveryModal extends Modal {
	private statusEl: HTMLDivElement;
	private deviceListEl: HTMLDivElement;
	private onCancel: () => void;
	private onSelect: (device: any) => void;
	private discoveredDevices: Set<string> = new Set();
	private isSelectionMade: boolean = false;

	constructor(
		app: App,
		onSelect: (device: any) => void,
		onCancel: () => void
	) {
		super(app);
		this.onSelect = onSelect;
		this.onCancel = onCancel;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Cast to Chromecast" });

		this.statusEl = contentEl.createDiv({ cls: "cast-discovery-status" });
		this.statusEl.setText("Searching for devices...");

		this.deviceListEl = contentEl.createDiv({ cls: "cast-device-list" });
		this.deviceListEl.style.margin = "20px 0";

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Cancel").onClick(() => {
				this.close();
			})
		);
	}

	updateStatus(status: string) {
		if (this.statusEl) {
			this.statusEl.setText(status);
		}
	}

	addDevice(device: any) {
		if (this.discoveredDevices.has(device.host)) return;
		this.discoveredDevices.add(device.host);

		const setting = new Setting(this.deviceListEl)
			.setName(device.name)
			.setDesc(device.host)
			.addButton((btn) =>
				btn
					.setButtonText("Cast")
					.setCta()
					.onClick(() => {
						this.isSelectionMade = true;
						this.onSelect(device);
						this.close();
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		if (!this.isSelectionMade) {
			this.onCancel();
		}
	}
}
