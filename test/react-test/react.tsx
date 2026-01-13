// @ts-nocheck
import React from "react";
import { extractFontsFromHTML, renderHtml, loadFonts } from "../../src/index.ts";
import { initBunWasm } from "../../src/bun-wasm.ts";
await initBunWasm();

const element = <div style={{
	fontFamily: "'Sour Gummy'",
	display: 'flex',
	flexDirection: 'column',
	width: '100vw',
	height: '100vh',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: '#160f29',
	color: 'white',
	fontSize: '60px',
	fontWeight: '600',
	margin: '0',
	padding: '40px' }}>
	Hello 🌎
	<hr style={{
		borderColor: 'white',
		borderWidth: '3px',
		width: '200px'
		}} />
	<img src="https://avatars.githubusercontent.com/u/245911?v=4" width={100} height={100} style={{ borderRadius: '20px' }} />
</div>;

const width = 1200;
const height = 630;

const fontsToLoad = await extractFontsFromHTML(element);
const fonts = await loadFonts(fontsToLoad);
const image = await renderHtml(element, { width, height, format: "png", fonts, emoji: 'twemoji' });

const bytes = await image.arrayBuffer();
await Bun.write('image.png', Buffer.from(bytes));

