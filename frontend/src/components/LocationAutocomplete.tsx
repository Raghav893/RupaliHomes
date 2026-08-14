"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectedLocation {
  name: string;
  /** Latitude of the place. Only present if the Mappls key returns coordinates. */
  lat?: number;
  /** Longitude of the place. Only present if the Mappls key returns coordinates. */
  lng?: number;
  city: string;
  state: string;
}

interface LocationResult extends SelectedLocation {
  label: string;
}

// ── Photon (OSM) fallback ────────────────────────────────────────────────
// Kept commented out so we can quickly revert if Mappls' free-tier limits
// prove too restrictive after real usage.
//
// interface PhotonProperties {
//   name?: string;
//   city?: string;
//   state?: string;
//   region?: string;
//   countrycode?: string;
//   osm_value?: string;
// }
//
// const PHOTON_URL = "https://photon.komoot.io/api/";
// const PHOTON_PARAMS = {
//   limit: "8",
//   lat: "28.6139",
//   lon: "77.2090",
//   bbox: "74.5,26.4,82.0,30.95",
// };
//
// const ALLOWED_OSM_VALUES = new Set([
//   "locality",
//   "suburb",
//   "neighbourhood",
//   "quarter",
//   "city",
//   "town",
//   "residential",
// ]);
//
// // Photon spells Haryana "Haryāna" (diacritic). Strip diacritics before matching.
// function normalize(text: string): string {
//   return text
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .toLowerCase()
//     .trim();
// }
//
// function resolveState(props: PhotonProperties): string {
//   const state = normalize(props.state || props.region || "");
//   if (state === "delhi") return "Delhi";
//   if (state === "haryana") return "Haryana";
//   if (state === "uttar pradesh") return "Uttar Pradesh";
//   if (!state) {
//     const city = normalize(props.city || "");
//     if (city === "delhi" || city === "new delhi") return "Delhi";
//   }
//   return "";
// }
//
// function isAllowedType(osmValue?: string): boolean {
//   return ALLOWED_OSM_VALUES.has(normalize(osmValue || ""));
// }

// ── Mappls (MapmyIndia) Autosuggest ──────────────────────────────────────
// Fetched via our same-origin API route (/api/mappls-search) because Mappls'
// search API does not send CORS headers and cannot be called from the browser.
// The route forwards to Mappls server-side and keeps the API key off the client.
const MAPPLS_URL = "/api/mappls-search";
// Bias point = Delhi (28.6139, 77.2090).
//
// NOTE: tested live — the `filter=bounds:...` param degrades result quality on
// this key (it returned irrelevant Rajasthan/Arunachal results instead of
// restricting), and `richData`/`tokenizeAddress` return nothing extra (no
// coordinates, no structured address tokens). So we rely on the `location`
// bias param + client-side state filtering only.
const MAPPLS_LOCATION = "28.6139,77.2090";

const MAX_RESULTS = 8;

// Place types that make sense for property search. Mappls returns POIs
// (restaurants, shops, metro stations, house numbers) that we must exclude.
const ALLOWED_TYPES = new Set([
  "locality",
  "sub_locality",
  "subsublocality",
  "city",
  "village",
]);

interface MapplsAddressTokens {
  locality?: string;
  subLocality?: string;
  subSubLocality?: string;
  village?: string;
  district?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface MapplsLocation {
  eLoc?: string;
  placeName?: string;
  placeAddress?: string;
  type?: string;
  latitude?: number | string;
  longitude?: number | string;
  addressTokens?: MapplsAddressTokens;
}

// Known cities in the Delhi-NCR belt (used to parse the city when the API does
// not return structured address tokens).
const KNOWN_CITIES = new Set([
  "delhi",
  "new delhi",
  "gurgaon",
  "gurugram",
  "noida",
  "greater noida",
  "ghaziabad",
  "faridabad",
  "lucknow",
  "kanpur",
  "meerut",
  "sonipat",
  "rohtak",
  "panipat",
  "karnal",
  "hapur",
  "bulandshahr",
  "aligarh",
  "agra",
  "mathura",
  "muzaffarnagar",
  "rewari",
]);

// Indian state names as they appear in `placeAddress` → target states map.
const STATE_NAMES: Record<string, string> = {
  delhi: "Delhi",
  "new delhi": "Delhi",
  haryana: "Haryana",
  "uttar pradesh": "Uttar Pradesh",
  // Other states: present so we can recognise & reject them.
  "andhra pradesh": "",
  "arunachal pradesh": "",
  assam: "",
  bihar: "",
  chhattisgarh: "",
  goa: "",
  gujarat: "",
  "himachal pradesh": "",
  jharkhand: "",
  karnataka: "",
  kerala: "",
  "madhya pradesh": "",
  maharashtra: "",
  manipur: "",
  meghalaya: "",
  mizoram: "",
  nagaland: "",
  odisha: "",
  orissa: "",
  punjab: "",
  rajasthan: "",
  sikkim: "",
  "tamil nadu": "",
  telangana: "",
  tripura: "",
  uttarakhand: "",
  "west bengal": "",
  chandigarh: "",
  jammu: "",
  "jammu and kashmir": "",
  "ladakh": "",
  "andaman and nicobar islands": "",
};

// Mappls spells Haryana "Haryāna" (diacritic). Strip diacritics before matching.
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseAddressParts(placeAddress?: string): string[] {
  const parts = (placeAddress || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length && /^\d{6}$/.test(parts[parts.length - 1])) parts.pop();
  return parts;
}

// Returns the target state (one of Delhi/Haryana/Uttar Pradesh) or "" when the
// result belongs to some other state or the state cannot be determined. We do
// NOT hard-reject when the state field is missing — same lesson as the Noida bug.
function resolveState(location: MapplsLocation): string {
  const tokenState = normalize(location.addressTokens?.state || "");
  if (tokenState in STATE_NAMES) return STATE_NAMES[tokenState];

  const parts = parseAddressParts(location.placeAddress);
  for (let i = parts.length - 1; i >= 0; i--) {
    const token = normalize(parts[i]);
    if (token in STATE_NAMES) return STATE_NAMES[token];
  }
  return "";
}

function resolveCity(location: MapplsLocation, state: string): string {
  const tokenCity = (location.addressTokens?.city || "").trim();
  if (tokenCity) return tokenCity;

  const parts = parseAddressParts(location.placeAddress);
  for (const part of parts) {
    if (KNOWN_CITIES.has(normalize(part))) return part;
  }
  for (let i = 0; i < parts.length; i++) {
    if (normalize(parts[i]) === normalize(state)) {
      return parts[i - 1] || "";
    }
  }
  return "";
}

interface LocationAutocompleteProps {
  /** Controlled text shown inside the input. */
  value: string;
  /** Called whenever the user types (and when a suggestion is picked, with the display label). */
  onChange: (value: string) => void;
  /** Called with the structured result when the user picks a suggestion. */
  onSelect?: (result: SelectedLocation) => void;
  /** Called on Enter when no suggestion is highlighted (for existing search-on-Enter flows). */
  onEnter?: () => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  containerClassName?: string;
}

const MIN_CHARS = 3;

function buildLabel(
  name: string,
  city: string,
  state: string,
): string {
  const parts = [name];
  if (city && normalize(city) !== normalize(name)) parts.push(city);
  if (
    state &&
    normalize(state) !== normalize(name) &&
    normalize(state) !== normalize(city)
  ) {
    parts.push(state);
  }
  return parts.join(", ");
}

type Status = "idle" | "loading" | "success" | "error";

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  onEnter,
  placeholder,
  id,
  name,
  required,
  disabled,
  inputClassName,
  containerClassName,
}: LocationAutocompleteProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipNextDebounceRef = useRef(false);

  // Debounce input before hitting the API. After a suggestion is picked we skip
  // the next debounce so the display label never triggers a stale lookup.
  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setStatus("loading");
      setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Fetch suggestions from Mappls (via the same-origin proxy route) for the
  // debounced query.
  useEffect(() => {
    const q = debouncedValue.trim();
    if (q.length < MIN_CHARS) return;

    const controller = new AbortController();
    let cancelled = false;

    const params = new URLSearchParams();
    params.set("query", q);
    params.set("location", MAPPLS_LOCATION);

    fetch(`${MAPPLS_URL}?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Mappls returned ${res.status}`);
        return res.json();
      })
      .then((data: { suggestedLocations?: MapplsLocation[] }) => {
        if (cancelled) return;
        const locations = data?.suggestedLocations || [];
        const seen = new Set<string>();
        const filtered: LocationResult[] = [];

        for (const loc of locations) {
          if (!ALLOWED_TYPES.has(normalize(loc.type || ""))) continue;

          const state = resolveState(loc);
          if (!state) continue;

          const name = (loc.placeName || "").trim();
          if (!name) continue;

          const key = loc.eLoc || `${normalize(name)}|${loc.placeAddress || ""}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const city = resolveCity(loc, state);
          const lat = Number(loc.latitude);
          const lng = Number(loc.longitude);
          const addressParts = parseAddressParts(loc.placeAddress);
          const pincode =
            addressParts.length > 0 &&
            /^\d{6}$/.test(addressParts[addressParts.length - 1])
              ? `, ${addressParts[addressParts.length - 1]}`
              : "";
          filtered.push({
            name,
            city,
            state,
            ...(Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : {}),
            label: `${buildLabel(name, city, state)}${pincode}`,
          });

          if (filtered.length >= MAX_RESULTS) break;
        }

        setResults(filtered);
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled || err?.name === "AbortError") return;
        // Fail silently: degrade to a plain text input so the surrounding form
        // never breaks because Mappls is slow, down, or the key is invalid.
        setResults([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedValue]);

  // ── Photon (OSM) fallback — kept commented out for quick revert ────────
  //
  //   useEffect(() => {
  //     const q = debouncedValue.trim();
  //     if (q.length < MIN_CHARS) return;
  //
  //     const controller = new AbortController();
  //     let cancelled = false;
  //
  //     const params = new URLSearchParams({
  //       ...PHOTON_PARAMS,
  //       q,
  //     });
  //
  //     fetch(`${PHOTON_URL}?${params.toString()}`, { signal: controller.signal })
  //       .then((res) => {
  //         if (!res.ok) throw new Error(`Photon returned ${res.status}`);
  //         return res.json();
  //       })
  //       .then((data) => {
  //         if (cancelled) return;
  //         const features = data?.features || [];
  //         const seen = new Set<string>();
  //         const filtered: LocationResult[] = [];
  //
  //         for (const feature of features) {
  //           const props = feature.properties || {};
  //           const coords = feature.geometry?.coordinates;
  //           if (!coords || typeof coords[0] !== "number" || typeof coords[1] !== "number") continue;
  //           if ((props.countrycode || "").toUpperCase() !== "IN") continue;
  //
  //           const state = resolveState(props);
  //           if (!state) continue;
  //           if (!isAllowedType(props.osm_value)) continue;
  //
  //           const city = props.city || "";
  //           const name = (props.name || "").trim();
  //           if (!name) continue;
  //
  //           const key = `${normalize(name)}|${normalize(city)}|${coords[0]}|${coords[1]}`;
  //           if (seen.has(key)) continue;
  //           seen.add(key);
  //
  //           filtered.push({
  //             name,
  //             city,
  //             state,
  //             lat: coords[1],
  //             lng: coords[0],
  //             label: buildLabel(name, city, state),
  //           });
  //
  //           if (filtered.length >= 8) break;
  //         }
  //
  //         setResults(filtered);
  //         setStatus("success");
  //       })
  //       .catch((err) => {
  //         if (cancelled || err?.name === "AbortError") return;
  //         setResults([]);
  //         setStatus("error");
  //       });
  //
  //     return () => {
  //       cancelled = true;
  //       controller.abort();
  //     };
  //   }, [debouncedValue]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const pickResult = (result: LocationResult) => {
    skipNextDebounceRef.current = true;
    onChange(result.label);
    setResults([]);
    setStatus("idle");
    setOpen(false);
    setHighlightedIndex(-1);
    onSelect?.({
      name: result.name,
      lat: result.lat,
      lng: result.lng,
      city: result.city,
      state: result.state,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open && results.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open && results.length > 0) {
        setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      }
    } else if (event.key === "Enter") {
      if (open && highlightedIndex >= 0 && results[highlightedIndex]) {
        event.preventDefault();
        pickResult(results[highlightedIndex]);
      } else if (onEnter) {
        event.preventDefault();
        onEnter();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const listboxId = id ? `${id}-listbox` : "location-autocomplete-listbox";
  const showDropdown =
    open &&
    status !== "idle" &&
    status !== "error" &&
    debouncedValue.trim().length >= MIN_CHARS;

  return (
    <div ref={wrapperRef} className={cn("relative", containerClassName)}>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setOpen(true);
          setHighlightedIndex(-1);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (value.trim().length >= MIN_CHARS) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 max-h-72 overflow-y-auto"
        >
          {status === "loading" && (
            <div className="px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" />
              Searching locations...
            </div>
          )}

          {status === "success" && results.length === 0 && (
            <p className="px-4 py-2.5 text-sm text-gray-400">
              No matching locations found in Delhi NCR
            </p>
          )}

          {status === "success" &&
            results.map((result, index) => (
              <button
                key={`${result.lat}-${result.lng}-${result.label}`}
                type="button"
                role="option"
                aria-selected={highlightedIndex === index}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickResult(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-700 transition-colors",
                  highlightedIndex === index ? "bg-gray-50" : "hover:bg-gray-50",
                )}
              >
                <MapPin size={15} className="text-gold shrink-0" />
                <span className="truncate">{result.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
