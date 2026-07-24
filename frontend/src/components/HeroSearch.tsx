"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLocationSuggestions } from "@/lib/locationSuggestions";

const cities = [
  "All Cities",
  "Gurgaon",
  "Delhi",
  "Noida",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
];

// Delhi NCR localities used for the search autocomplete dropdown.
// Shown when the user types at least 3 characters in the main search input.
const delhiNcrLocations = [
  // South & Central Delhi
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
  // Gurgaon
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
  // Noida & Greater Noida
  "Sector 18, Noida",
  "Sector 62, Noida",
  "Sector 76, Noida",
  "Sector 137, Noida",
  "Noida Extension, Greater Noida",
  "Greater Noida West, Greater Noida",
  "Pari Chowk, Greater Noida",
  "Yamuna Expressway, Greater Noida",
  // Ghaziabad
  "Indirapuram, Ghaziabad",
  "Vaishali, Ghaziabad",
  "Vasundhara, Ghaziabad",
  "Raj Nagar Extension, Ghaziabad",
  "Crossings Republik, Ghaziabad",
  // Faridabad
  "Sector 15, Faridabad",
  "Neharpar, Faridabad",
  "Greater Faridabad, Faridabad",
];

const budgetRanges = {
  buy: [
    "Under ₹50 Lac",
    "₹50 Lac - ₹1 Cr",
    "₹1 Cr - ₹2 Cr",
    "₹2 Cr - ₹5 Cr",
    "₹5 Cr+",
  ],
  rent: [
    "Under ₹10,000",
    "₹10,000 - ₹25,000",
    "₹25,000 - ₹50,000",
    "₹50,000 - ₹1,00,000",
    "₹1,00,000+",
  ],
};

const propertyTypes = [
  "Apartment",
  "Villa",
  "Builder Floor",
  "Penthouse",
  "Office Space",
  "Shop",
];

// Real configuration options (BHK) — shown alongside Budget so buyers can
// filter by home size, not just price. Value = minimum bedrooms passed to search.
const configurations: { label: string; value: string }[] = [
  { label: "1 BHK", value: "1" },
  { label: "2 BHK", value: "2" },
  { label: "3 BHK", value: "3" },
  { label: "4 BHK", value: "4" },
  { label: "5+ BHK", value: "5" },
];

const possessionStatuses = [
  "Ready to Move",
  "Within 1 Year",
  "Within 3 Years",
  "Under Construction",
];

export default function HeroSearch({
  onTabChange,
}: {
  onTabChange?: (tab: string) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "buy" | "rent" | "projects" | "plot" | "commercial"
  >("buy");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedPossession, setSelectedPossession] = useState("");

  // Location autocomplete (Delhi NCR) — appears at 3+ characters
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const locationSuggestions = getLocationSuggestions(searchQuery);

  // Notify parent of tab changes
  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab);
    }
  }, [activeTab, onTabChange]);

  // Dropdown visibility
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] =
    useState(false);
  const [showPossessionDropdown, setShowPossessionDropdown] = useState(false);

  // Refs for closing dropdowns on outside click
  const cityRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const propertyTypeRef = useRef<HTMLDivElement>(null);
  const possessionRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node))
        setShowCityDropdown(false);
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node))
        setShowBudgetDropdown(false);
      if (configRef.current && !configRef.current.contains(e.target as Node))
        setShowConfigDropdown(false);
      if (
        propertyTypeRef.current &&
        !propertyTypeRef.current.contains(e.target as Node)
      )
        setShowPropertyTypeDropdown(false);
      if (
        possessionRef.current &&
        !possessionRef.current.contains(e.target as Node)
      )
        setShowPossessionDropdown(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Placeholder Animation
  const placeholders = [
    "Search by Project...",
    "Search by Locality...",
    "Search by Landmark...",
    "Search by City...",
  ];
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "buy", label: "Buy" },
    { id: "rent", label: "Rent" },
    { id: "projects", label: "Projects" },
    { id: "plot", label: "Plot & Land" },
    { id: "commercial", label: "Commercial" },
  ];

  // Reset filters when switching tabs
  useEffect(() => {
    setSelectedBudget("");
    setSelectedConfig("");
    setSelectedPropertyType("");
    setSelectedPossession("");
  }, [activeTab]);

  const handleSearch = () => {
    setShowSuggestions(false);
    // Navigate to buy or rent page with filters
    const target = activeTab === "rent" ? "/rent" : "/buy";
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
      params.set("location", searchQuery);
    }
    if (selectedCity !== "All Cities") params.set("city", selectedCity);
    
    let rawMinPrice = "";
    let rawMaxPrice = "";
    if (selectedBudget) {
      if (selectedBudget === "Under ₹50 Lac") { rawMaxPrice = "5000000"; }
      else if (selectedBudget === "₹50 Lac - ₹1 Cr") { rawMinPrice = "5000000"; rawMaxPrice = "10000000"; }
      else if (selectedBudget === "₹1 Cr - ₹2 Cr") { rawMinPrice = "10000000"; rawMaxPrice = "20000000"; }
      else if (selectedBudget === "₹2 Cr - ₹5 Cr") { rawMinPrice = "20000000"; rawMaxPrice = "50000000"; }
      else if (selectedBudget === "₹5 Cr+") { rawMinPrice = "50000000"; }
      else if (selectedBudget === "Under ₹10,000") { rawMaxPrice = "10000"; }
      else if (selectedBudget === "₹10,000 - ₹25,000") { rawMinPrice = "10000"; rawMaxPrice = "25000"; }
      else if (selectedBudget === "₹25,000 - ₹50,000") { rawMinPrice = "25000"; rawMaxPrice = "50000"; }
      else if (selectedBudget === "₹50,000 - ₹1,00,000") { rawMinPrice = "50000"; rawMaxPrice = "100000"; }
      else if (selectedBudget === "₹1,00,000+") { rawMinPrice = "100000"; }
    }
    
    if (rawMinPrice) params.set("minPrice", rawMinPrice);
    if (rawMaxPrice) params.set("maxPrice", rawMaxPrice);

    // Configuration (BHK) → bedrooms filter
    if (selectedConfig) params.set("bedrooms", selectedConfig);

    // Derive propertyType from tab when not explicitly selected from dropdown
    let effectivePropertyType = selectedPropertyType;
    if (!effectivePropertyType) {
      if (activeTab === "plot") effectivePropertyType = "Plot";
      else if (activeTab === "commercial") effectivePropertyType = "Commercial";
    }
    if (effectivePropertyType) {
      params.set("propertyType", effectivePropertyType);
      params.set("type", effectivePropertyType);
    }
    if (selectedPossession) params.set("possession", selectedPossession);

    const queryString = params.toString();
    router.push(queryString ? `${target}?${queryString}` : target);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full max-w-full mt-8 mb-8 md:mt-20 md:mb-20 relative z-20">
      {/* Tabs */}
      <div className="grid grid-cols-5 bg-slate-900/80 backdrop-blur-md rounded-t-lg border-b border-white/10 overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`min-w-0 flex items-center justify-center gap-1 px-1.5 py-2.5 text-[10px] leading-tight text-center md:gap-2 md:px-3 md:py-3 md:text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-slate-900"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Bar Container */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-xl p-1.5 flex flex-col md:flex-row items-center gap-1.5">
        {/* City Selector Dropdown */}
        <div
          ref={cityRef}
          className="relative w-full md:w-auto min-w-[150px] border-b md:border-b-0 md:border-r border-gray-200 px-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg group"
          onClick={() => setShowCityDropdown(!showCityDropdown)}
        >
          <div className="flex items-center justify-between text-gray-700 font-bold text-sm">
            {selectedCity}
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${showCityDropdown ? "rotate-180" : ""}`}
            />
          </div>

          {/* City Dropdown */}
          {showCityDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 max-h-64 overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCity(city);
                    setShowCityDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    selectedCity === city
                      ? "text-gold font-semibold bg-gold/5"
                      : "text-gray-700"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Search Input */}
        <div ref={searchRef} className="grow w-full relative flex items-center px-2">
          <Search className="text-gray-400 w-4 h-4 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[currentPlaceholderIndex]}
            className="w-full pl-10 pr-3 py-2.5 outline-none text-gray-700 placeholder-gray-400 text-sm text-ellipsis transition-all duration-500"
          />

          {/* Location Suggestions Dropdown (Delhi NCR) */}
          {showSuggestions && searchQuery.trim().length >= 3 && (
            <div className="absolute top-full left-2 right-2 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 max-h-72 overflow-y-auto">
              {locationSuggestions.length > 0 ? (
                locationSuggestions.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSearchQuery(loc);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MapPin size={15} className="text-gold shrink-0" />
                    <span className="truncate">{loc}</span>
                  </button>
                ))
              ) : (
                <p className="px-4 py-2.5 text-sm text-gray-400">
                  No locations found in Delhi NCR
                </p>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full md:w-auto bg-gold hover:bg-gold-hover text-accent-dark font-semibold px-7 py-3 rounded-lg transition-colors shadow-md uppercase tracking-wide text-xs md:text-sm"
        >
          Search
        </button>
      </div>

      {/* Secondary Filters Row */}
      <div className="flex gap-3 mt-3 px-1.5 flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar pb-1">
        {/* Budget Dropdown */}
        <div ref={budgetRef} className="relative">
          <button
            onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
            className="bg-white px-5 py-2.5 rounded-lg shadow-md text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            {selectedBudget || "Budget"}
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${showBudgetDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showBudgetDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
              {(activeTab === "rent"
                ? budgetRanges.rent
                : budgetRanges.buy
              ).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedBudget(selectedBudget === range ? "" : range);
                    setShowBudgetDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    selectedBudget === range
                      ? "text-gold font-semibold bg-gold/5"
                      : "text-gray-700"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Configuration (BHK) Dropdown - Hidden for Plot & Commercial */}
        {activeTab !== "plot" && activeTab !== "commercial" && (
          <div ref={configRef} className="relative">
            <button
              onClick={() => setShowConfigDropdown(!showConfigDropdown)}
              className="bg-white px-5 py-2.5 rounded-lg shadow-md text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              {configurations.find((c) => c.value === selectedConfig)?.label ||
                "Configuration"}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${showConfigDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showConfigDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                {configurations.map((config) => (
                  <button
                    key={config.value}
                    onClick={() => {
                      setSelectedConfig(
                        selectedConfig === config.value ? "" : config.value,
                      );
                      setShowConfigDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedConfig === config.value
                        ? "text-gold font-semibold bg-gold/5"
                        : "text-gray-700"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Type Dropdown - Hidden for Plot & Land */}
        {activeTab !== "plot" && (
          <div ref={propertyTypeRef} className="relative">
            <button
              onClick={() =>
                setShowPropertyTypeDropdown(!showPropertyTypeDropdown)
              }
            className="bg-white px-5 py-2.5 rounded-lg shadow-md text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              {selectedPropertyType || "Property Type"}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${showPropertyTypeDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showPropertyTypeDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedPropertyType(
                        selectedPropertyType === type ? "" : type,
                      );
                      setShowPropertyTypeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedPropertyType === type
                        ? "text-gold font-semibold bg-gold/5"
                        : "text-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Possession Status Dropdown - Hidden when Rent tab is active */}
        {activeTab !== "rent" && (
          <div ref={possessionRef} className="relative">
            <button
              onClick={() => setShowPossessionDropdown(!showPossessionDropdown)}
              className="bg-white px-5 py-2.5 rounded-lg shadow-md text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              {selectedPossession || "Possession Status"}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${showPossessionDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showPossessionDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                {possessionStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedPossession(
                        selectedPossession === status ? "" : status,
                      );
                      setShowPossessionDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedPossession === status
                        ? "text-gold font-semibold bg-gold/5"
                        : "text-gray-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
