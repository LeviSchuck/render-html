# Rendering examples

Run `bun run visual-review` from the repository root. It builds the package and writes PNG/SVG pairs, standalone HTML gallery pages, HTML or structured input, release links, expected visual results, and repeat-render hashes to `/tmp/render-html-visual-review`. Open `index.html` in Chrome. Use `bun run visual-review /another/output/directory` to choose another destination.

The gallery has 12 general rendering examples and 23 examples based on Satori's releases between 0.15.2 and the pinned 0.32.0. Each successfully rendered example also runs three concurrent PNG trials and verifies that their hashes match. Generating the general emoji example downloads real Twemoji assets; automated tests use a stub and run offline.

`basic-examples.ts` contains the original visual checks. `satori-features.ts` supplies the changelog cases to both the gallery generator and `satori-features.test.ts`. The latter checks raster dimensions, selected pixel colors, SVG primitives, and consistency between the PNG and SVG rendering paths.

## Release coverage

| Release | Examples |
| --- | --- |
| [0.16.0](https://github.com/vercel/satori/releases/tag/0.16.0) | Border/content box sizing, display contents, static/absolute positioning, percentage gap, align-content space-evenly |
| [0.18.0](https://github.com/vercel/satori/releases/tag/0.18.0), [0.22.0](https://github.com/vercel/satori/releases/tag/0.22.0) | Image contain, cover, fill, scale-down, including a separate no-upscaling comparison |
| [0.19.0](https://github.com/vercel/satori/releases/tag/0.19.0) | Semitransparent gradient over a colored background; transparent text with visible text shadow |
| [0.19.1](https://github.com/vercel/satori/releases/tag/0.19.1), [0.28.1](https://github.com/vercel/satori/releases/tag/0.28.1) | Underline skip-ink; rendering constructor/toString/__proto__ as text |
| [0.20.0](https://github.com/vercel/satori/releases/tag/0.20.0) | Background contain, cover, auto; percentage positioning interaction |
| [0.23.0](https://github.com/vercel/satori/releases/tag/0.23.0) | First-line and hanging text indents |
| [0.24.0](https://github.com/vercel/satori/releases/tag/0.24.0) | Image object-position left, center, right |
| [0.25.0](https://github.com/vercel/satori/releases/tag/0.25.0) | CSS variable inheritance, override and fallback using parsed HTML and structured styles |
| [0.29.0](https://github.com/vercel/satori/releases/tag/0.29.0) | Lossless WebP data URL and intrinsic aspect ratio |
| [0.30.0](https://github.com/vercel/satori/releases/tag/0.30.0) | Round, bevel, scoop, notch, squircle, superellipse and mixed corner shapes |
| [0.31.0](https://github.com/vercel/satori/releases/tag/0.31.0) | Clip-path shape() lines, percentages, curves, smooth commands and arcs |
| [0.32.0](https://github.com/vercel/satori/releases/tag/0.32.0) | Backdrop blur/grayscale and chained invert/brightness |

JSX runtime APIs and React component/fragment handling are outside these HTML-rendering fixtures. Features released after 0.32.0 are not advertised as available here.

## Observed gaps

These are current failures, not successful support checks. Their intended behavior is asserted with `test.failing`, so a future fix produces an unexpected-pass failure and prompts removal of the marker. The gallery shows errors or actual incorrect images beside a red explanation. A green test run therefore includes six expected failures.

| Example | Observed behavior |
| --- | --- |
| 17: align-content space-evenly | Satori's CSS validator rejects the value even though Yoga supports it. |
| 22: parsed HTML CSS variables | tiny-html changes `--accent` to `-Accent`; variable resolution fails. Example 33 shows that structured styles with intact names work. |
| 23: WebP | Chrome displays the embedded image in SVG, but resvg 2.6.2 omits it from PNG. |
| 28: backdrop blur/grayscale | BackgroundImage filter input produces black panels instead of filtering the scene behind them, in both Chrome's SVG viewer and resvg. |
| 29: chained backdrop filter | The output is flat gray rather than an inverted/darkened view of the scene behind the panel. |
| 35: percentage background positioning | The image shifts down/right instead of centering within the box. Example 20 uses explicit zero offsets to isolate background sizing. |

The direct-SVG example also retains the pre-existing font-viewer limitation: PNG uses the supplied font buffer, while raw SVG needs that font available in its viewer.

## Assets

`image-pattern.webp` is an original, lossless 120 × 60 red/green/blue pattern with a white circle, generated for these tests. No third-party image download is required. Font fixtures reuse the demo's existing fonts and OFL license.
