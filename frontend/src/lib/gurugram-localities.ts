export const GURUGRAM_CITY = "Gurugram";
export const gurugramLocalityGroups = [
  { label: "Neighbourhoods", locations: ["Sushant Lok", "Sushant Lok 1", "Sushant Lok 2", "Sushant Lok 3", "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "South City 1", "South City 2", "Palam Vihar", "Nirvana Country", "Suncity", "Malibu Town", "Mayfield Garden", "Rosewood City", "Greenwood City", "Uppal Southend", "Vipul World", "Udyog Vihar", "Cyber City"] },
  { label: "Roads & areas", locations: ["Golf Course Road", "Golf Course Extension Road", "Sohna Road", "MG Road", "Dwarka Expressway", "Southern Peripheral Road", "New Gurgaon", "Manesar"] },
  { label: "Sectors", locations: [...Array.from({ length: 115 }, (_, index) => `Sector ${index + 1}`), "Sector 23A", "Sector 52A", "Sector 63A", "Sector 67A", "Sector 70A", "Sector 95A"].sort((a,b) => a.localeCompare(b, "en", { numeric: true })) },
];

export function normalizeGurugramLocation(value: string) {
  const phases: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5 };
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\bgurgaon\b/g, "gurugram").replace(/\bphase\s+(iii|ii|iv|v|i)\b/g, (_, roman: string) => `phase ${phases[roman]}`).replace(/\s+/g, " ").trim();
}

export function isGurugramProperty(property: { city?: string; location?: string }) {
  return /\bgurugram\b/.test(normalizeGurugramLocation(`${property.city || ""} ${property.location || ""}`));
}
