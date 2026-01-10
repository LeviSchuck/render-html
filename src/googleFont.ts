import { FontNotFound, FontError, FontLoader } from "./types.ts";

async function loadGoogleFont({
	family,
	weight,
	text,
  }: {
	family: string;
	weight?: number;
	text?: string;
  }): Promise<ArrayBuffer | typeof FontNotFound | typeof FontError> {
	const params: Record<string, string> = {
	  family: `${encodeURIComponent(family)}${weight ? `:wght@${weight}` : ""}`,
	};

	if (text) {
	  params.text = text;
	} else {
	  params.subset = "latin";
	}

	const url = `https://fonts.googleapis.com/css2?${Object.keys(params)
	  .map((key) => `${key}=${params[key]}`)
	  .join("&")}`;

	try {
	  // Fetch CSS
	  let body: string | undefined;
	  let cssError: Error | undefined;

	  try {
		const res = await fetch(`${url}`, {
		  headers: {
			// construct user agent to get TTF font
			"User-Agent":
			  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
		  },
		});

		if (!res.ok) {
		  return FontError;
		}

		body = await res.text();

		// If the font is not available or missing, return FontNotFound
		if (body.includes("The requested font families are not available")) {
		  return FontNotFound;
		} else if (body.includes("Missing family name")) {
		  return FontNotFound;
		}
	  } catch (error) {
		// Network or fetch errors are transient
		return FontError;
	  }

	  if (!body) {
		return FontError;
	  }

	  // Get the font URL from the CSS text
	  const fontUrl = body.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/
	  )?.[1];

	  if (!fontUrl) {
		return FontNotFound;
	  }

	  // Fetch the font
	  try {
		const res = await fetch(fontUrl);
		if (!res.ok) {
		  return FontError;
		}
		const fontData = await res.arrayBuffer();
		return fontData;
	  } catch (error) {
		// Network errors are transient
		return FontError;
	  }
	} catch (error) {
	  // Unexpected errors are transient
	  return FontError;
	}
}

export const GoogleFontLoader: FontLoader = {
  load: loadGoogleFont,
};
