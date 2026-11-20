import { initWasm } from "@resvg/resvg-wasm";
import { init } from "satori/standalone";

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
      await init(yogaWasm as WebAssembly.Module);
      yogaInitialized = true;
    })().catch((err) => {
      yogaInitPromise = null;
      throw err;
    });
  }

  return yogaInitPromise;
};


export async function initWokererWasm() : Promise<void> {
	await Promise.all([initResvgWasm(), initYogaWasm()]);
}
