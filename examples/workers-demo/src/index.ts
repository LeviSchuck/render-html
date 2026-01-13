import { initWokererWasm } from "@levischuck/render-html/worker-wasm";
import { renderHtml, extractFontsFromHTML, loadFonts } from "@levischuck/render-html";
import { htmlNodeToHtmlElement, readHtml } from "@levischuck/tiny-html";
import { encodeBase64 } from "@levischuck/tiny-encodings";

interface Env {
	// Add any environment variables or bindings here if needed
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle POST requests for rendering
		if (request.method === "POST" && url.pathname === "/render") {
			try {
				await initWokererWasm();

				const formData = await request.formData();
				const html = (formData.get("html") as string).replaceAll("\r", '');
				const format = (formData.get("format") as string) || "png";
				const width = parseInt(formData.get("width") as string) || 1200;
				const height = parseInt(formData.get("height") as string) || 630;

				if (!html) {
					return new Response(JSON.stringify({ error: "HTML content is required" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
				}

				// Parse HTML string to HtmlElement
				const { node } = readHtml(html);
				const element = htmlNodeToHtmlElement(node);

				// Extract and load fonts
				const fontsToLoad = extractFontsFromHTML(element);
				const fonts = await loadFonts(fontsToLoad);

				// Render the image
				const imageBlob = await renderHtml(element, {
					width: width === 0 ? undefined : width,
					height: height === 0 ? undefined : height,
					format: format as "png" | "svg",
					fonts,
					emoji: "twemoji",
				});

				// Convert blob to base64 data URL
				const arrayBuffer = await imageBlob.arrayBuffer();
				const base64 = encodeBase64(arrayBuffer);
				const mimeType = format === "svg" ? "image/svg+xml" : "image/png";
				const dataUrl = `data:${mimeType};base64,${base64}`;

				return new Response(JSON.stringify({ dataUrl }), {
					headers: { "Content-Type": "application/json" },
				});
			} catch (error) {
				console.error("Rendering error:", error);
				return new Response(
					JSON.stringify({
						error: error instanceof Error ? error.message : "Failed to render image",
					}),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		}

		// Handle GET requests - serve the HTML page
		if (request.method === "GET" && url.pathname === "/") {
			const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Render HTML - Workers Demo</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
			background: #1a1a1a;
			color: #e0e0e0;
			height: 100vh;
			overflow: hidden;
		}
		.container {
			display: flex;
			height: 100vh;
			gap: 1px;
			background: #2a2a2a;
		}
		.panel {
			flex: 1;
			display: flex;
			flex-direction: column;
			background: #1a1a1a;
			overflow: hidden;
		}
		.panel-header {
			padding: 1rem;
			background: #2a2a2a;
			border-bottom: 1px solid #3a3a3a;
		}
		.panel-header h2 {
			font-size: 1.25rem;
			font-weight: 600;
		}
		.panel-content {
			flex: 1;
			overflow: auto;
			padding: 1rem;
		}
		.form-group {
			margin-bottom: 1rem;
		}
		label {
			display: block;
			margin-bottom: 0.5rem;
			font-weight: 500;
			font-size: 0.9rem;
			color: #b0b0b0;
		}
		textarea {
			width: 100%;
			min-height: 300px;
			padding: 0.75rem;
			background: #2a2a2a;
			border: 1px solid #3a3a3a;
			border-radius: 4px;
			color: #e0e0e0;
			font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
			font-size: 0.875rem;
			resize: vertical;
		}
		textarea:focus {
			outline: none;
			border-color: #4a9eff;
		}
		.input-group {
			display: flex;
			gap: 1rem;
			margin-bottom: 1rem;
		}
		.input-group input {
			flex: 1;
			padding: 0.5rem;
			background: #2a2a2a;
			border: 1px solid #3a3a3a;
			border-radius: 4px;
			color: #e0e0e0;
		}
		.input-group input:focus {
			outline: none;
			border-color: #4a9eff;
		}
		.radio-group {
			display: flex;
			gap: 1rem;
			margin-bottom: 1rem;
		}
		.radio-option {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
		.radio-option input[type="radio"] {
			accent-color: #4a9eff;
		}
		button {
			padding: 0.75rem 1.5rem;
			background: #4a9eff;
			border: none;
			border-radius: 4px;
			color: white;
			font-weight: 600;
			cursor: pointer;
			font-size: 1rem;
			transition: background 0.2s;
		}
		button:hover {
			background: #3a8eef;
		}
		button:disabled {
			background: #3a3a3a;
			cursor: not-allowed;
			opacity: 0.5;
		}
		.preview {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 100%;
			background: #2a2a2a;
			border-radius: 4px;
		}
		.preview img {
			max-width: 100%;
			max-height: 100%;
			object-fit: contain;
		}
		.error {
			color: #ff6b6b;
			padding: 1rem;
			background: #3a2a2a;
			border-radius: 4px;
			border: 1px solid #5a3a3a;
		}
		.loading {
			color: #4a9eff;
			padding: 1rem;
			text-align: center;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="panel">
			<div class="panel-header">
				<h2>HTML Input</h2>
			</div>
			<div class="panel-content">
				<form id="renderForm">
					<div class="form-group">
						<label for="html">HTML Content:</label>
						<textarea id="html" name="html" required><div style="font-family: 'Sour Gummy'; display: flex; flex-direction: column; width: 100vw; align-items: center; justify-content: center; background-color: #160f29; color: white; font-size: 60px; font-weight: 600; margin: 0; padding: 40px">
	Hello 🌎
	<hr style="border-color: white; border-width: 3px; width: 200px" />
	<img src="https://avatars.githubusercontent.com/u/245911?v=4" width="100" height="100" style="border-radius: 20px" />
</div></textarea>
					</div>
					<div class="input-group">
						<div class="form-group" style="margin-bottom: 0">
							<label for="width">Width:</label>
							<input type="number" id="width" name="width" value="1200" min="0" max="2000">
						</div>
						<div class="form-group" style="margin-bottom: 0">
							<label for="height">Height:</label>
							<input type="number" id="height" name="height" value="630" min="0" max="2000">
						</div>
					</div>
					<div class="form-group">
						<label>Format:</label>
						<div class="radio-group">
							<div class="radio-option">
								<input type="radio" id="format-png" name="format" value="png" checked>
								<label for="format-png" style="margin: 0; cursor: pointer">PNG</label>
							</div>
							<div class="radio-option">
								<input type="radio" id="format-svg" name="format" value="svg">
								<label for="format-svg" style="margin: 0; cursor: pointer">SVG</label>
							</div>
						</div>
					</div>
					<button type="submit" id="renderBtn">Render Image</button>
				</form>
			</div>
		</div>
		<div class="panel">
			<div class="panel-header">
				<h2>Preview</h2>
			</div>
			<div class="panel-content">
				<div id="preview" class="preview">
					<div style="color: #666; text-align: center">Enter HTML and click Render to see preview</div>
				</div>
			</div>
		</div>
	</div>
	<script>
		const form = document.getElementById('renderForm');
		const preview = document.getElementById('preview');
		const renderBtn = document.getElementById('renderBtn');

		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			renderBtn.disabled = true;
			preview.innerHTML = '<div class="loading">Rendering...</div>';

			const formData = new FormData(form);

			try {
				const response = await fetch('/render', {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error || 'Failed to render');
				}

				preview.innerHTML = \`<img src="\${result.dataUrl}" alt="Rendered image">\`;
			} catch (error) {
				preview.innerHTML = \`<div class="error">Error: \${error.message}</div>\`;
			} finally {
				renderBtn.disabled = false;
			}
		});
	</script>
</body>
</html>`;

			return new Response(htmlContent, {
				headers: { "Content-Type": "text/html" },
			});
		}

		// 404 for other routes
		return new Response("Not Found", { status: 404 });
	},
};
