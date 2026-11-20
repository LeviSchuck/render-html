# Changelog

## [0.2.0](https://github.com/LeviSchuck/render-html/compare/render-html-v0.1.2...render-html-v0.2.0) (2026-11-20)


### Features

* allow either width or height to be undefined, or both undefined with fallback ([9765e96](https://github.com/LeviSchuck/render-html/commit/9765e9670a40f38ded40cd066457d069c7d2b762))
* allow jsx use + improvements ([0e71b13](https://github.com/LeviSchuck/render-html/commit/0e71b13941aa7ba92067cba830aba7eca6bb972f))
* split worker workers-og with perf improvements ([cd3bd13](https://github.com/LeviSchuck/render-html/commit/cd3bd1348462b1f78e4339e79d588d8efcad6320))


### Bug Fixes

* add proper handling of urls inside style tag" ([6effa32](https://github.com/LeviSchuck/render-html/commit/6effa326fb10209e72523806ff2d45032ddfd365))
* add type declaration to dist ([a4d0a8b](https://github.com/LeviSchuck/render-html/commit/a4d0a8b405ce26e9caad384f635bae8c7c3e5882))
* downgrade Resvg wasm for size consideration ([9e3ff84](https://github.com/LeviSchuck/render-html/commit/9e3ff8459a5c86baeec5cc3649081d401155974d))
* error caused by wasm initializations ([3aac769](https://github.com/LeviSchuck/render-html/commit/3aac7691579cf584f8d8d229b191e0a1278eaa75))
* pin version and add proper support for emojis ([e04ef63](https://github.com/LeviSchuck/render-html/commit/e04ef63ea5574758a8079b141b48a4f56c3e3ddc))
* preserve image dimensions when rendering parsed HTML ([e2e33b8](https://github.com/LeviSchuck/render-html/commit/e2e33b8ef5c3605fc5ea569ac27b35a955b2fb5c))
* remove unnecessary escaping ([9866f9b](https://github.com/LeviSchuck/render-html/commit/9866f9b2c1722252757cb464fa8f133c419b3a56))
* Traverse all children when looking for fonts ([4277d1b](https://github.com/LeviSchuck/render-html/commit/4277d1b9aa32f66252eb7bf5aa0fbc1947175ecd))
* type check visual review without generated build files ([789a92b](https://github.com/LeviSchuck/render-html/commit/789a92b63a8610df285475e4b1ecc3d62c47193d))
* update wasm files ([d77cdf2](https://github.com/LeviSchuck/render-html/commit/d77cdf29b0abac71b150a1e191e5cdc7c762054e))
* use esbuild ([34addf6](https://github.com/LeviSchuck/render-html/commit/34addf6e77f073d151cba1a1872d5bcad2e4714c))

## [0.1.2](https://github.com/LeviSchuck/render-html/compare/render-html-v0.1.1...render-html-v0.1.2) (2026-11-20)


### Bug Fixes

* preserve image dimensions when rendering parsed HTML ([e2e33b8](https://github.com/LeviSchuck/render-html/commit/e2e33b8ef5c3605fc5ea569ac27b35a955b2fb5c))
* type check visual review without generated build files ([789a92b](https://github.com/LeviSchuck/render-html/commit/789a92b63a8610df285475e4b1ecc3d62c47193d))

### Dependencies and runtime support

* Update `@levischuck/tiny-html` to `^0.1.4` and Satori to `^0.32.0`.
* Use Satori's standalone WASM interface across Bun, browsers, and Cloudflare Workers; synchronize the bundled Yoga binary and report initialization errors.
* Retain resvg `2.6.2`, the latest stable release checked for this update. Satori `0.63.2` was tested but is incompatible with Cloudflare Workers because of its HarfBuzz loader.

### Verification and known limitations

* Add 35 reproducible visual examples and automated rendering checks. Validation includes a clean-checkout type check/build, 26 ordinary passing tests, six expected-failure tests, manual PNG/SVG visual review, and Bun/browser/local Worker rendering trials.
* Six feature examples remain known failures: `align-content: space-evenly`, CSS variables after parsed-HTML conversion, WebP-to-PNG, two backdrop-filter cases, and percentage background positioning. These limitations are explicitly labeled rather than treated as working support.
* Direct SVG text still depends on fonts available in the viewer; supplied font buffers are used for PNG output.
* See the [rendering fixture guide](https://github.com/LeviSchuck/render-html/blob/main/test/fixtures/README.md) for release coverage, reproduction steps, and limitations.


## [0.1.1](https://github.com/LeviSchuck/render-html/compare/render-html-v0.1.0...render-html-v0.1.1) (2026-01-15)


### Bug Fixes

* Traverse all children when looking for fonts ([4277d1b](https://github.com/LeviSchuck/render-html/commit/4277d1b9aa32f66252eb7bf5aa0fbc1947175ecd))

## [0.1.0](https://github.com/LeviSchuck/render-html/compare/render-html-v0.0.1...render-html-v0.1.0) (2026-01-13)


### Features

* allow either width or height to be undefined, or both undefined with fallback ([9765e96](https://github.com/LeviSchuck/render-html/commit/9765e9670a40f38ded40cd066457d069c7d2b762))
* allow jsx use + improvements ([0e71b13](https://github.com/LeviSchuck/render-html/commit/0e71b13941aa7ba92067cba830aba7eca6bb972f))
* split worker workers-og with perf improvements ([cd3bd13](https://github.com/LeviSchuck/render-html/commit/cd3bd1348462b1f78e4339e79d588d8efcad6320))


### Bug Fixes

* add proper handling of urls inside style tag" ([6effa32](https://github.com/LeviSchuck/render-html/commit/6effa326fb10209e72523806ff2d45032ddfd365))
* add type declaration to dist ([a4d0a8b](https://github.com/LeviSchuck/render-html/commit/a4d0a8b405ce26e9caad384f635bae8c7c3e5882))
* downgrade Resvg wasm for size consideration ([9e3ff84](https://github.com/LeviSchuck/render-html/commit/9e3ff8459a5c86baeec5cc3649081d401155974d))
* error caused by wasm initializations ([3aac769](https://github.com/LeviSchuck/render-html/commit/3aac7691579cf584f8d8d229b191e0a1278eaa75))
* pin version and add proper support for emojis ([e04ef63](https://github.com/LeviSchuck/render-html/commit/e04ef63ea5574758a8079b141b48a4f56c3e3ddc))
* remove unnecessary escaping ([9866f9b](https://github.com/LeviSchuck/render-html/commit/9866f9b2c1722252757cb464fa8f133c419b3a56))
* update wasm files ([d77cdf2](https://github.com/LeviSchuck/render-html/commit/d77cdf29b0abac71b150a1e191e5cdc7c762054e))
* use esbuild ([34addf6](https://github.com/LeviSchuck/render-html/commit/34addf6e77f073d151cba1a1872d5bcad2e4714c))
