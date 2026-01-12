# render-html

Render HTML elements (from `@levischuck/tiny-html`) to PNG or SVG images. Perfect for generating Open Graph images, social media previews, and dynamic images in Cloudflare Workers and browser web workers.

Based on the work from [https://github.com/kvnang](Kevin Ang) and [https://vercel.com/docs/og-image-generation](Vercel Open Graph (OG) Image Generation).

## Usage

### Basic Example

The following example shows different ways to create an HTML element and render it to an image. The `format` option can be `"png"` or `"svg"`.

```typescript
import { HtmlElement, htmlNodeToHtmlElement, readHtml } from "@levischuck/tiny-html";
import { extractFontsFromHTML, renderHtml, loadFonts } from "@levischuck/render-html";

// Choose your input method:
const example = 'html_element'; // 'html_element' | 'html_string' | 'react_jsx' | 'svg'

let element: HtmlElement;

if (example === 'html_element') {
  // Option 1: Create HtmlElement directly
  element = {
    type: 'div',
    props: {
      style: {
        fontFamily: "'Sour Gummy'",
        display: 'flex',
        flexDirection: 'column',
        width: '100%', // Use percentage instead of vw when width is provided
        height: '100%', // Use percentage instead of vh when height is provided
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#160f29',
        color: 'white',
        fontSize: '60px',
        fontWeight: '600',
        padding: '40px',
      },
      children: [
        "Hello 🌎",
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
  };
} else if (example === 'html_string') {
  // Option 2: Parse HTML string
  const htmlString = `<div style="font-family: 'Sour Gummy'; display: flex; flex-direction: column; width: 100%; height: 100%; align-items: center; justify-content: center; background-color: #160f29; color: white; font-size: 60px; font-weight: 600; padding: 40px">
    Hello 🌎
    <img src="https://avatars.githubusercontent.com/u/245911?v=4" width="100" height="100" style="border-radius: 20px" />
  </div>`;
  const { node } = readHtml(htmlString);
  element = htmlNodeToHtmlElement(node);
} else if (example === 'react_jsx') {
  // Option 3: Use React JSX (works with React-like JSX implementations)
  import React from "react";
  element = <div style={{
    fontFamily: "'Sour Gummy'",
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#160f29',
    color: 'white',
    fontSize: '60px',
    fontWeight: '600',
    padding: '40px'
  }}>
    Hello 🌎
    <img src="https://avatars.githubusercontent.com/u/245911?v=4" width={100} height={100} style={{ borderRadius: '20px' }} />
  </div>;
} else if (example === 'svg') {
  // Option 4: Render SVG directly (bypasses satori)
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="white" />
    <text x="600" y="315" font-family="'Sour Gummy'" font-size="80" text-anchor="middle" dominant-baseline="middle" fill="black">
      Hello World
    </text>
  </svg>`;
  const { node } = readHtml(svg);
  element = htmlNodeToHtmlElement(node);
}

// Common rendering code for all input methods:

// Extract fonts from the HTML element
const fontsToLoad = await extractFontsFromHTML(element);

// Load the fonts (defaults to Google Fonts)
const fonts = await loadFonts(fontsToLoad);

// Render to PNG or SVG
// Format can be "png" (default) or "svg"
// At least width or height (or both) must be provided
const image = await renderHtml(element, {
  width: 1200,  // Required if height is not provided
  height: 630,  // Required if width is not provided
  format: "png", // "png" or "svg"
  fonts,
  emoji: 'twemoji' // Optional: "twemoji" | "openmoji" | "blobmoji" | "noto" | "fluent" | "fluentFlat"
});

// Save or use the image
const bytes = await image.arrayBuffer();
await Bun.write('image.png', Buffer.from(bytes));
```

### Using with Custom Font Cache

```typescript
import { renderHtml, loadFonts, extractFontsFromHTML } from "@levischuck/render-html";
import type { FontCache } from "@levischuck/render-html";

const fontCache: FontCache = {
  async get(params) {
    // Check your cache (e.g., Cloudflare KV, Redis, etc.)
    const cached = await cache.get(`font:${params.family}:${params.weight}`);
    return cached ? new Uint8Array(cached).buffer : undefined;
  },
  async put(params, data) {
    // Store in your cache
    await cache.put(`font:${params.family}:${params.weight}`, data);
  },
  async tombstone(params) {
    // Mark as not found to avoid retrying
    await cache.put(`font:${params.family}:${params.weight}:tombstone`, 'tombstone');
  }
};

const fontsToLoad = await extractFontsFromHTML(element);
const fonts = await loadFonts(fontsToLoad, { fontCache });
const image = await renderHtml(element, {
  width: 1200,
  height: 630,
  fonts,
  fontCache
});
```

## API

### `renderHtml(element, options)`

Renders an `HtmlElement` (from `@levischuck/tiny-html`) into a PNG or SVG image.

**Parameters:**
- `element: HtmlElement` - The HTML element to render
- `options: ImageResponseOptions` - Rendering options (see Types section)
  - `format?: "png" | "svg"` - Output format. Defaults to `"png"`.
  - `width?: number` - Image width in pixels. Required if `height` is not provided. Defaults to 1200 if neither is provided.
  - `height?: number` - Image height in pixels. Required if `width` is not provided. Defaults to 630 if neither is provided.
  - **Important:** At least `width` or `height` (or both) must be provided. When one dimension is missing, avoid using `vw` or `vh` units in your styles as they won't work correctly.

**Returns:** `Promise<Blob>` - A Blob containing the image data (PNG or SVG)

**Example:**
```typescript
// Render PNG with both dimensions
const image = await renderHtml(element, {
  width: 1200,
  height: 630,
  format: "png",
  fonts: loadedFonts,
  emoji: 'twemoji'
});

// Render SVG with only width (height will be calculated)
const svgImage = await renderHtml(element, {
  width: 1200,
  format: "svg",
  fonts: loadedFonts
});
```

**Warnings:** You must provide at least `width` or `height` (or both).
When `width` or `height` is missing, using `vw` or `vh` units in your styles will not work well and should be avoided.
If you have `<html>` with an `<svg>` inside, it will not correctly support `<text>` sections. Consider rendering the svg first to a png and inlining it with a data url.

### `extractFontsFromHTML(root)`

Extracts all font families, weights, and italic styles from an HTML element by traversing the DOM tree and parsing inline styles.

**Parameters:**
- `root: HtmlNode` - The root HTML node to extract fonts from

**Returns:** `FontFamily[]` - Array of font families found in the HTML

**Example:**
```typescript
const fontsToLoad = await extractFontsFromHTML(element);
```

### `extractFontsFromHTMLWithRanges(parsedHtml, ranges)`

Combines fonts extracted from HTML styles with fonts detected from Unicode ranges. Automatically scans all Unicode ranges defined in the font mapping.

**Parameters:**
- `parsedHtml: HtmlNode` - The parsed HTML node
- `ranges: UnicodeRangeToFontFamilies` - Unicode range to font family mappings

**Returns:** `FontFamily[]` - Combined array of fonts

### `loadFont(family, options?)`

Loads a single font family. Uses Google Fonts by default, but can use custom font loaders and caching.

**Parameters:**
- `family: FontFamily` - The font family to load
- `options?: LoadFontOptions` - Font loading options (see Types section)

**Returns:** `Promise<LoadedFontFamily>` - The loaded font data

**Throws:** Error if font cannot be loaded

**Example:**
```typescript
const font = await loadFont({ family: "Inter", weight: 600 });
```

### `loadFonts(families, options?)`

Loads multiple font families in parallel.

**Parameters:**
- `families: FontFamily[]` - Array of font families to load
- `options?: LoadFontsOptions` - Font loading options (see Types section)

**Returns:** `Promise<LoadedFontFamily[]>` - Array of loaded fonts

**Example:**
```typescript
const fonts = await loadFonts(fontsToLoad, {
  fontCache: myCache,
  throwOnError: false // Don't throw on individual font failures
});
```

### `loadFont` (from `font.ts`)

**Note:** This is the internal implementation. Use `loadFont` from the main export instead.

### `GoogleFontLoader`

Default font loader that fetches fonts from Google Fonts API. Used automatically if no custom loaders are provided.

**Type:** `FontLoader`

## Types

### `ImageResponseOptions`

Options for rendering HTML to images.

```typescript
type ImageResponseOptions = {
  /**
   * The format of the image. Can be "png" or "svg".
   * @default "png"
   */
  format?: "svg" | "png" | undefined;

  /**
   * The width of the image in pixels.
   * At least width or height (or both) must be provided.
   * If neither width nor height is provided, the default is 1200.
   * When height is missing, avoid using vw units in your styles.
   */
  width?: number;

  /**
   * The height of the image in pixels.
   * At least width or height (or both) must be provided.
   * If neither width nor height is provided, the default is 630.
   * When width is missing, avoid using vh units in your styles.
   */
  height?: number;

  /**
   * Array of loaded fonts to use for rendering.
   */
  fonts?: ImageResponseFont[];

  /**
   * Emoji style to use. Options: "twemoji", "openmoji", "blobmoji", "noto", "fluent", "fluentFlat"
   */
  emoji?: EmojiType;

  /**
   * Optional font cache for caching loaded fonts.
   */
  fontCache?: FontCache;

  /**
   * Custom HTTP headers for the response.
   */
  headers?: Record<string, string>;

  /**
   * HTTP status code for the response.
   */
  status?: number;

  /**
   * HTTP status text for the response.
   */
  statusText?: string;

  /**
   * Enable debug mode.
   */
  debug?: boolean;
};
```

### `ImageResponseFont`

Font data structure for rendering.

```typescript
type ImageResponseFont = {
  name: string;
  data: ArrayBuffer;
  weight?: FontWeight; // 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style?: FontStyle;   // "normal" | "italic"
}
```

### `FontFamily`

Font family specification for loading fonts.

```typescript
type FontFamily = {
  family: string;
  italic?: boolean;
  weight?: FontWeight; // 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
}
```

### `LoadedFontFamily`

Font data after loading.

```typescript
interface LoadedFontFamily {
  data: ArrayBuffer;
  name: string;
  weight?: FontWeight;
  style?: FontStyle;
  lang?: string;
}
```

### `FontCache`

Interface for caching fonts to avoid repeated loading.

```typescript
type FontCache = {
  get(params: { family: string; weight?: number; text?: string }): Promise<ArrayBuffer | 'tombstone' | undefined>;
  put(params: { family: string; weight?: number; text?: string }, data: ArrayBuffer): Promise<void>;
  tombstone?(params: { family: string; weight?: number; text?: string }): Promise<void>;
};
```

**Methods:**
- `get()` - Retrieve cached font data. Returns `undefined` if not cached, `'tombstone'` if font is known to not exist.
- `put()` - Store font data in cache.
- `tombstone()` - Mark a font as not found to avoid retrying.

### `FontLoader`

Interface for custom font loaders.

```typescript
interface FontLoader {
  load(params: {
    family: string;
    weight?: number;
    text?: string;
  }): Promise<ArrayBuffer | typeof FontNotFound | typeof FontError>;
}
```

**Return values:**
- `ArrayBuffer` - Successfully loaded font data
- `FontNotFound` - Font doesn't exist in this loader (try next loader)
- `FontError` - Transient error occurred (retry)

### `LoadFontOptions`

Options for loading a single font.

```typescript
interface LoadFontOptions {
  fontCache?: FontCache;
  fontLoaders?: FontLoader[];
}
```

### `LoadFontsOptions`

Options for loading multiple fonts.

```typescript
interface LoadFontsOptions extends LoadFontOptions {
  throwOnError?: boolean; // Default: true
}
```

### `EmojiType`

Supported emoji styles.

```typescript
type EmojiType =
  | "twemoji"
  | "openmoji"
  | "blobmoji"
  | "noto"
  | "fluent"
  | "fluentFlat";
```

### `UnicodeRangeToFontFamily`

Mapping of Unicode ranges to font families.

```typescript
type UnicodeRangeToFontFamily = {
  ranges: string[];
  family: string;
}
```

### `UnicodeRangeToFontFamilies`

Array of Unicode range to font family mappings.

```typescript
type UnicodeRangeToFontFamilies = UnicodeRangeToFontFamily[];
```

### `FontWeight`

Font weight values (from satori).

```typescript
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
```

### `FontStyle`

Font style values (from satori).

```typescript
type FontStyle = "normal" | "italic";
```

## Why use this?

[workers-og](https://github.com/kvnang/workers-og) is unmaintained and cannot render [receiptline](https://github.com/LeviSchuck/receiptline) SVGs.
This one can 🙂.

Also, it would be nice if I could render complex images with markup on Cloudflare workers and in web workers on browsers.
This package allows me to do that.

## License

MIT Licensed

(This is a fork of https://github.com/kvnang/workers-og/tree/main, which appears unmaintained)

This project uses [satori](https://github.com/vercel/satori) (MPL Licensed) to render HTML to SVG using the [Yoga Layout Engine](https://www.yogalayout.dev/) (MIT licensed).
SVGs are rendered to PNG with [resvg-js](https://github.com/thx/resvg-js) (MPL licensed) and [resvg](https://github.com/linebender/resvg) (MIT & Apache 2 licensed)
