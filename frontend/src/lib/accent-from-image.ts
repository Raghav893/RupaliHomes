import { DEFAULT_PROPERTY_ACCENT, DEFAULT_PROPERTY_THEME } from "@/lib/property-presentation";

export interface PropertyImageTheme {
  accentColor: string;
  themeDark: string;
  themeDarker: string;
  themeLight: string;
  themeName: string;
}

const MAX_SAMPLE_SIDE = 50;
const IMAGE_TIMEOUT_MS = 8_000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function rgbToHsl(red: number, green: number, blue: number): [number, number, number] {
  const r = red / 255, g = green / 255, b = blue / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const lightness = (max + min) / 2;
  if (!delta) return [0, 0, lightness];
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [(hue * 60 + 360) % 360, saturation, lightness];
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const offset = lightness - chroma / 2;
  const components = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return `#${components.map((component) => Math.round((component + offset) * 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function dominantBucket(pixels: Uint8ClampedArray, vividOnly: boolean) {
  const buckets = new Map<number, { count: number; red: number; green: number; blue: number }>();
  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const red = pixels[index], green = pixels[index + 1], blue = pixels[index + 2], alpha = pixels[index + 3];
    if (alpha < 192) continue;
    const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
    const brightness = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    if (brightness < 28 || brightness > 235) continue;
    const [, saturation] = rgbToHsl(red, green, blue);
    if (vividOnly && (max - min < 24 || saturation < 0.18)) continue;
    const r = Math.min(255, Math.round(red / 32) * 32);
    const g = Math.min(255, Math.round(green / 32) * 32);
    const b = Math.min(255, Math.round(blue / 32) * 32);
    const key = (r << 16) | (g << 8) | b;
    const bucket = buckets.get(key);
    if (bucket) bucket.count++;
    else buckets.set(key, { count: 1, red: r, green: g, blue: b });
  }
  // A numeric tie-break keeps a tied palette stable regardless of pixel order.
  return [...buckets.entries()].sort(([keyA, a], [keyB, b]) => b.count - a.count || keyA - keyB)[0]?.[1];
}

/** Existing accent-only callers retain their palette and fallback behavior. */
export function getAccentFromPixels(pixels: Uint8ClampedArray): string {
  const winner = dominantBucket(pixels, true);
  if (!winner) return DEFAULT_PROPERTY_ACCENT;
  const [hue, saturation, lightness] = rgbToHsl(winner.red, winner.green, winner.blue);
  return hslToHex(hue, clamp(saturation, 0.4, 0.8), clamp(lightness, 0.55, 0.7));
}

/** Generate a coherent restrained palette from the same small image sample. */
export function getThemeFromPixels(pixels: Uint8ClampedArray): PropertyImageTheme {
  const vivid = dominantBucket(pixels, true);
  const base = vivid ?? dominantBucket(pixels, false);
  if (!base) return { ...DEFAULT_PROPERTY_THEME };
  const [hue, saturation, lightness] = rgbToHsl(base.red, base.green, base.blue);
  const themeName = !vivid ? "Charcoal, steel and soft ivory" : hue >= 75 && hue < 170 ? "Forest green, botanical tones and soft parchment" : hue >= 170 && hue < 260 ? "Deep ocean blue, sea mist and soft sand" : hue >= 10 && hue < 75 ? "Warm earth, terracotta and soft cream" : "Charcoal, steel and soft ivory";
  return {
    accentColor: vivid ? hslToHex(hue, clamp(saturation, 0.5, 0.75), clamp(lightness, 0.6, 0.7)) : hslToHex((hue + 40) % 360, 0.55, 0.65),
    themeDark: hslToHex(hue, 0.3, 0.18),
    themeDarker: hslToHex(hue, 0.3, 0.11),
    themeLight: hslToHex(hue, 0.25, 0.95),
    themeName,
  };
}

/** Extract a restrained accent entirely in the admin browser; never uploads the file. */
async function readImagePixels(file: File): Promise<Uint8ClampedArray | null> {
  if (typeof document === "undefined" || typeof Image === "undefined" || typeof URL.createObjectURL !== "function") return null;
  let objectUrl: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const image = new Image();
  try {
    objectUrl = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image could not be decoded."));
      timer = setTimeout(() => reject(new Error("Image decoding timed out.")), IMAGE_TIMEOUT_MS);
      image.src = objectUrl!;
    });
    if (timer) clearTimeout(timer);
    const width = image.naturalWidth, height = image.naturalHeight;
    if (width < 2 || height < 2 || width * height < 100) return null;
    const ratio = Math.min(1, MAX_SAMPLE_SIDE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
    image.onload = null;
    image.onerror = null;
    image.src = "";
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

/** Re-pick a saved cover only when its host permits reading the image with CORS. */
async function readImageUrl(url: string): Promise<File | null> {
  if (typeof window === "undefined" || typeof File === "undefined") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const resolvedUrl = new URL(url, window.location.href);
    if (!["http:", "https:"].includes(resolvedUrl.protocol)) return null;
    const response = await fetch(resolvedUrl, { mode: "cors", credentials: "omit", signal: controller.signal });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], "property-cover", { type: blob.type });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getAccentFromImage(file: File): Promise<string> {
  const pixels = await readImagePixels(file);
  return pixels ? getAccentFromPixels(pixels) : DEFAULT_PROPERTY_ACCENT;
}

export async function getAccentFromImageUrl(url: string): Promise<string> {
  const file = await readImageUrl(url);
  return file ? getAccentFromImage(file) : DEFAULT_PROPERTY_ACCENT;
}

export async function getThemeFromImage(file: File): Promise<PropertyImageTheme> {
  const pixels = await readImagePixels(file);
  return pixels ? getThemeFromPixels(pixels) : { ...DEFAULT_PROPERTY_THEME };
}

export async function getThemeFromImageUrl(url: string): Promise<PropertyImageTheme> {
  const file = await readImageUrl(url);
  return file ? getThemeFromImage(file) : { ...DEFAULT_PROPERTY_THEME };
}
