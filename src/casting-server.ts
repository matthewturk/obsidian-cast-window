import * as http from "http";
import { App, TFile } from "obsidian";

export class CastingServer {
	private server: http.Server | null = null;
	private currentHtml: string = "";
	private port: number = 8080;
	private sessionToken: string = "";
	private allowedIp: string | null = null;
	private debug: boolean = false;

	constructor(private app: App) {
		this.generateNewToken();
	}

	setDebug(debug: boolean) {
		this.debug = debug;
	}

	setAllowedIp(ip: string | null) {
		this.allowedIp = ip;
	}

	generateNewToken() {
		// Simple random token
		this.sessionToken = Math.random().toString(36).substring(2, 15);
	}

	getSessionToken() {
		return this.sessionToken;
	}

	start(port: number = 8080) {
		this.port = port;
		this.server = http.createServer(async (req, res) => {
			const url = new URL(req.url || "", `http://localhost:${this.port}`);
			const providedToken = url.searchParams.get("token");

			if (this.debug) {
				console.log(
					`[Server] Request: ${req.method} ${req.url} from ${req.socket.remoteAddress}`
				);
			}

			// IP checking
			let remoteIp = req.socket.remoteAddress;
			if (remoteIp && remoteIp.startsWith("::ffff:")) {
				remoteIp = remoteIp.substring(7);
			}

			if (
				this.allowedIp &&
				remoteIp &&
				remoteIp !== this.allowedIp &&
				remoteIp !== "::1" &&
				remoteIp !== "127.0.0.1" &&
				remoteIp !== "localhost"
			) {
				console.warn(
					`Blocked request from unauthorized IP: ${remoteIp}`
				);
				res.writeHead(403);
				res.end("Forbidden: Unauthorized device");
				return;
			}

			if (providedToken !== this.sessionToken) {
				res.writeHead(403);
				res.end("Forbidden: Invalid or missing session token");
				return;
			}

			if (url.pathname === "/") {
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(this.currentHtml);
				return;
			}

			if (url.pathname === "/image") {
				const filePath = url.searchParams.get("path");
				if (filePath) {
					const abstractFile = this.app.vault.getAbstractFileByPath(
						decodeURIComponent(filePath)
					);
					if (abstractFile instanceof TFile) {
						try {
							const data =
								await this.app.vault.adapter.readBinary(
									abstractFile.path
								);
							res.writeHead(200, {
								"Content-Type": this.getContentType(filePath),
							});
							res.end(Buffer.from(data));
							return;
						} catch (e) {
							console.error("Failed to read image", e);
						}
					}
				}
			}

			res.writeHead(404);
			res.end();
		});

		this.server.listen(this.port);
	}

	stop() {
		if (this.server) {
			this.server.close();
			this.server = null;
		}
	}

	updateHtml(html: string) {
		this.currentHtml = html;
	}

	private getContentType(filePath: string): string {
		const ext = filePath.split(".").pop()?.toLowerCase();
		switch (ext) {
			case "png":
				return "image/png";
			case "jpg":
			case "jpeg":
				return "image/jpeg";
			case "gif":
				return "image/gif";
			case "svg":
				return "image/svg+xml";
			case "webp":
				return "image/webp";
			default:
				return "application/octet-stream";
		}
	}
}
