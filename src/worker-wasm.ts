import initYoga from "yoga-wasm-web";
import { initWasm } from "@resvg/resvg-wasm";
import { init } from "satori/wasm";

// @ts-expect-error .wasm files are not typed
import yogaWasm from "../vendors/yoga.wasm";
// @ts-expect-error .wasm files are not typed
import resvgWasm from "../vendors/resvg.wasm";

let resvgInitialized = false;
let resvgInitPromise: Promise<void> | null = null;
const initResvgWasm = async () => {
  if (resvgInitialized) {
    return;
  }

  if (!resvgInitPromise) {
    resvgInitPromise = (async () => {
      try {
        await initWasm(resvgWasm as WebAssembly.Module);
        resvgInitialized = true;
      } catch (err) {
        if (err instanceof Error && err.message.includes("Already initialized")) {
          resvgInitialized = true;
          return;
        }

        resvgInitPromise = null;
        throw err;
      }
    })();
  }

  return resvgInitPromise;
};

let yogaInitialized = false;
let yogaInitPromise: Promise<void> | null = null;

const initYogaWasm = async () => {
  if (yogaInitialized) {
    return;
  }

  if (!yogaInitPromise) {
    yogaInitPromise = (async () => {
      // Future TODO: https://github.com/vercel/satori/issues/693
      // Upgrade to latest satori standalone once they have working wasm init on cloudflare workers
      // Also... For some reason the yoga wasm bundle from https://unpkg.com/satori/yoga.wasm seems
      // incompatible with bun and doesn't parse on https://wa2.dev/metadata
      // error: WebAssembly.Module doesn't parse at byte 13: Type section of size 7299055 would overflow Module's size).
      // Their vendored wasm is likely corrupt or wrapped in some way.
      // How have they not noticed this?
      const yoga = await initYoga(yogaWasm);
      init(yoga);
      yogaInitialized = true;
    })().catch((err) => {
      yogaInitPromise = null;
      throw err;
    });
  }

  return yogaInitPromise;
};


export async function initWokererWasm() : Promise<void> {
	await Promise.allSettled([initResvgWasm(), initYogaWasm()]);
}
