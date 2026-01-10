import { FontFamily, UnicodeRangeToFontFamilies } from "./types.ts";
import { getTextContent, type HtmlNode } from "@levischuck/tiny-html";

/**
 * Parses a Unicode range string (e.g., "2F800-2FA1F") and returns [start, end] as numbers
 */
export function parseUnicodeRange(range: string): [number, number] | null {
  const parts = range.split("-");
  if (parts.length !== 2) {
    return null;
  }
  const start = parseInt(parts[0], 16);
  const end = parseInt(parts[1], 16);
  if (isNaN(start) || isNaN(end)) {
    return null;
  }
  return [start, end];
}

/**
 * Scans HTML content for Unicode characters and determines which Unicode ranges are present
 * Returns an array of font families that should be loaded based on detected ranges
 */
export function scanUnicodeRanges(root: HtmlNode, ranges: UnicodeRangeToFontFamilies): FontFamily[] {
  const fontMap = new Map<string, FontFamily>();

  const textContent = getTextContent(root);

  // Check each character in the text
  for (let i = 0; i < textContent.length; i++) {
    const codePoint = textContent.codePointAt(i);
    if (!codePoint) continue;

    // Skip ASCII and common Latin characters (0x0000-0x007F)
    if (codePoint < 0x0080) continue;

    // Check all font mappings to see if this code point falls within any range
    outer: for (const fontMapping of ranges) {
      for (const range of fontMapping.ranges) {
        const parsed = parseUnicodeRange(range);
        if (parsed) {
          const [start, end] = parsed;
          if (codePoint >= start && codePoint <= end) {
            // Add font with default weight 400
            if (!fontMap.has(fontMapping.family)) {
              fontMap.set(fontMapping.family, {
                family: fontMapping.family,
                weight: 400,
              });
            }
            break outer; // Found matching range, no need to continue
          }
        }
      }
    }
  }

  return Array.from(fontMap.values());
}
