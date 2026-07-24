"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  Home,
  Bed,
} from "lucide-react";
import { getLocationSuggestions } from "@/lib/locationSuggestions";

export interface SearchFilters {
  location: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
}

// Price range options for buy and rent modes
export const buyPriceRanges = [
  { label: "Under ₹50 Lac", min: undefined, max: 5000000 },
  { label: "₹50 Lac - ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr - ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "₹2 Cr - ₹5 Cr", min: 20000000, max: 50000000 },
  { label: "₹5 Cr+", min: 50000000, max: undefined },
];

export const rentPriceRanges = [
  { label: "Under ₹10,000", min: undefined, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000 - ₹1,00,000", min: 50000, max: 100000 },
  { label: "₹1,00,000+", min: 100000, max: undefined },
];

/** Maps a price range label to numeric min/max values */
export function parsePriceRange(label: string): { min?: number; max?: number } {
  const allRanges = [...buyPriceRanges, ...rentPriceRanges];
  const found = allRanges.find((r) => r.label === label);
  if (found) return { min: found.min, max: found.max };
  return {};
}

/** Reverse-maps numeric min/max to a price range label (for syncing URL params to dropdown) */
export function findPriceRangeLabel(
  minPrice: number | undefined,
  maxPrice: number | undefined,
  mode: "buy" | "rent" = "buy"
): string {
  const ranges = mode === "rent" ? rentPriceRanges : buyPriceRanges;
  const found = ranges.find(
    (r) => (r.min ?? undefined) === minPrice && (r.max ?? undefined) === maxPrice
  );
  return found?.label || "";
}

interface SearchFilterBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  mode?: "buy" | "rent";
}

export default function SearchFilterBar({ onSearch, initialFilters, mode = "buy" }: SearchFilterBarProps) {
  const [location, setLocation] = useState(initialFilters?.location || "");
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || "");
  const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || "");
  const [bedrooms, setBedrooms] = useState(initialFilters?.bedrooms || "");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const priceOptions = mode === "rent" ? rentPriceRanges : buyPriceRanges;
  const locationSuggestions = getLocationSuggestions(location);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync when initialFilters change (e.g. from URL params parsed after mount)
  useEffect(() => {
    if (initialFilters?.location !== undefined) setLocation(initialFilters.location);
    if (initialFilters?.propertyType !== undefined) setPropertyType(initialFilters.propertyType);
    if (initialFilters?.priceRange !== undefined) setPriceRange(initialFilters.priceRange);
    if (initialFilters?.bedrooms !== undefined) setBedrooms(initialFilters.bedrooms);
  }, [initialFilters?.location, initialFilters?.propertyType, initialFilters?.priceRange, initialFilters?.bedrooms]);

  const handleSearch = () => {
    onSearch({ location, propertyType, priceRange, bedrooms });
  };

  // Also trigger search on Enter key in text inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-full shadow-lg border border-gray-100 p-2 flex flex-col md:flex-row items-center gap-1.5 md:gap-2 max-w-6xl mx-auto mt-6 md:mt-8">
      {/* Location */}
      <div className="flex-1 w-full md:w-auto px-3 md:px-6 py-2 border-b md:border-b-0 md:border-r border-gray-100 flex items-center gap-2 md:gap-3">
        <div className="p-2 bg-gray-50 rounded-full text-gray-400">
          <MapPin size={18} />
        </div>
        <div ref={locationRef} className="flex-1 relative">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
            Location
          </p>
          <input
            type="text"
            placeholder="Golf Course Road, Gurgaon"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-medium text-accent-dark placeholder-gray-300 focus:outline-none bg-transparent"
          />
          {showLocationSuggestions && location.trim().length >= 3 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 max-h-72 overflow-y-auto">
              {locationSuggestions.length > 0 ? locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setLocation(suggestion);
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MapPin size={15} className="text-gold shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              )) : (
                <p className="px-4 py-2.5 text-sm text-gray-400">No locations found in Delhi NCR</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Property Type */}
      <div className="flex-1 w-full md:w-auto px-3 md:px-6 py-2 border-b md:border-b-0 md:border-r border-gray-100 flex items-center gap-2 md:gap-3">
        <div className="p-2 bg-gray-50 rounded-full text-gray-400">
          <Home size={18} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
            Property type
          </p>
          <select
            value={propertyType}
            onChange={(e) => {
              const val = e.target.value;
              setPropertyType(val);
              onSearch({ location, propertyType: val, priceRange, bedrooms });
            }}
            className="w-full text-sm font-medium text-accent-dark bg-transparent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Any Type</option>
            <option value="Apartment">Apartments</option>
            <option value="Villa">Villas</option>
            <option value="Builder Floor">Builder Floor</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Plot">Plot & Land</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Price Range - Dropdown */}
      <div className="flex-1 w-full md:w-auto px-3 md:px-6 py-2 border-b md:border-b-0 md:border-r border-gray-100 flex items-center gap-2 md:gap-3">
        <div className="p-2 bg-gray-50 rounded-full text-gray-400">
          <IndianRupee size={18} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
            Budget
          </p>
          <select
            value={priceRange}
            onChange={(e) => {
              const val = e.target.value;
              setPriceRange(val);
              onSearch({ location, propertyType, priceRange: val, bedrooms });
            }}
            className="w-full text-sm font-medium text-accent-dark bg-transparent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Any Budget</option>
            {priceOptions.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="flex-1 w-full md:w-auto px-3 md:px-6 py-2 border-b md:border-b-0 md:border-r border-gray-100 flex items-center gap-2 md:gap-3">
        <div className="p-2 bg-gray-50 rounded-full text-gray-400">
          <Bed size={18} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
            Bedrooms
          </p>
          <select
            value={bedrooms}
            onChange={(e) => {
              const val = e.target.value;
              setBedrooms(val);
              onSearch({ location, propertyType, priceRange, bedrooms: val });
            }}
            className="w-full text-sm font-medium text-accent-dark bg-transparent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-0 md:pl-2 w-full md:w-auto">
        <button
          onClick={handleSearch}
          className="w-full md:w-auto justify-center px-6 md:px-8 py-3 md:py-4 bg-accent-dark text-white rounded-xl md:rounded-full font-medium hover:bg-gold hover:text-accent-dark transition-all shadow-md flex items-center gap-2"
        >
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  );
}


