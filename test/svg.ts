import { htmlNodeToHtmlElement, readHtml } from "@levischuck/tiny-html";
import { extractFontsFromHTML, renderHtml, loadFonts } from "../src/index.ts";

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="white" />
  <text x="600"y="315" font-family="'Sour Gummy'" font-size="80" text-anchor="middle" dominant-baseline="middle" fill="black">
  Hello World
  </text>
  <line x1="400" y1="380" x2="800" y2="380" stroke="black" stroke-width="4" />
</svg>`;

const {node} = readHtml(svg);
const element = htmlNodeToHtmlElement(node);

const width = 1200;
const height = 630;

const fontsToLoad = await extractFontsFromHTML(element);
const fonts = await loadFonts(fontsToLoad);
const image = await renderHtml(element, { width, height, format: "png", fonts, emoji: 'twemoji' });

const bytes = await image.arrayBuffer();
await Bun.write('image.png', Buffer.from(bytes));
