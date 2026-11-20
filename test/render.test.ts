import { beforeAll, expect, spyOn, test } from "bun:test";
import { htmlNodeToHtmlElement, readHtml } from "@levischuck/tiny-html";
import { Resvg } from "@resvg/resvg-wasm";
import { renderHtml } from "../src/render.ts";
import { initBunWasm } from "../src/bun-wasm.ts";

const fonts = [{
  name: "Roboto Mono",
  data: await Bun.file(new URL("../examples/react-demo/public/fonts/RobotoMono-Regular.ttf", import.meta.url)).arrayBuffer(),
  weight: 400 as const,
  style: "normal" as const,
}];
const element = (html: string) => htmlNodeToHtmlElement(readHtml(html).node);

beforeAll(async () => {
  await Promise.all([initBunWasm(), initBunWasm()]);
  await initBunWasm();
});

async function pngDimensions(blob: Blob) {
  expect(blob.type).toBe("image/png");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(bytes.length).toBeGreaterThan(100);
  const view = new DataView(bytes.buffer);
  return [view.getUint32(16), view.getUint32(20)];
}

test("renders parsed HTML, embedded fonts and flex layout to SVG and PNG", async () => {
  const html = element('<div style="display:flex;width:320px;height:160px;background:#160f29;color:white;font-family:Roboto Mono;font-size:24px;align-items:center;justify-content:center">Hello World</div>');
  const svg = await renderHtml(html, { width: 320, height: 160, fonts, format: "svg" });
  expect(svg.type).toBe("image/svg+xml");
  const text = await svg.text();
  expect(text).toContain('<svg');
  expect(text).toContain('width="320"');
  expect(text).toContain('height="160"');
  expect(text).toContain('<path');
  expect(text).not.toMatch(/NaN|undefined/);
  expect(await pngDimensions(await renderHtml(html, { width: 320, height: 160, fonts }))).toEqual([320, 160]);
});

test("preserves flex positioning and background colors in rasterized output", async () => {
  const html = element('<div style="display:flex;width:100px;height:50px;background:#ff0000;justify-content:flex-end"><div style="display:flex;width:40px;height:50px;background:#0000ff"></div></div>');
  const svg = await renderHtml(html, { width: 100, height: 50, fonts, format: "svg" });
  const renderer = new Resvg(await svg.text());
  const image = renderer.render();
  const pixel = (x: number, y: number) => [...image.pixels.slice((y * image.width + x) * 4, (y * image.width + x) * 4 + 4)];
  expect(pixel(10, 25)).toEqual([255, 0, 0, 255]);
  expect(pixel(90, 25)).toEqual([0, 0, 255, 255]);
  image.free();
  renderer.free();
});

test("supports width-only and height-only sizing", async () => {
  const html = element('<div style="display:flex;width:200px;height:80px;background:red">Size</div>');
  expect(await pngDimensions(await renderHtml(html, { width: 200, fonts }))).toEqual([200, 80]);
  expect(await pngDimensions(await renderHtml(html, { height: 80, fonts }))).toEqual([200, 80]);
});

test("keeps the default 1200 by 630 output size", async () => {
  expect(await pngDimensions(await renderHtml(element('<div style="display:flex;background:red">Default</div>'), { fonts }))).toEqual([1200, 630]);
});

test("renders gradients, rounded borders and embedded SVG images", async () => {
  const html = element('<div style="display:flex;width:200px;height:100px;border-radius:12px;border:2px solid black;background:linear-gradient(90deg,red,blue)"><svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="green" /></svg></div>');
  expect(await pngDimensions(await renderHtml(html, { width: 200, height: 100, fonts }))).toEqual([200, 100]);
});

test("renders direct SVG with text using supplied font buffers", async () => {
  const html = element('<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="100" fill="white"/><text x="10" y="50" font-family="Roboto Mono" font-size="24">SVG text</text></svg>');
  const svg = await renderHtml(html, { width: 200, height: 100, fonts, format: "svg" });
  expect(await svg.text()).toContain('SVG text');
  expect(await pngDimensions(await renderHtml(html, { width: 200, height: 100, fonts }))).toEqual([200, 100]);
});

test("renders multiple requests after repeated initialization", async () => {
  const html = element('<div style="display:flex;background:green">Concurrent</div>');
  const images = await Promise.all(Array.from({ length: 4 }, () => renderHtml(html, { width: 240, height: 100, fonts })));
  for (const image of images) expect(await pngDimensions(image)).toEqual([240, 100]);
});

test("loads emoji assets and embeds them in rendered output", async () => {
  const fetchAsset = spyOn(globalThis, "fetch").mockImplementation(Object.assign(async () => new Response('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="12" fill="gold"/></svg>', { headers: { "Content-Type": "image/svg+xml" } }), { preconnect: fetch.preconnect }));
  try {
    const html = element('<div style="display:flex;font-size:24px">Hello 🌎</div>');
    const svg = await renderHtml(html, { width: 240, height: 80, fonts, emoji: "twemoji", format: "svg" });
    expect(fetchAsset).toHaveBeenCalled();
    expect(String(fetchAsset.mock.calls[0]?.[0])).toContain('/1f30e.svg');
    expect(await svg.text()).toContain('data:image/svg+xml;base64,');
    expect(await pngDimensions(await renderHtml(html, { width: 240, height: 80, fonts, emoji: "twemoji" }))).toEqual([240, 80]);
  } finally {
    fetchAsset.mockRestore();
  }
});
