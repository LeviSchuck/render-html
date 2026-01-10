import { GoogleFontLoader } from "./googleFont.ts";
import { FontFamily, FontWeight, LoadedFontFamily, FontLoader, LoadFontOptions, LoadFontsOptions, FontNotFound, FontError } from "./types.ts";

const Weights: FontWeight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const fonts: LoadedFontFamily[] = [];

export function toNearestWeight(weight: number): FontWeight {
  const closest = Weights.reduce((prev, curr) => {
    return (Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev);
  }, Weights[0]);
  return closest;
}

async function retryWithBackoff(
  loader: FontLoader,
  params: { family: string; weight?: number; text?: string },
  maxRetries: number = 3
): Promise<ArrayBuffer | typeof FontNotFound | typeof FontError> {
  const delays = [100, 200, 400]; // Exponential backoff delays in ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await loader.load(params);

    if (result instanceof ArrayBuffer) {
      return result;
    }

    if (result === FontNotFound) {
      // Don't retry for FontNotFound
      return FontNotFound;
    }

    // FontError - retry with backoff
    if (attempt < maxRetries - 1) {
      const delay = delays[attempt] || delays[delays.length - 1];
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return FontError;
}

export async function loadFont(family: FontFamily, options?: LoadFontOptions): Promise<LoadedFontFamily> {
  const foundFont = fonts.find(f => f.name === family.family && f.weight === toNearestWeight(family.weight || 400));
  if (foundFont) {
    // Already loaded
    return foundFont;
  }

  const fontCache = options?.fontCache;
  const fontLoaders = options?.fontLoaders ?? [GoogleFontLoader];

  const cacheParams = {
    family: `${family.family}${family.italic ? ":ital" : ""}`,
    weight: family.weight,
  };

  // Check cache first
  if (fontCache) {
    const cached = await fontCache.get(cacheParams);
    if (cached === 'tombstone') {
      throw new Error(`The requested font family ${cacheParams.family} (with weight ${cacheParams.weight} & style ${family.italic ? "italic" : "normal"}) is not available`);
    }
    if (cached) {
      const font: LoadedFontFamily = {
        name: family.family,
        data: cached,
        style: family.italic ? "italic" : "normal",
        weight: toNearestWeight(family.weight || 400),
      };
      fonts.push(font);
      return font;
    }
  }

  // Try each loader sequentially
  for (const loader of fontLoaders) {
    const result = await retryWithBackoff(loader, cacheParams);

    if (result instanceof ArrayBuffer) {
      // Success - save to cache and return
      if (fontCache) {
        await fontCache.put(cacheParams, result);
      }
      const font: LoadedFontFamily = {
        name: family.family,
        data: result,
        style: family.italic ? "italic" : "normal",
        weight: toNearestWeight(family.weight || 400),
      };
      fonts.push(font);
      return font;
    }

    if (result === FontNotFound) {
      // This loader doesn't have it, try next loader
      continue;
    }

    // FontError - try next loader
    continue;
  }

  // All loaders exhausted
  if (fontCache?.tombstone) {
    await fontCache.tombstone(cacheParams);
  }
  throw new Error("Failed to load font: all font loaders exhausted");
}

export async function loadFonts(families: FontFamily[], options?: LoadFontsOptions): Promise<LoadedFontFamily[]> {
  const throwOnError = options?.throwOnError ?? true;

  const loadedFonts = await Promise.all(families.map(family => loadFont(family, options)).map(async f => {
    if (throwOnError) {
      return f;
    } else {
      try {
        return await f;
      } catch (e) {
        return undefined;
      }
    }
  }));
  return loadedFonts.filter(f => f !== undefined) as LoadedFontFamily[];
}

