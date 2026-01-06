import { App, Modal, Setting } from "obsidian";

export class DiscoveryModal extends Modal {
	private statusEl: HTMLDivElement;
	private progressEl: HTMLProgressElement;
	private deviceListEl: HTMLDivElement;
	private onCancel: () => void;
	private onSelect: (device: any) => void;
	private onStop?: () => void;
	private discoveredDevices: Set<string> = new Set();
	private isSelectionMade: boolean = false;

	constructor(
		app: App,
		onSelect: (device: any) => void,
		onCancel: () => void,
		onStop?: () => void
	) {
		super(app);
		this.onSelect = onSelect;
		this.onCancel = onCancel;
		this.onStop = onStop;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Cast to Chromecast" });

		const progressContainer = contentEl.createDiv({
			cls: "cast-progress-container",
		});
		this.progressEl = progressContainer.createEl("progress");
		this.progressEl.style.width = "100%";
		this.progressEl.value = 0;
		this.progressEl.max = 60;

		this.statusEl = contentEl.createDiv({ cls: "cast-discovery-status" });
		this.statusEl.setText("Searching for devices...");

		this.deviceListEl = contentEl.createDiv({ cls: "cast-device-list" });

		const footer = contentEl.createDiv({ cls: "cast-modal-footer" });
		footer.style.display = "flex";
		footer.style.justifyContent = "space-between";

		new Setting(footer).addButton((btn) =>
			btn.setButtonText("Cancel").onClick(() => {
				this.close();
			})
		);

		if (this.onStop) {
			new Setting(footer).addButton((btn) =>
				btn
					.setButtonText("Stop Casting")
					.setWarning()
					.onClick(() => {
						this.isSelectionMade = true;
						if (this.onStop) this.onStop();
						this.close();
					})
			);
		}
	}

	updateStatus(status: string) {
		if (this.statusEl) {
			this.statusEl.setText(status);
		}
	}

	setProgress(current: number, max: number) {
		if (this.progressEl) {
			this.progressEl.value = current;
			this.progressEl.max = max;
		}
	}

	addDevice(device: any) {
		if (this.discoveredDevices.has(device.host)) return;
		this.discoveredDevices.add(device.host);

		let displayName =
			device.friendlyName || device.name || "Unknown Device";

		// Simple cleanup for UUIDs/long hex strings in names
		displayName = displayName
			.replace(
				/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
				""
			)
			.replace(/\s*[-._]\s*$/, "")
			.trim();

		if (!displayName) displayName = device.name || "Unknown Device";

		const setting = new Setting(this.deviceListEl)
			.setName(displayName)
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
