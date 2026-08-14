import {
  Fan,
  Lightbulb,
  Heater,
  CookingPot,
  AirVent,
  Bed,
  DoorClosed,
  Snowflake,
  Tv,
  Sofa,
  Table,
  Refrigerator,
  Microwave,
  WashingMachine,
  Blinds,
  Wind,
  Droplets,
  Laptop,
  Shirt,
  Sparkles,
  Bath,
  Boxes,
  Lamp,
  Sun,
  Flame,
  Armchair,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

// ─── Default Furnishing → Icon Mapping ───────────────────────────────────

export const FURNISHING_ICON_MAP: Record<string, LucideIcon> = {
  Fan: Fan,
  Light: Lightbulb,
  Geyser: Heater,
  "Modular Kitchen": CookingPot,
  Chimney: AirVent,
  Bed: Bed,
  Wardrobe: DoorClosed,
  AC: Snowflake,
  TV: Tv,
  Sofa: Sofa,
  "Dining Table": Table,
  Refrigerator: Refrigerator,
  Microwave: Microwave,
  "Washing Machine": WashingMachine,
  Curtains: Blinds,
  "Exhaust Fan": Wind,
  "Water Purifier": Droplets,
  "Study Table": Laptop,
};

/** The default list of furnishing items admin can pick from */
export const FURNISHING_OPTIONS = Object.keys(FURNISHING_ICON_MAP);

/** Get the icon for a furnishing item. Supports leading count like "1 Fan", "2 Bed". Falls back to Lamp/Sofa. */
export function getFurnishingIcon(name: string): LucideIcon {
  if (!name) return Sofa;
  if (FURNISHING_ICON_MAP[name]) return FURNISHING_ICON_MAP[name];

  // Strip leading count if present e.g. "1 Fan" -> "Fan", "2 Beds" -> "Beds"
  const clean = name.replace(/^\d+\s*/, "").trim();
  if (FURNISHING_ICON_MAP[clean]) return FURNISHING_ICON_MAP[clean];

  // Try matching singular/plural or substring
  const lower = clean.toLowerCase();
  for (const [key, icon] of Object.entries(FURNISHING_ICON_MAP)) {
    const keyLower = key.toLowerCase();
    if (lower === keyLower || lower.startsWith(keyLower) || keyLower.startsWith(lower)) {
      return icon;
    }
  }

  // Reverse lookup if it's an icon name directly from icon picker
  if (FURNISHING_ICON_NAME_MAP[name]) return FURNISHING_ICON_NAME_MAP[name];

  return Sofa;
}

// ─── All Available Icons (for custom furnishing picker) ──────────────────

export const FURNISHING_ICON_PICKER_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Fan", icon: Fan },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Lamp", icon: Lamp },
  { name: "Heater", icon: Heater },
  { name: "CookingPot", icon: CookingPot },
  { name: "AirVent", icon: AirVent },
  { name: "Bed", icon: Bed },
  { name: "DoorClosed", icon: DoorClosed },
  { name: "Snowflake", icon: Snowflake },
  { name: "Tv", icon: Tv },
  { name: "Sofa", icon: Sofa },
  { name: "Armchair", icon: Armchair },
  { name: "Table", icon: Table },
  { name: "Refrigerator", icon: Refrigerator },
  { name: "Microwave", icon: Microwave },
  { name: "WashingMachine", icon: WashingMachine },
  { name: "Blinds", icon: Blinds },
  { name: "Wind", icon: Wind },
  { name: "Droplets", icon: Droplets },
  { name: "Laptop", icon: Laptop },
  { name: "Shirt", icon: Shirt },
  { name: "BookOpen", icon: BookOpen },
  { name: "Sparkles", icon: Sparkles },
  { name: "Flame", icon: Flame },
  { name: "Bath", icon: Bath },
  { name: "Boxes", icon: Boxes },
  { name: "Sun", icon: Sun },
];

/** Reverse lookup: icon name → LucideIcon component */
export const FURNISHING_ICON_NAME_MAP: Record<string, LucideIcon> = Object.fromEntries(
  FURNISHING_ICON_PICKER_OPTIONS.map((o) => [o.name, o.icon])
);
