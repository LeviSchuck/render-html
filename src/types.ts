import { FontStyle, FontWeight } from "satori";
export type { FontStyle, FontWeight };

export type EmojiType =
  | "twemoji"
  | "openmoji"
  | "blobmoji"
  | "noto"
  | "fluent"
  | "fluentFlat";

export type ImageResponseFont = {
  name: string;
  data: ArrayBuffer;
  weight?: FontWeight;
  style?: FontStyle;
}

export type ImageResponseOptions = {
  /**
   * The format of the image.
   * @default "png"
   */
  format?: "svg" | "png" | undefined; // Defaults to 'png'
  /**
   * The width of the image. If neither width nor height is provided, the default is 1200.
   *
   * @type {number}
   */
  width?: number;
  /**
   * The height of the image. If neither width nor height is provided, the default is 630.
   *
   * @type {number}
   */
  height?: number;
  fonts?: ImageResponseFont[];
  emoji?: EmojiType;
  /**
   * Optional font cache for caching loaded fonts.
   */
  fontCache?: FontCache;
  headers?: Record<string, string>;
  status?: number;
  statusText?: string;
  debug?: boolean;
};

export interface LoadedFontFamily {
  data: ArrayBuffer;
  name: string;
  weight?: FontWeight;
  style?: FontStyle;
  lang?: string;
}

export type FontFamily = {
  family: string;
  italic?: boolean;
  weight?: FontWeight;
}

export type UnicodeRangeToFontFamily = { ranges: string[]; family: string };
export type UnicodeRangeToFontFamilies = UnicodeRangeToFontFamily[];

export type FontCache = {
  get(params: { family: string; weight?: number; text?: string }): Promise<ArrayBuffer | 'tombstone' | undefined>;
  put(params: { family: string; weight?: number; text?: string }, data: ArrayBuffer): Promise<void>;
  tombstone?(params: { family: string; weight?: number; text?: string }): Promise<void>;
};

export const FontNotFound = Symbol('FontNotFound');
export const FontError = Symbol('FontError');

export interface FontLoader {
  load(params: {
    family: string;
    weight?: number;
    text?: string;
  }): Promise<ArrayBuffer | typeof FontNotFound | typeof FontError>;
}

export interface LoadFontOptions {
  fontCache?: FontCache;
  fontLoaders?: FontLoader[];
}

export interface LoadFontsOptions extends LoadFontOptions {
  throwOnError?: boolean;
}
