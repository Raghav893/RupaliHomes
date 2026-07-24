import {
  Waves,
  Dumbbell,
  Car,
  ArrowUpDown,
  Zap,
  Cctv,
  Building,
  TreePine,
  Phone,
  Droplets,
  Baby,
  ShieldCheck,
  Compass,
  Flame,
  Shield,
  Medal,
  Play,
  Store,
  // Extra icons for the admin picker
  Wifi,
  AirVent,
  Bath,
  Bike,
  BookOpen,
  Coffee,
  Dog,
  Flower2,
  Headphones,
  Heart,
  Key,
  Lamp,
  Microwave,
  Mountain,
  Music,
  ParkingCircle,
  Plug,
  Refrigerator,
  Scissors,
  Sun,
  Tv,
  Umbrella,
  UtensilsCrossed,
  Wind,
  type LucideIcon,
} from "lucide-react";

// ─── Default Amenity → Icon Mapping ──────────────────────────────────────

export const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  "Swimming Pool": Waves,
  Gym: Dumbbell,
  Parking: Car,
  Lift: ArrowUpDown,
  "Power Backup": Zap,
  CCTV: Cctv,
  Clubhouse: Building,
  Garden: TreePine,
  Intercom: Phone,
  "Rainwater Harvesting": Droplets,
  "Children's Play Area": Baby,
  Security: ShieldCheck,
  "Vastu Compliant": Compass,
  "Gas Pipeline": Flame,
  "Fire Safety": Shield,
  "Sports Facility": Medal,
  "Jogging Track": Play,
  "Shopping Centre": Store,
};

/** The default list of amenity names admin can pick from */
export const AMENITY_OPTIONS = Object.keys(AMENITY_ICON_MAP);

/** Get the icon for an amenity name. Falls back to ShieldCheck. */
export function getAmenityIcon(name: string): LucideIcon {
  return AMENITY_ICON_MAP[name] || ShieldCheck;
}

// ─── All Available Icons (for the admin custom-amenity picker) ───────────

export const ICON_PICKER_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Waves", icon: Waves },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Car", icon: Car },
  { name: "ArrowUpDown", icon: ArrowUpDown },
  { name: "Zap", icon: Zap },
  { name: "Cctv", icon: Cctv },
  { name: "Building", icon: Building },
  { name: "TreePine", icon: TreePine },
  { name: "Phone", icon: Phone },
  { name: "Droplets", icon: Droplets },
  { name: "Baby", icon: Baby },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Compass", icon: Compass },
  { name: "Flame", icon: Flame },
  { name: "Shield", icon: Shield },
  { name: "Medal", icon: Medal },
  { name: "Play", icon: Play },
  { name: "Store", icon: Store },
  { name: "Wifi", icon: Wifi },
  { name: "AirVent", icon: AirVent },
  { name: "Bath", icon: Bath },
  { name: "Bike", icon: Bike },
  { name: "BookOpen", icon: BookOpen },
  { name: "Coffee", icon: Coffee },
  { name: "Dog", icon: Dog },
  { name: "Flower", icon: Flower2 },
  { name: "Headphones", icon: Headphones },
  { name: "Heart", icon: Heart },
  { name: "Key", icon: Key },
  { name: "Lamp", icon: Lamp },
  { name: "Microwave", icon: Microwave },
  { name: "Mountain", icon: Mountain },
  { name: "Music", icon: Music },
  { name: "ParkingCircle", icon: ParkingCircle },
  { name: "Plug", icon: Plug },
  { name: "Refrigerator", icon: Refrigerator },
  { name: "Scissors", icon: Scissors },
  { name: "Sun", icon: Sun },
  { name: "Tv", icon: Tv },
  { name: "Umbrella", icon: Umbrella },
  { name: "Utensils", icon: UtensilsCrossed },
  { name: "Wind", icon: Wind },
];

/** Reverse lookup: icon name → LucideIcon component */
export const ICON_NAME_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_PICKER_OPTIONS.map((o) => [o.name, o.icon])
);
