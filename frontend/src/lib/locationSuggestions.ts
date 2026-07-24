// Delhi NCR localities used by all property-search autocomplete inputs.
export const delhiNcrLocations = [
  "Saket, Delhi",
  "Hauz Khas, Delhi",
  "Vasant Kunj, Delhi",
  "Vasant Vihar, Delhi",
  "Greater Kailash, Delhi",
  "Defence Colony, Delhi",
  "Lajpat Nagar, Delhi",
  "Chanakyapuri, Delhi",
  "Connaught Place, Delhi",
  "Karol Bagh, Delhi",
  "Rajouri Garden, Delhi",
  "Dwarka, Delhi",
  "Janakpuri, Delhi",
  "Punjabi Bagh, Delhi",
  "Pitampura, Delhi",
  "Rohini, Delhi",
  "Model Town, Delhi",
  "Mayur Vihar, Delhi",
  "Preet Vihar, Delhi",
  "Golf Course Road, Gurgaon",
  "Golf Course Extension Road, Gurgaon",
  "Sohna Road, Gurgaon",
  "MG Road, Gurgaon",
  "DLF Phase 1, Gurgaon",
  "DLF Phase 2, Gurgaon",
  "DLF Phase 3, Gurgaon",
  "DLF Phase 5, Gurgaon",
  "Sushant Lok, Gurgaon",
  "Sector 56, Gurgaon",
  "Sector 57, Gurgaon",
  "Cyber City, Gurgaon",
  "New Gurgaon, Gurgaon",
  "Dwarka Expressway, Gurgaon",
  "Manesar, Gurgaon",
  "Sector 18, Noida",
  "Sector 62, Noida",
  "Sector 76, Noida",
  "Sector 137, Noida",
  "Noida Extension, Greater Noida",
  "Greater Noida West, Greater Noida",
  "Pari Chowk, Greater Noida",
  "Yamuna Expressway, Greater Noida",
  "Indirapuram, Ghaziabad",
  "Vaishali, Ghaziabad",
  "Vasundhara, Ghaziabad",
  "Raj Nagar Extension, Ghaziabad",
  "Crossings Republik, Ghaziabad",
  "Sector 15, Faridabad",
  "Neharpar, Faridabad",
  "Greater Faridabad, Faridabad",
];

export function getLocationSuggestions(query: string, limit = 8) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 3) return [];

  return delhiNcrLocations
    .filter((location) => location.toLowerCase().includes(normalizedQuery))
    .slice(0, limit);
}
