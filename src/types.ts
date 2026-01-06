export interface ChromecastDevice {
	name: string;
	friendlyName?: string;
	host: string;
	play(
		url: string,
		options: { title: string; contentType: string },
		callback: (err: Error | null) => void
	): void;
	stop(): void;
	on(event: string, listener: (device: ChromecastDevice) => void): void;
	removeListener(
		event: string,
		listener: (device: ChromecastDevice) => void
	): void;
	update(): void;
}

export interface ChromecastList {
	players: ChromecastDevice[];
	on(event: string, listener: (device: ChromecastDevice) => void): void;
	removeListener(
		event: string,
		listener: (device: ChromecastDevice) => void
	): void;
	update(): void;
}
