import { HtmlElement } from "@levischuck/tiny-html";
import { ImageResponseFont, extractFontsFromHTML, GoogleFontLoader, renderHtml } from "../src/index.ts";

const element: HtmlElement = {
	type: 'div',
	props: {
		style: {
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
			padding: '40px',
		},
		children: [
			"Hello 🌎",
			{
				type: 'hr',
				props: {
					style: {
						borderColor: 'white',
						borderWidth: '3px',
						width: '200px',
					}
				}
			},
			{
				type: 'img',
				props: {
					src: 'https://avatars.githubusercontent.com/u/245911?v=4',
					width: 100,
					height: 100,
					style: {
						borderRadius: '20px',
					}
				}
			}
		]
	}
}

// html = `<svg width="576px" height="144px" ...`
let width = 1200;
let height = 630;

// console.log(JSON.stringify(node, null, 2));
// const reSerializedSvg = renderHtml(parsedHtml);
// console.log('original:');
// console.log(html);
// console.log('re-serialized:');
// console.log(reSerializedSvg);
// console.log('--------------------------------');
const fontsToLoad = await extractFontsFromHTML(element);

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

const image = await renderHtml(element, { width, height, format: "png", fonts, emoji: 'twemoji' });

const bytes = await image.arrayBuffer();
await Bun.write('image.png', Buffer.from(bytes));

console.log(image);
