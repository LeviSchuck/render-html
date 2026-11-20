import { beforeAll, expect, test } from 'bun:test';
import { htmlNodeToHtmlElement, readHtml } from '@levischuck/tiny-html';
import { Resvg } from '@resvg/resvg-wasm';
import { initBunWasm } from '../src/bun-wasm.ts';
import { renderHtml } from '../src/render.ts';
import { featureExamples } from './fixtures/satori-features.ts';
import type { ImageResponseFont } from '../src/types.ts';

const fonts: ImageResponseFont[] = [{ name:'Roboto Mono', data:await Bun.file(new URL('../examples/react-demo/public/fonts/RobotoMono-Regular.ttf', import.meta.url)).arrayBuffer(), weight:400, style:'normal' }];
beforeAll(initBunWasm);

for (const example of featureExamples) {
  const check = example.knownIssue ? test.failing : test;
  check(`Satori ${example.since}: ${example.name}${example.knownIssue ? " [known gap]" : ""}`, async () => {
    const element = example.element ?? htmlNodeToHtmlElement(readHtml(example.html).node);
    const options = { width:480, height:240, fonts };
    const svg = await (await renderHtml(element, {...options, format:'svg'})).text();
    expect(svg).not.toMatch(/NaN|undefined/);
    for (const expected of example.svgIncludes ?? []) expect(svg).toContain(expected);
    const renderer = new Resvg(svg);
    const image = renderer.render();
    try {
      expect([image.width, image.height]).toEqual([480,240]);
      for (const {x,y,rgba} of example.samples ?? []) {
        const offset = (y * image.width + x) * 4;
        expect([...image.pixels.slice(offset, offset + 4)]).toEqual(rgba);
      }
      const png = await renderHtml(element, options);
      expect(png.type).toBe('image/png');
      // Verify the actual PNG path produces the same image as the SVG renderer.
      expect(Buffer.from(await png.arrayBuffer())).toEqual(Buffer.from(image.asPng()));
    } finally {
      image.free();
      renderer.free();
    }
  });
}
