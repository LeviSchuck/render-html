import satori from "satori/wasm";

import { CustomFontsOptions, Resvg } from "@resvg/resvg-wasm";
import { loadFont } from "./font.ts";
import type { ImageResponseOptions as RenderOptions } from "./types.ts";
import { loadDynamicAsset } from "./emoji.ts";
import { initSatoriAndResvg } from "./wasm.ts";
import { writeHtml } from "@levischuck/tiny-html";
import type { HtmlElement } from "@levischuck/tiny-html";

/**
 * Render an HtmlElement into a PNG (or SVG) image.
 *
 * @param element - The HtmlElement to render
 * @param options - The options for the image response.
 * @returns A Blob containing the image data.
 * @throws Inline SVGs contain a <text> node.
 */
export async function renderHtml(element: HtmlElement, options: RenderOptions) : Promise<Blob> {
  await initSatoriAndResvg();
  const width = options.width;
  const height = options.height;

  let widthHeight:
    | { width: number; height: number }
    | { width: number }
    | { height: number } = {
    width: 1200,
    height: 630,
  };

  if (width && height) {
    widthHeight = { width, height };
  } else if (width) {
    widthHeight = { width };
  } else if (height) {
    widthHeight = { height };
  }
  let reSvgFonts: CustomFontsOptions | undefined = undefined;
  let svg: string | null = null;
  if (element.type === "svg") {
    if (typeof element === "string") {
      svg = element;
      reSvgFonts = {
        fontBuffers: options.fonts?.map((font) => new Uint8Array(font.data)) ?? []
      }
    } else {
      svg = writeHtml(element, {
				xml: '<?xml version="1.0" encoding="UTF-8"?>',
				useCDataForStyles: true,
			});
      reSvgFonts = {
        fontBuffers: options.fonts?.map((font) => new Uint8Array(font.data)) ?? []
      }
    }
  } else {
    try {
      svg = await satori(element as unknown as Parameters<typeof satori>[0], {
        ...widthHeight,
        fonts: !!options?.fonts?.length
          ? options.fonts
          : [
            {
              name: "Bitter",
              data: (await loadFont({family: "Bitter", weight: 600}, { fontCache: options.fontCache })).data,
              weight: 500,
              style: "normal",
            },
          ],
        loadAdditionalAsset: options.emoji
          ? loadDynamicAsset({
            emoji: options.emoji,
          })
          : undefined,
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes("<text> nodes are not currently supported")) {
        throw new Error("Inline SVGs with <text> nodes are not supported in HTML. Try passing an SVG directly");
      }
      throw err;
    }
  }

  const format = options?.format || "png";

  if (format === "svg") {
    return new Blob([svg], { type: "image/svg+xml" });
  }

  if (svg === null || svg === undefined || svg.length === 0) {
    throw new Error('SVG appears empty');
  }

  // 4. Convert the SVG into a PNG
  const resvg = new Resvg(svg, {
    fitTo:
      "width" in widthHeight
        ? {
          mode: "width" as const,
          value: widthHeight.width,
        }
        : {
          mode: "height" as const,
          value: widthHeight.height,
        },
    font: reSvgFonts
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng() as Uint8Array<ArrayBuffer>;

  return new Blob([pngBuffer.buffer], { type: "image/png" });
};
