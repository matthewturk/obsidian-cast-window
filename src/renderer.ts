import { App, MarkdownRenderer, TFile, Component } from "obsidian";

export async function renderNoteToHtml(
	app: App,
	file: TFile,
	serverUrl: string,
	token: string
): Promise<string> {
	const content = await app.vault.read(file);
	const container = document.createElement("div");

	// Component is required for rendering
	const component = new Component();
	component.load();

	await MarkdownRenderer.render(
		app,
		content,
		container,
		file.path,
		component
	);

	// Intercept local images
	const images = container.querySelectorAll("img");
	images.forEach((img) => {
		const src = img.getAttribute("src");
		if (src && !src.startsWith("http") && !src.startsWith("data:")) {
			// Handle app:// uris or relative paths
			let linkpath = src;
			if (src.startsWith("app://")) {
				// Extract the actual path from app:// URI if needed
				// But metadataCache.getFirstLinkpathDest usually handles relative paths better
				// If it's already an absolute-ish internal path, linkpath logic still applies
			}

			linkpath = decodeURIComponent(linkpath).split("?")[0] || "";
			const imageFile = app.metadataCache.getFirstLinkpathDest(
				linkpath,
				file.path
			);
			if (imageFile) {
				img.setAttribute(
					"src",
					`${serverUrl}/image?path=${encodeURIComponent(
						imageFile.path
					)}&token=${token}`
				);
			}
		}
	});

	const css = getInlinedCss();
	const bodyClass = document.body.className;

	const html = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		${css}
		body {
			padding: 40px;
			max-width: 800px;
			margin: 0 auto;
			background-color: var(--background-primary);
			color: var(--text-normal);
		}
	</style>
</head>
<body class="${bodyClass} markdown-preview-view">
	<div class="markdown-rendered">
		${container.innerHTML}
	</div>
</body>
</html>`;

	component.unload();
	return html;
}

function getInlinedCss(): string {
	let css = "";
	for (let i = 0; i < document.styleSheets.length; i++) {
		const sheet = document.styleSheets[i];
		if (!sheet) continue;
		try {
			const rules = sheet.cssRules;
			if (!rules) continue;
			for (let j = 0; j < rules.length; j++) {
				const rule = rules[j];
				if (rule) {
					css += rule.cssText + "\n";
				}
			}
		} catch {
			// Some stylesheets might be cross-origin or inaccessible
			continue;
		}
	}
	return css;
}
