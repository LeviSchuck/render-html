import { toNearestWeight } from "./font.ts";
import { ComputedStyles, mergeStyles, parseInlineStyles, parseStyleDeclarations, styleFromAttrbutes } from "./styles.ts";
import { FontFamily, UnicodeRangeToFontFamilies } from "./types.ts";
import { scanUnicodeRanges } from "./unicode.ts";
import { decodeHtmlEntities, HtmlNode } from "@levischuck/tiny-html";

/**
 * Extracts all font families, weights, and italic styles from HTML
 * by traversing the DOM tree and parsing inline styles.
 */
export function extractFontsFromHTML(root: HtmlNode): FontFamily[] {
  const fontSet = new Set<string>(); // Use Set to track unique combinations

  function traverse(node: HtmlNode, inheritedStyles: ComputedStyles = {}): void {
    // Skip text nodes and other non-element nodes
    if (typeof node === "string" || typeof node === "number" || typeof node === "bigint" || typeof node === "boolean" || node === undefined || node === null) {
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        traverse(child, inheritedStyles);
      }
      return;
    }
    // Get inline styles from this element
    let props: Record<string, string> & { children?: HtmlNode } = {};
    if (typeof node === "object" && node !== null && "props" in node && typeof node.props === "object") {
      props = node.props as Record<string, string>;
    }
    const children: HtmlNode | undefined = props.children;
    const styleAttr = props.style;

    let elementStyles = styleFromAttrbutes(props);

    if (typeof styleAttr === "string") {
      const parsedStyles = parseInlineStyles(decodeHtmlEntities(styleAttr));
      elementStyles = mergeStyles(elementStyles, parsedStyles);
    } else if (typeof styleAttr === "object") {
      elementStyles = mergeStyles(elementStyles, parseStyleDeclarations(styleAttr));
    } else if (styleAttr === undefined || styleAttr === null) {
      // Do nothing
    } else {
      throw new Error("style must be a string or object");
    }

    // Merge with inherited styles (child styles override parent)
    const computedStyles = mergeStyles(inheritedStyles, elementStyles);

    // If this element has font-family, extract all font combinations
    // Only extract fonts that are quoted (already filtered in mergeStyles)
    if (computedStyles.fontFamily) {
      for (const family of computedStyles.fontFamily) {
        const italic = computedStyles.fontStyle === 'italic' ||
          computedStyles.fontStyle === 'oblique';
        const weight = computedStyles.fontWeight || 400;

        // Create a unique key for this font combination
        const key = `${family}:${weight}:${italic ? 'italic' : 'normal'}`;
        fontSet.add(key);
      }
    }

    // Traverse child nodes with inherited styles
    if (children && Array.isArray(children)) {
      for (const child of children) {
        traverse(child, computedStyles);
      }
    }
  }

  traverse(root);

  // Convert Set to FontFamily array
  const fonts: FontFamily[] = [];
  for (const key of fontSet) {
    const [family, weightStr, style] = key.split(':');
    const weight = parseInt(weightStr, 10);
    const italic = style === 'italic';

    fonts.push({
      family,
      weight: toNearestWeight(weight) || undefined,
      italic: italic || undefined,
    });
  }

  return fonts;
}

/**
 * Combines fonts extracted from HTML styles with fonts detected from Unicode ranges
 * Automatically scans all Unicode ranges defined in the font mapping
 */
export function extractFontsFromHTMLWithRanges(parsedHtml: HtmlNode, ranges: UnicodeRangeToFontFamilies): FontFamily[] {
  const styleFonts = extractFontsFromHTML(parsedHtml);
  const rangeFonts = scanUnicodeRanges(parsedHtml, ranges);

  // Combine and deduplicate fonts
  const fontMap = new Map<string, FontFamily>();

  // Add fonts from styles first (they may have specific weights/styles)
  for (const font of styleFonts) {
    const key = `${font.family}:${font.weight || 400}:${font.italic ? 'italic' : 'normal'}`;
    if (!fontMap.has(key)) {
      fontMap.set(key, font);
    }
  }

  // Add fonts from Unicode ranges (they may override with default weight if not already present)
  for (const font of rangeFonts) {
    const key = `${font.family}:${font.weight || 400}:${font.italic ? 'italic' : 'normal'}`;
    if (!fontMap.has(key)) {
      fontMap.set(key, font);
    }
  }

  return Array.from(fontMap.values());
}
