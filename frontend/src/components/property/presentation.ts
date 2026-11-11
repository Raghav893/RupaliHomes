import type { CSSProperties } from "react";
import type { GalleryImage, Property } from "@/types";

export const DEFAULT_ACCENT = "#C9B458";

export function validAccent(value?: string) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_ACCENT;
}

export function accentTextColor(value?: string) {
  const color = validAccent(value).slice(1);
  const rgb = [0, 2, 4].map((index) => parseInt(color.slice(index, index + 2), 16) / 255);
  const [r, g, b] = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? "#111811" : "#FFFFFF";
}

export interface PropertyTheme {
  themeDark?: string;
  themeDarker?: string;
  themeLight?: string;
  themeName?: string;
}

function validThemeColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function relativeLuminance(value: string) {
  const rgb = [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  const [r, g, b] = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}

export function accentVariables(color?: string, theme: PropertyTheme = {}): CSSProperties {
  const dark = validThemeColor(theme.themeDark, "#1c3a32");
  const darker = validThemeColor(theme.themeDarker, "#12261f");
  const light = validThemeColor(theme.themeLight, "#f5f2e9");
  const a = relativeLuminance(dark), b = relativeLuminance(light);
  const ink = (Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5 ? dark : accentTextColor(light);
  return {
    "--accent": validAccent(color), "--accent-ink": accentTextColor(color),
    "--theme-dark": dark, "--theme-darker": darker, "--theme-light": light,
    "--theme-ink": ink, "--theme-on-dark": accentTextColor(dark), "--theme-on-darker": accentTextColor(darker),
  } as CSSProperties;
}

export function galleryForProperty(property: Property): GalleryImage[] {
  const structured = (Array.isArray(property.galleryImages) ? property.galleryImages : []).filter((image) => image?.url?.trim());
  const images = structured.length ? [...structured].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [property.imageUrl, ...(property.imageGallery || "").split(",")].filter((url): url is string => Boolean(url?.trim())).map((url, order) => ({ url: url.trim(), order }));
  const seen = new Set<string>();
  return images.filter((image) => { if (seen.has(image.url)) return false; seen.add(image.url); return true; });
}

export function scrollToPropertySection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}

export function brochureFilename(property: Property) {
  return `${property.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "property"}-developer.pdf`;
}

export function formatFileSize(value?: number) {
  if (!value || !Number.isFinite(value) || value <= 0) return "PDF document";
  return value >= 1024 * 1024 ? `${(value / (1024 * 1024)).toFixed(1)} MB PDF` : `${Math.max(1, Math.round(value / 1024))} KB PDF`;
}
