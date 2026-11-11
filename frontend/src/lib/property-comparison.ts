import { PropertyStatus, PropertyType, type Property } from "@/types";
import { formatIndianPrice } from "@/lib/utils";

export const MAX_COMPARE_PROPERTIES = 3;
export const NOT_LISTED = "Not listed";

export interface ComparisonValue {
  text: string;
  missing?: boolean;
  items?: string[];
  numeric?: number;
  highlight?: string;
  href?: string;
}

export interface ComparisonRow {
  id: string;
  label: string;
  values: ComparisonValue[];
  amenity?: boolean;
}

export interface ComparisonSection {
  id: string;
  title: string;
  rows: ComparisonRow[];
}

export function listedText(value: unknown): ComparisonValue {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? { text } : { text: NOT_LISTED, missing: true };
}

export function positiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function count(value: unknown): ComparisonValue {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? { text: value.toLocaleString("en-IN"), numeric: value }
    : listedText(undefined);
}

export function propertyArea(property: Property) {
  return positiveNumber(property.sqft) ?? positiveNumber(property.areaSqFt);
}

export function propertyPrice(property: Property) {
  return positiveNumber(property.type === PropertyType.RENT ? property.rentAmount : property.price);
}

export function propertyPriceLabel(property: Property) {
  const amount = propertyPrice(property);
  return amount === undefined ? "Price on request" : `${formatIndianPrice(amount)}${property.type === PropertyType.RENT ? " / month" : ""}`;
}

export function propertyPath(property: Property) {
  return `/${property.type === PropertyType.RENT ? "rent" : "buy"}/${property.id}`;
}

export function splitPropertyList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const seen = new Set<string>();
  return value.split(/[,;\n]/).map((item) => item.trim()).filter((item) => {
    const key = item.toLocaleLowerCase("en-IN");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function listValue(value: unknown): ComparisonValue {
  const items = splitPropertyList(value);
  return items.length ? { text: items.join("\n"), items } : listedText(undefined);
}

function dateValue(value: unknown): ComparisonValue {
  if (typeof value !== "string" || !value.trim()) return listedText(undefined);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? listedText(value) : {
    text: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date),
  };
}

function money(value: unknown, suffix = ""): ComparisonValue {
  const amount = positiveNumber(value);
  return amount === undefined ? listedText(undefined) : { text: `${formatIndianPrice(Math.round(amount))}${suffix}`, numeric: amount };
}

function highlight(values: ComparisonValue[], direction: "min" | "max", label: string) {
  const numbers = values.flatMap((value) => value.numeric === undefined ? [] : [value.numeric]);
  if (numbers.length < 2 || Math.min(...numbers) === Math.max(...numbers)) return values;
  const best = direction === "min" ? Math.min(...numbers) : Math.max(...numbers);
  return values.map((value) => value.numeric === best ? { ...value, highlight: label } : value);
}

export function rowHasDifferences(row: ComparisonRow) {
  const normalized = row.values.map((value) => value.items
    ? [...value.items].map((item) => item.toLowerCase()).sort().join("|")
    : value.text.trim().toLowerCase());
  return new Set(normalized).size > 1;
}

/** One source of truth for the on-screen comparison and its PDF report. */
export function buildComparisonSections(properties: Property[], differencesOnly = false): ComparisonSection[] {
  const row = (id: string, label: string, value: (property: Property) => ComparisonValue): ComparisonRow => ({ id, label, values: properties.map(value) });
  const priceRow = (id: string, label: string, type: PropertyType, perArea = false): ComparisonRow => ({
    id, label,
    values: highlight(properties.map((property) => {
      if (property.type !== type) return { text: "Not applicable", missing: true };
      const price = propertyPrice(property);
      const area = propertyArea(property);
      if (perArea) return price && area ? money(price / area, type === PropertyType.RENT ? " / sq ft / month" : " / sq ft") : listedText(undefined);
      return money(price, type === PropertyType.RENT ? " / month" : "");
    }), "min", "Lowest"),
  });
  const prices: ComparisonRow[] = [];
  if (properties.some((property) => property.type === PropertyType.SALE)) prices.push(priceRow("sale-price", "Asking price", PropertyType.SALE), priceRow("sale-rate", "Price per sq ft", PropertyType.SALE, true));
  if (properties.some((property) => property.type === PropertyType.RENT)) prices.push(priceRow("rent-price", "Monthly rent", PropertyType.RENT), priceRow("rent-rate", "Rent per sq ft", PropertyType.RENT, true));

  const amenityNames = new Map<string, string>();
  const amenitySets = properties.map((property) => new Set(splitPropertyList(property.amenities).map((name) => {
    const key = name.toLowerCase();
    if (!amenityNames.has(key)) amenityNames.set(key, name);
    return key;
  })));
  const amenities: ComparisonRow[] = [...amenityNames].sort((a, b) => a[1].localeCompare(b[1])).map(([key, name]) => ({
    id: `amenity-${key}`, label: name, amenity: true,
    values: amenitySets.map((set) => set.has(key) ? { text: "Included" } : { text: NOT_LISTED, missing: true }),
  }));

  const sections: ComparisonSection[] = [
    { id: "overview", title: "At a glance", rows: [
      row("listing-type", "Listing type", (property) => ({ text: property.type === PropertyType.RENT ? "For rent" : "For sale" })),
      row("status", "Availability status", (property) => listedText({ [PropertyStatus.AVAILABLE]: "Available", [PropertyStatus.SOLD]: "Sold", [PropertyStatus.RENTED]: "Rented", [PropertyStatus.HIDDEN]: "Hidden" }[property.status])),
      row("category", "Property type", (property) => listedText(property.propertyCategory)),
      row("building-type", "Building type", (property) => listedText(property.buildingType)),
    ] },
    { id: "pricing", title: "Pricing & value", rows: prices },
    { id: "layout", title: "Space & layout", rows: [
      { id: "area", label: "Area", values: highlight(properties.map((property) => {
        const area = propertyArea(property);
        return area ? { text: `${area.toLocaleString("en-IN")} sq ft`, numeric: area } : listedText(property.size);
      }), "max", "Largest") },
      row("bedrooms", "Bedrooms", (property) => count(property.bedrooms)),
      row("bathrooms", "Bathrooms", (property) => count(property.bathrooms)),
      row("floor", "Floor", (property) => typeof property.floorNumber === "number" && Number.isFinite(property.floorNumber)
        ? { text: property.floorNumber === 0 ? "Ground floor" : property.floorNumber < 0 ? `Basement ${Math.abs(property.floorNumber)}` : `Floor ${property.floorNumber}` }
        : listedText(undefined)),
      row("total-floors", "Floors in building", (property) => count(property.totalFloors)),
      row("unit", "Unit number", (property) => count(property.unitNumber)),
    ] },
    { id: "location", title: "Location", rows: [
      row("address", "Address / location", (property) => listedText(property.location)),
      row("city", "City", (property) => listedText(property.city)),
      row("locality", "Locality", (property) => listedText(property.locality)),
      row("micro-market", "Micro-market", (property) => listedText(property.microMarket)),
    ] },
    { id: "interiors", title: "Interiors & furnishing", rows: [
      row("furnishing-status", "Furnishing status", (property) => listedText(property.furnishingStatus)),
      row("flooring", "Flooring", (property) => listedText(property.flooring)),
      row("furnishing-details", "Furnishing included", (property) => listValue(property.furnishingDetails)),
    ] },
    { id: "amenities", title: "Amenities", rows: amenities.length ? amenities : [row("amenities-empty", "Listed amenities", () => listedText(undefined))] },
    { id: "details", title: "Availability & listing details", rows: [
      row("available-from", "Available from", (property) => dateValue(property.availableFrom)),
      row("agent", "Listed agent", (property) => listedText(property.agentName)),
      row("highlights", "Property highlights", (property) => listValue(property.tags)),
      row("description", "About the property", (property) => listedText(property.description)),
      row("listing-date", "Listed on", (property) => dateValue(property.createdAt)),
      row("reference", "Listing reference", (property) => property.id === undefined ? listedText(undefined) : { text: `RH-${property.id}` }),
      row("brochure", "Property brochure", (property) => {
        const url = typeof property.brochureUrl === "string" ? property.brochureUrl.trim() : "";
        return /^https?:\/\//i.test(url) ? { text: "View brochure", href: url } : listedText(undefined);
      }),
    ] },
  ];
  return sections.map((section) => ({ ...section, rows: differencesOnly ? section.rows.filter(rowHasDifferences) : section.rows })).filter((section) => section.rows.length > 0);
}

export function comparisonHighlights(properties: Property[]) {
  const highlights: { label: string; value: string; property: string }[] = [];
  for (const type of [PropertyType.SALE, PropertyType.RENT]) {
    const priced = properties.filter((property) => property.type === type && propertyPrice(property) !== undefined);
    if (priced.length < 2) continue;
    const sorted = [...priced].sort((a, b) => propertyPrice(a)! - propertyPrice(b)!);
    if (propertyPrice(sorted[0]) === propertyPrice(sorted[sorted.length - 1])) continue;
    const winners = sorted.filter((property) => propertyPrice(property) === propertyPrice(sorted[0]));
    highlights.push({ label: type === PropertyType.SALE ? "Lowest asking price" : "Lowest monthly rent", value: propertyPriceLabel(sorted[0]), property: winners.length === 1 ? sorted[0].title : `${winners.length} properties` });
  }
  const sized = properties.filter((property) => propertyArea(property) !== undefined).sort((a, b) => propertyArea(b)! - propertyArea(a)!);
  if (sized.length > 1 && propertyArea(sized[0]) !== propertyArea(sized[sized.length - 1])) {
    const winners = sized.filter((property) => propertyArea(property) === propertyArea(sized[0]));
    highlights.push({ label: "Largest listed area", value: `${propertyArea(sized[0])!.toLocaleString("en-IN")} sq ft`, property: winners.length === 1 ? sized[0].title : `${winners.length} properties` });
  }
  return highlights;
}
