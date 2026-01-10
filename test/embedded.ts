import { htmlNodeToHtmlElement, readHtml } from "@levischuck/tiny-html";
import { ImageResponseFont, extractFontsFromHTML, GoogleFontLoader, renderHtml } from "../src/index.ts";

let html = (await Bun.file('./embedded.svg').text());

// html = `<svg width="576px" height="144px" ...`
let width = 576;
let height = 144;

if (html.startsWith('<svg')) {
  width = parseInt(html.match(/width="(\d+)px"/)?.[1] ?? '576');
  height = parseInt(html.match(/height="(\d+)px"/)?.[1] ?? '144');
}

const {node} = await readHtml(html);
const element = htmlNodeToHtmlElement(node);
// console.log(JSON.stringify(node, null, 2));
// const reSerializedSvg = renderHtml(parsedHtml);
// console.log('original:');
// console.log(html);
// console.log('re-serialized:');
// console.log(reSerializedSvg);
// console.log('--------------------------------');
const fontsToLoad = await extractFontsFromHTML(node);

console.log('fonts to load:');
console.log(fontsToLoad);

const fonts : ImageResponseFont[] = [];
for (const font of fontsToLoad) {
  const fontData = await GoogleFontLoader.load({
    family: `${font.family}${font.italic ? ":ital" : ""}`,
    weight: font.weight
  });
  if (fontData instanceof ArrayBuffer) {
    fonts.push({
      name: font.family,
      data: fontData,
      weight: font.weight,
      style: font.italic ? "italic" : "normal",
    });
  }
}

const image = await renderHtml(element, { width, height, format: "png", fonts });

const bytes = await image.arrayBuffer();
await Bun.write('image.png', Buffer.from(bytes));

console.log(image);
