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

	startCasting(url: string, onDeviceFound?: (ip: string) => void) {
		if (this.debug) console.log("Starting Chromecast discovery...");

		let iterations = 0;
		const maxIterations = 30;

		const modal = new DiscoveryModal(
			this.app,
			(device: any) => {
				// User selected a device
				if (this.debug)
					console.log("User selected device:", device.name);
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
			}
		);

		modal.open();
		modal.updateStatus("Searching for Chromecasts...");

		// Show existing players if any
		if (this.list.players && this.list.players.length > 0) {
			this.list.players.forEach((p: any) => modal.addDevice(p));
		}

		const onUpdate = (device: any) => {
			if (this.debug) console.log("Discovered device:", device.name);
			modal.addDevice(device);
		};

		this.list.on("update", onUpdate);

		const interval = setInterval(() => {
			iterations++;
			if (iterations > maxIterations) {
				clearInterval(interval);
				this.list.removeListener("update", onUpdate);
				modal.updateStatus("Discovery complete.");
				if (iterations > maxIterations) {
					// Only show notice if we didn't find anything at all?
					// Actually, let's just let the user see the list.
				}
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
