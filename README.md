# render-html

## Usage

## API

## Types

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
