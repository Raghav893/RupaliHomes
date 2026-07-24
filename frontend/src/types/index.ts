export enum PropertyType {
  SALE = "SALE",
  RENT = "RENT",
}

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  RENTED = "RENTED",
  HIDDEN = "HIDDEN",
}

// Used by add-brochure page
export enum ProjectType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
}

export enum UnitType {
  STUDIO_APARTMENT = "STUDIO_APARTMENT",
  TWO_BHK = "TWO_BHK",
  TWO_POINT_FIVE_BHK = "TWO_POINT_FIVE_BHK",
  THREE_BHK = "THREE_BHK",
  THREE_POINT_FIVE_BHK = "THREE_POINT_FIVE_BHK",
  FOUR_BHK = "FOUR_BHK",
  FOUR_POINT_FIVE_BHK = "FOUR_POINT_FIVE_BHK",
  FIVE_BHK = "FIVE_BHK",
  PENTHOUSE = "PENTHOUSE",
  DUPLEX_PENTHOUSE = "DUPLEX_PENTHOUSE",
  TRIPLEX_PENTHOUSE = "TRIPLEX_PENTHOUSE",
  VILLA = "VILLA",
  DDJAY_PLOT = "DDJAY_PLOT",
  PLOT = "PLOT",
}

export enum DealType {
  FreshUnit = "FreshUnit",
  ReSale = "ReSale",
}

export enum ProjectStage {
  UnderConstruction = "UnderConstruction",
  RTMI = "RTMI",
  pre_Leased = "pre_Leased",
  NearToPossession = "NearToPossession",
}

export interface Property {
  id?: number;
  title: string;
  description: string;
  price?: number;
  rentAmount?: number;
  location: string;
  size?: string;
  type: PropertyType;
  status: PropertyStatus;

  // Media
  imageUrl?: string;
  imageGallery?: string; // Comma-separated extra images
  brochureUrl?: string;

  // Room details
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  featured?: boolean;

  // Extended real estate fields
  buildingType?: string;
  propertyCategory?: string;
  city?: string;
  microMarket?: string;
  locality?: string;
  flooring?: string;
  floorNumber?: number;
  totalFloors?: number;
  unitNumber?: number;
  availableFrom?: string;
  tags?: string;              // comma-separated highlights
  furnishingDetails?: string; // e.g. "1 Fan, 1 Geyser, 1 Bed"
  furnishingStatus?: string;  // "Semi-Furnished", "Fully Furnished", "Unfurnished"

  // Agent & Amenities
  agentName?: string;
  agentPhotoUrl?: string;
  amenities?: string;         // comma-separated: "Swimming Pool,Gym,Parking"
  reactionsCount?: number;

  createdBy?: number;
  createdAt?: string;

  [key: string]: unknown;
}

export interface ContactFormSubmission {
  name: string;
  phone: string;
  email: string;
  location: string;
  message: string;
}

export interface Blog {
    id?: number;
    title: string;
    content: string;
    author: string;
    category: string;
    imageType?: string;
    imageName?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Inquiry extends ContactFormSubmission {
    id: number;
    type?: string;
    city?: string;
    propertyType?: string;
    alternatePhone?: string;
    createdAt: string;
    status: "NEW" | "CONTACTED" | "CLOSED";
}

export interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    totalSoldProperties: number;
    totalRentedProperties: number;
    totalSalesRevenue: number;
    totalRentalIncome: number;
    totalReactions: number;
}

export interface Admin {
  id: number;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
}
