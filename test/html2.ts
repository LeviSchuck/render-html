import { htmlNodeToHtmlElement, readHtml } from "@levischuck/tiny-html";
import { extractFontsFromHTML, renderHtml, loadFonts } from "../src/index.ts";
import { initBunWasm } from "../src/bun-wasm.ts";
await initBunWasm();

const {node} = readHtml(`<div style="font-family: 'Sour Gummy'; display: flex; flex-direction: column; width: 100vw; align-items: center; justify-content: center; background-color: #160f29; color: white; font-size: 60px; font-weight: 600; margin: 0; padding: 40px">Hello 🌎<hr style="border-color: white; border-width: 3px; width: 200px" /><img src="https://avatars.githubusercontent.com/u/245911?v=4" width="100" height="100" style="border-radius: 20px" /></div>`);
const element = htmlNodeToHtmlElement(node);

const width = 600;

const fontsToLoad = await extractFontsFromHTML(element);
const fonts = await loadFonts(fontsToLoad);
const image = await renderHtml(element, { width, fonts, emoji: 'twemoji' });

const bytes = await image.arrayBuffer();
await Bun.write('image.png', Buffer.from(bytes));

