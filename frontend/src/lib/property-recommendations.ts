import { isGurugramProperty, normalizeGurugramLocation } from "@/lib/gurugram-localities";
import { fetchProperties } from "@/lib/api";
import { PropertyStatus, PropertyType, type Property } from "@/types";

export interface RecommendationPreferences {
  intent: "buy" | "rent";
  locality: string;
  budget: string;
  propertyType: string;
  bedrooms: string;
  priority: "best-fit" | "price" | "space";
}

export const recommendationBudgets = {
  buy: [
    { value: "5000000", label: "Up to ₹50 Lac" },
    { value: "10000000", label: "Up to ₹1 Cr" },
    { value: "20000000", label: "Up to ₹2 Cr" },
    { value: "50000000", label: "Up to ₹5 Cr" },
    { value: "100000000", label: "Up to ₹10 Cr" },
    { value: "any", label: "Flexible budget" },
  ],
  rent: [
    { value: "10000", label: "Up to ₹10,000 / month" },
    { value: "25000", label: "Up to ₹25,000 / month" },
    { value: "50000", label: "Up to ₹50,000 / month" },
    { value: "100000", label: "Up to ₹1 Lac / month" },
    { value: "200000", label: "Up to ₹2 Lac / month" },
    { value: "any", label: "Flexible budget" },
  ],
};

export function supportsBedrooms(propertyType: string) {
  return !["Plot", "Commercial"].includes(propertyType);
}

export function recommendationFilters(preferences: RecommendationPreferences) {
  return {
    type: preferences.intent === "rent" ? PropertyType.RENT : PropertyType.SALE,
    status: PropertyStatus.AVAILABLE,
    city: "Gurugram",
    location: preferences.locality || undefined,
    maxPrice: preferences.budget && preferences.budget !== "any"
      ? Number(preferences.budget)
      : undefined,
    propertyCategory: preferences.propertyType || undefined,
    bedrooms: supportsBedrooms(preferences.propertyType) && preferences.bedrooms
      ? Number(preferences.bedrooms)
      : undefined,
  };
}

export function recommendationSearchHref(preferences: RecommendationPreferences) {
  const filters = recommendationFilters(preferences);
  const params = new URLSearchParams({ city: "Gurugram" });
  if (filters.location) { params.set("location", filters.location); params.set("locality", filters.location); }
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.propertyCategory) params.set("propertyType", filters.propertyCategory);
  if (filters.bedrooms !== undefined) params.set("bedrooms", String(filters.bedrooms));
  return `/${preferences.intent}${params.size ? `?${params}` : ""}`;
}

function amount(property: Property, intent: RecommendationPreferences["intent"]) {
  const value = intent === "rent" ? property.rentAmount : property.price;
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : Infinity;
}

function normalizeLocation(value: string) {
  return normalizeGurugramLocation(value);
}

/** Keep the visitor's constraints even when an older API ignores a filter. */
export function rankRecommendations(properties: Property[], preferences: RecommendationPreferences) {
  const filters = recommendationFilters(preferences);
  const seen = new Set<number>();
  return properties.filter((property) => {
    if (property.id === undefined || seen.has(property.id)) return false;
    seen.add(property.id);
    if (!isGurugramProperty(property)) return false;
    if (property.type !== filters.type || property.status !== PropertyStatus.AVAILABLE) return false;
    if (filters.location) {
      const location = normalizeLocation([property.location, property.city, property.locality, property.microMarket]
        .filter(Boolean).join(" "));
      if (!` ${location} `.includes(` ${normalizeLocation(filters.location)} `)) return false;
    }
    if (filters.propertyCategory) {
      const category = `${property.propertyCategory || ""} ${property.buildingType || ""}`.toLowerCase();
      if (!category.includes(filters.propertyCategory.toLowerCase())) return false;
    }
    if (filters.maxPrice !== undefined && amount(property, preferences.intent) > filters.maxPrice) return false;
    return filters.bedrooms === undefined || (property.bedrooms ?? 0) >= filters.bedrooms;
  }).sort((a, b) => {
    const priceDifference = amount(a, preferences.intent) - amount(b, preferences.intent);
    const spaceDifference = (b.sqft || 0) - (a.sqft || 0);
    if (preferences.priority === "space" && spaceDifference) return spaceDifference;
    if (preferences.priority === "best-fit" && filters.bedrooms !== undefined) {
      const roomDifference = (a.bedrooms ?? 0) - (b.bedrooms ?? 0);
      if (roomDifference) return roomDifference;
    }
    return (Number.isNaN(priceDifference) ? 0 : priceDifference) || spaceDifference || (a.id! - b.id!);
  });
}

export async function getPropertyRecommendations(
  preferences: RecommendationPreferences,
  signal: AbortSignal,
) {
  const filters = recommendationFilters(preferences);
  const options = { signal, throwOnError: true };
  const firstPage = await fetchProperties(0, 50, filters, options);
  // Bound the shortlist request so a large catalogue cannot stall the hero.
  const pageCount = Math.min(firstPage.totalPages, 3);
  const otherPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchProperties(index + 1, 50, filters, options)),
  );
  const properties = [firstPage, ...otherPages].flatMap((page) => page.content);
  return {
    properties: rankRecommendations(properties, preferences).slice(0, 3),
    limited: firstPage.totalPages > pageCount,
  };
}
