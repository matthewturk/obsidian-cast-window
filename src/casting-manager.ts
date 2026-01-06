import { App, Notice } from "obsidian";
// @ts-ignore
import chromecasts from "chromecasts";
import { DiscoveryModal } from "./ui/discovery-modal";

export class CastingManager {
	private list: any;
	private currentDevice: any = null;
	private debug: boolean = false;
	private app: App;

	constructor(app: App) {
		this.app = app;
		this.list = chromecasts();
	}

	setDebug(debug: boolean) {
		this.debug = debug;
	}

	startCasting(
		url: string,
		onDeviceFound?: (ip: string) => void,
		onStop?: () => void
	) {
		if (this.debug) console.log("Starting Chromecast discovery...");

		let iterations = 0;
		const maxIterations = 60;

		const modal = new DiscoveryModal(
			this.app,
			(device: any) => {
				// User selected a device
				const displayName = device.friendlyName || device.name;
				if (this.debug)
					console.log("User selected device:", displayName);
				clearInterval(interval);
				this.list.removeListener("update", onUpdate);

				this.currentDevice = device;
				const deviceIp = device.host;
				if (deviceIp && onDeviceFound) {
					onDeviceFound(deviceIp);
				}

				device.play(
					url,
					{
						title: "Obsidian Note",
						contentType: "text/html",
					},
					(err: any) => {
						if (err) {
							console.error("Casting error:", err);
							new Notice("Casting error: " + err.message);
						} else {
							console.log("Casting started successfully");
						}
					}
				);
			},
			() => {
				// User cancelled
				if (this.debug) console.log("Discovery cancelled by user");
				clearInterval(interval);
				this.list.removeListener("update", onUpdate);
			},
			onStop
		);

		modal.open();
		modal.updateStatus("Searching for Chromecasts...");
		modal.setProgress(0, maxIterations);

		// Show existing players if any
		if (this.list.players && this.list.players.length > 0) {
			this.list.players.forEach((p: any) => modal.addDevice(p));
		}

		const onUpdate = (device: any) => {
			const displayName = device.friendlyName || device.name;
			if (this.debug) console.log("Discovered device:", displayName);
			modal.addDevice(device);
		};

		this.list.on("update", onUpdate);

		const interval = setInterval(() => {
			iterations++;
			modal.setProgress(iterations, maxIterations);

			if (iterations > maxIterations) {
				clearInterval(interval);
				this.list.removeListener("update", onUpdate);
				modal.updateStatus("Discovery complete.");
				return;
			}

			modal.updateStatus(
				`Searching... (Attempt ${iterations}/${maxIterations})`
			);
			this.list.update();
		}, 1000);

		// Initial update
		this.list.update();
	}

	stopCasting() {
		if (this.currentDevice) {
			this.currentDevice.stop();
			this.currentDevice = null;
		}
	}
}
