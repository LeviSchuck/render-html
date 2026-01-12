import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  loader: {
    ".wasm": "copy",
  },
  minify: true,
  plugins: [dtsPlugin()],
  external: [
    "satori",
    "satori/wasm",
    "yoga-wasm-web",
    "@resvg/resvg-wasm",
    "@levischuck/tiny-html",
  ],
  define: {
    "process.versions.bun": "false",
  }
}).catch((e) => {
	console.error(e);
	process.exit(1);
});
