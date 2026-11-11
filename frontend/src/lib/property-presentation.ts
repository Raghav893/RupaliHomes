import { PropertyStatus, PropertyType, type FloorPlan, type GalleryImage, type Property } from "@/types";

export const DEFAULT_PROPERTY_ACCENT = "#C9B458";
export const DEFAULT_PROPERTY_THEME = {
  accentColor: DEFAULT_PROPERTY_ACCENT,
  themeDark: "#1c3a32",
  themeDarker: "#12261f",
  themeLight: "#f5f2e9",
  themeName: "",
};
export const isPropertyAccent = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

const homeCategories = new Set(["apartment", "builder floor", "villa", "penthouse", "studio"]);

export function requiresRoomCounts(category: string): boolean {
  return homeCategories.has(category.trim().toLowerCase());
}

export function missingListingDetails(property: Partial<Property>): string[] {
  const missing: string[] = [];
  if (!property.title?.trim()) missing.push("title");
  if (!property.description?.trim()) missing.push("description");
  if (!property.location?.trim()) missing.push("location");
  if (property.status === PropertyStatus.HIDDEN) return missing;

  if (!property.city?.trim()) missing.push("city");
  if (!property.locality?.trim()) missing.push("locality");
  if (!property.propertyCategory?.trim()) missing.push("property category");
  const amount = property.type === PropertyType.RENT ? property.rentAmount : property.price;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    missing.push(property.type === PropertyType.RENT ? "monthly rent above zero" : "sale price above zero");
  }
  if (typeof property.sqft !== "number" || !Number.isInteger(property.sqft) || property.sqft <= 0) {
    missing.push("area in square feet");
  }
  if (!(property.coverImage?.trim() || property.imageUrl?.trim())) missing.push("cover photo");
  if (requiresRoomCounts(property.propertyCategory || "")) {
    const minBedrooms = property.propertyCategory?.trim().toLowerCase() === "studio" ? 0 : 1;
    if (typeof property.bedrooms !== "number" || !Number.isInteger(property.bedrooms) || property.bedrooms < minBedrooms) {
      missing.push("bedroom count");
    }
    if (typeof property.bathrooms !== "number" || !Number.isInteger(property.bathrooms) || property.bathrooms < 1) {
      missing.push("bathroom count");
    }
  }
  return missing;
}

export function validatePropertyPresentation(value: PropertyPresentation): string | undefined {
  if (!isPropertyAccent(value.accentColor)) return "Accent color must use six hexadecimal digits, for example #C9B458.";
  if ([value.themeDark, value.themeDarker, value.themeLight].some((color) => !isPropertyAccent(color))) return "All theme colors must use six hexadecimal digits, for example #1C3A32.";
  if (value.galleryImages.some((image) => !image.url.trim())) return "Add an image URL or remove each empty gallery row.";
  if (value.floorPlans.some((plan) => !plan.title.trim() || !plan.imageUrl.trim())) return "Each floor plan needs a title and an image. Complete or remove empty floor plans.";
  if (value.floorPlans.some((plan) => [plan.totalArea, plan.carpetArea, plan.bedrooms, plan.bathrooms].some((amount) => amount !== undefined && (!Number.isFinite(amount) || amount < 0)))) return "Floor plan sizes and room counts must be zero or greater.";
  if (value.floorPlans.some((plan) => [plan.bedrooms, plan.bathrooms].some((amount) => amount !== undefined && !Number.isInteger(amount)))) return "Floor plan bedrooms and bathrooms must be whole numbers.";
  if (value.brochureFileSize !== undefined && (!Number.isFinite(value.brochureFileSize) || value.brochureFileSize < 0 || !Number.isInteger(value.brochureFileSize))) return "Brochure file size must be a whole number of bytes, zero or greater.";
  return undefined;
}

export interface PropertyPresentation {
  coverImage: string;
  tagline: string;
  eyebrow: string;
  developerName: string;
  developerLogo: string;
  projectStatus: string;
  accentColor: string;
  themeDark: string;
  themeDarker: string;
  themeLight: string;
  themeName: string;
  galleryImages: GalleryImage[];
  floorPlans: FloorPlan[];
  brochureFileSize?: number;
  brochureSourceUrl: string;
  brochurePreviewImage: string;
  reraNumber: string;
  registrationsText: string;
}

const finiteNonnegative = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;

export function normalizeGalleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object" && typeof item.url === "string")
    .map((item, index) => ({ url: item.url, caption: typeof item.caption === "string" ? item.caption : "", order: finiteNonnegative(item.order) ?? index }))
    .sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order }));
}

export function normalizeFloorPlans(value: unknown): FloorPlan[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object" && typeof item.imageUrl === "string")
    .map((item, index) => ({
      title: typeof item.title === "string" ? item.title : "", imageUrl: item.imageUrl,
      totalArea: finiteNonnegative(item.totalArea), carpetArea: finiteNonnegative(item.carpetArea),
      bedrooms: finiteNonnegative(item.bedrooms), bathrooms: finiteNonnegative(item.bathrooms), order: finiteNonnegative(item.order) ?? index,
    })).sort((a,b) => a.order - b.order).map((item, order) => ({ ...item, order }));
}

export function propertyPresentationFrom(property?: Partial<Property>): PropertyPresentation {
  return {
    coverImage: property?.coverImage?.trim() || property?.imageUrl?.trim() || "", tagline: property?.tagline || "", eyebrow: property?.eyebrow || "",
    developerName: property?.developerName || "", developerLogo: property?.developerLogo || "", projectStatus: property?.projectStatus || "",
    accentColor: property?.accentColor || DEFAULT_PROPERTY_ACCENT,
    themeDark: property?.themeDark || DEFAULT_PROPERTY_THEME.themeDark,
    themeDarker: property?.themeDarker || DEFAULT_PROPERTY_THEME.themeDarker,
    themeLight: property?.themeLight || DEFAULT_PROPERTY_THEME.themeLight,
    themeName: property?.themeName || "",
    galleryImages: normalizeGalleryImages(property?.galleryImages), floorPlans: normalizeFloorPlans(property?.floorPlans),
    brochureFileSize: finiteNonnegative(property?.brochureFileSize), brochureSourceUrl: property?.brochureSourceUrl || "",
    brochurePreviewImage: property?.brochurePreviewImage || "", reraNumber: property?.reraNumber || "", registrationsText: property?.registrationsText || "",
  };
}
