# Workers Demo

A Cloudflare Workers demo for `@levischuck/render-html` that demonstrates server-side HTML to image rendering.

## Features

- Left/right split layout with HTML input form and image preview
- Supports both PNG and SVG output formats
- Real-time rendering via POST requests
- Uses `worker-wasm` for WebAssembly initialization

## Setup

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Start the development server:
```bash
npm run dev
# or
bun run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:8787`)

## Usage

1. Enter HTML content in the left panel
2. Adjust width and height as needed
3. Select PNG or SVG format
4. Click "Render Image" to see the result in the right panel

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
# or
bun run deploy
```
