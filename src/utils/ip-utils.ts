import * as os from "os";

/**
 * Detects the machine's internal network IP address (IPv4).
 */
export function getInternalIp(): string | undefined {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		const ifaceList = interfaces[name];
		if (!ifaceList) continue;

		for (const iface of ifaceList) {
			// Skip internal (loopback) and non-IPv4 addresses
			if (iface.family === "IPv4" && !iface.internal) {
				return iface.address;
			}
		}
	}
	return undefined;
}
