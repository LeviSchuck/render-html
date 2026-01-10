export type ComputedStyles = {
	fontFamily?: string[];
	fontWeight?: number;
	fontStyle?: string;
	quotedFonts?: Set<string>; // Track which fonts were quoted
};

/**
 * Generic CSS font families that should be excluded
 */
const GENERIC_FONT_FAMILIES = new Set([
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
	'ui-serif',
	'ui-sans-serif',
	'ui-monospace',
	'ui-rounded',
	'math',
	'emoji',
	'fangsong',
]);


/**
 * Parses a CSS style string and extracts font-related properties
 */
export function parseInlineStyles(styleStr: string): ComputedStyles {
	const decls: Record<string, string> = {};
	// Split by semicolon and parse each property
	const declarations = styleStr.split(';').map(s => s.trim()).filter(Boolean);

	for (const decl of declarations) {
		const [property, ...valueParts] = decl.split(':').map(s => s.trim());
		const value = valueParts.join(':').trim();

		decls[property] = value;
	}

	return parseStyleDeclarations(decls);
}

export function parseStyleDeclarations(declarations: Record<string, string>): ComputedStyles {
	const styles: ComputedStyles = {};
	const quotedFonts = new Set<string>();
	for (const [property, value] of Object.entries(declarations)) {
		if (property === 'font-family' || property === 'fontFamily') {
			// Parse font-family: can be comma-separated, quoted or unquoted
			const families = value
				.split(',')
				.map(f => f.trim())
				.map(f => {
					// Check if quoted and track it
					if ((f.startsWith('"') && f.endsWith('"')) ||
						(f.startsWith("'") && f.endsWith("'"))) {
						const unquoted = f.slice(1, -1);
						quotedFonts.add(unquoted);
						return unquoted;
					}
					return f;
				})
				.filter(Boolean)
				.filter(f => !GENERIC_FONT_FAMILIES.has(f.toLowerCase()));
			if (families.length > 0) {
				styles.fontFamily = families;
				styles.quotedFonts = quotedFonts;
			}
		} else if (property === 'font-weight' || property === 'fontWeight') {
			// Convert font-weight to number
			const weightMap: Record<string, number> = {
				'normal': 400,
				'bold': 700,
				'lighter': 300,
				'bolder': 800,
			};

			if (weightMap[value.toLowerCase()]) {
				styles.fontWeight = weightMap[value.toLowerCase()];
			} else {
				const numWeight = parseInt(value, 10);
				if (!isNaN(numWeight)) {
					styles.fontWeight = numWeight;
				}
			}
		} else if (property === 'font-style' || property === 'fontStyle') {
			styles.fontStyle = value.toLowerCase();
		}
	}
	return styles;
}

/**
 * Merges child styles with parent styles (CSS inheritance)
 */
export function mergeStyles(parent: ComputedStyles, child: ComputedStyles): ComputedStyles {
	const mergedQuotedFonts = new Set<string>();
	if (parent.quotedFonts) {
		parent.quotedFonts.forEach(f => mergedQuotedFonts.add(f));
	}
	if (child.quotedFonts) {
		child.quotedFonts.forEach(f => mergedQuotedFonts.add(f));
	}

	// Determine which fontFamily to use and filter by quotedFonts
	let fontFamily: string[] | undefined;
	if (child.fontFamily && child.quotedFonts) {
		// Child has fontFamily with quoted fonts - use child's fonts filtered by child's quotedFonts
		fontFamily = child.fontFamily.filter(f => child.quotedFonts!.has(f));
	} else if (parent.fontFamily && parent.quotedFonts) {
		// Child doesn't have quoted fonts, use parent's fonts filtered by parent's quotedFonts
		fontFamily = parent.fontFamily.filter(f => parent.quotedFonts!.has(f));
	}

	return {
		fontFamily: fontFamily && fontFamily.length > 0 ? fontFamily : undefined,
		fontWeight: child.fontWeight ?? parent.fontWeight,
		fontStyle: child.fontStyle || parent.fontStyle,
		quotedFonts: mergedQuotedFonts.size > 0 ? mergedQuotedFonts : undefined,
	};
}

export function styleFromAttrbutes(props: Record<string, string>): ComputedStyles {
	const fontFamilyAttr = props['font-family'] || props['fontFamily'];
	const fontWeightAttr = props['font-weight'] || props['fontWeight'];
	const fontStyleAttr = props['font-style'] || props['fontStyle'];
	let elementStyles: ComputedStyles = {};
	let dirtyElementStyles = false;

	if (fontFamilyAttr && typeof fontFamilyAttr === 'string') {
		const families: string[] = fontFamilyAttr.split(',').map(f => f.trim());
		elementStyles.quotedFonts = new Set<string>();
		elementStyles.fontFamily = [];
		for (const family of families) {
			if ((family.startsWith("'") && family.endsWith("'")) || (family.startsWith('"') && family.endsWith('"'))) {
				const unquoted = family.slice(1, -1);
				elementStyles.quotedFonts.add(unquoted);
				elementStyles.fontFamily.push(unquoted);
			} else if (!GENERIC_FONT_FAMILIES.has(family.toLowerCase())) {
				elementStyles.fontFamily.push(family);
			}
		}

		dirtyElementStyles = true;
	}

	if (fontWeightAttr && typeof fontWeightAttr === 'string') {
		const parsedWeight = parseInt(fontWeightAttr, 10);
		if (!isNaN(parsedWeight)) {
			elementStyles.fontWeight = parsedWeight;
		} else if (fontWeightAttr.toLowerCase() === 'bold') {
			elementStyles.fontWeight = 700;
		} else if (fontWeightAttr.toLowerCase() === 'normal') {
			elementStyles.fontWeight = 400;
		} else if (fontWeightAttr.toLowerCase() === 'lighter') {
			elementStyles.fontWeight = 300;
		} else if (fontWeightAttr.toLowerCase() === 'bolder') {
			elementStyles.fontWeight = 800;
		}
		dirtyElementStyles = true;
	}

	if (fontStyleAttr && typeof fontStyleAttr === 'string') {
		elementStyles.fontStyle = fontStyleAttr.toLowerCase();
		dirtyElementStyles = true;
	}
	return elementStyles;
}
