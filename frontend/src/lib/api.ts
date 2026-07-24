import { Property, PropertyType, PropertyStatus, ContactFormSubmission, Blog, Inquiry, DashboardStats } from "../types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rupalihomes.com";

export function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("adminToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ─── Property API (Real Backend) ────────────────────────────────────────

function normalizePropertyStatus(status: unknown): PropertyStatus {
  if (!status) return PropertyStatus.AVAILABLE;
  const normalized = String(status).toUpperCase();
  if (Object.values(PropertyStatus).includes(normalized as PropertyStatus)) {
    return normalized as PropertyStatus;
  }
  return PropertyStatus.AVAILABLE;
}

type PropertySearchFilters = {
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  propertyCategory?: string;
  bedrooms?: number;
};

function matchesClientFilters(property: Property, filters?: PropertySearchFilters): boolean {
  if (!filters) return true;
  if (filters.type && property.type !== filters.type) return false;

  const query = (filters.search || filters.location || "").trim().toLowerCase();
  if (query) {
    const searchable = [
      property.title,
      property.description,
      property.location,
      property.city,
      property.microMarket,
      property.locality,
      property.propertyCategory,
      property.buildingType,
      property.tags,
    ].filter(Boolean).join(" ").toLowerCase();
    if (!searchable.includes(query)) return false;
  }

  if (filters.propertyCategory && filters.propertyCategory !== "Any Type") {
    const category = filters.propertyCategory.toLowerCase();
    const propertyCategory = `${property.propertyCategory || ""} ${property.buildingType || ""}`.toLowerCase();
    if (!propertyCategory.includes(category)) return false;
  }

  if (filters.bedrooms !== undefined && (property.bedrooms ?? 0) < filters.bedrooms) return false;

  const amount = filters.type === PropertyType.RENT ? property.rentAmount : property.price;
  if (filters.minPrice !== undefined && (amount === undefined || amount < filters.minPrice)) return false;
  if (filters.maxPrice !== undefined && (amount === undefined || amount > filters.maxPrice)) return false;

  return true;
}

/** Admin list: all statuses from the backend. */
export async function fetchAdminProperties(
  page = 0,
  size = 100,
): Promise<{ content: Property[]; totalPages: number; totalElements: number }> {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));

    const res = await fetch(`${API_URL}/admin/properties?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const rawContent = Array.isArray(data) ? data : data.content || [];
    const content: Property[] = rawContent.map(mapPropertyFromBackend);

    return {
      content,
      totalPages: data.totalPages || 1,
      totalElements: data.totalElements || content.length,
    };
  } catch (error) {
    console.error("Failed to fetch admin properties:", error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}

export async function fetchProperties(
  page = 0,
  size = 12,
  filters?: PropertySearchFilters
): Promise<{ content: Property[]; totalPages: number; totalElements: number }> {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (filters?.type) params.set("type", filters.type);
    if (filters?.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.location) params.set("location", filters.location);
    if (filters?.search) {
      params.set("search", filters.search);
      // Keep location populated for older backend deployments while the new
      // full-text search endpoint is rolled out.
      if (!filters.location) params.set("location", filters.search);
    }
    if (filters?.propertyCategory && filters.propertyCategory !== "Any Type") params.set("propertyCategory", filters.propertyCategory);
    if (filters?.bedrooms !== undefined) params.set("bedrooms", String(filters.bedrooms));
    if (filters?.bedrooms !== undefined) params.set("minBedrooms", String(filters.bedrooms));

    const res = await fetch(`${API_URL}/properties?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const backendReturnedArray = Array.isArray(data);
    const rawContent = backendReturnedArray ? data : (data.content || []);
    const mappedContent: Property[] = rawContent.map(mapPropertyFromBackend);
    const filteredContent = backendReturnedArray
      ? mappedContent.filter((property) => matchesClientFilters(property, filters))
      : mappedContent;
    const totalElements = Number(data.totalElements ?? filteredContent.length);
    const totalPages = Number(data.totalPages ?? Math.max(1, Math.ceil(totalElements / size)));
    const content = backendReturnedArray
      ? filteredContent.slice(page * size, page * size + size)
      : filteredContent;

    return {
      content,
      totalPages,
      totalElements,
    };
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}

export async function fetchPropertyById(id: string | number): Promise<Property | null> {
  try {
    const res = await fetch(`${API_URL}/properties/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return mapPropertyFromBackend(data);
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return null;
  }
}

// Admin: Create Property
export async function createProperty(property: Partial<Property>): Promise<Property | null> {
  try {
    const res = await fetch(`${API_URL}/admin/properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(buildPropertyPayload(property)),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Create property failed:", errorText);
      return null;
    }
    const data = await res.json();
    return mapPropertyFromBackend(data);
  } catch (error) {
    console.error("Failed to create property:", error);
    return null;
  }
}

export type BulkPropertyUploadResult = {
  created: number;
  failed: number;
  errors: string[];
};

export async function bulkUploadProperties(file: File): Promise<BulkPropertyUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/admin/properties/bulk-upload`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Bulk upload failed (HTTP ${res.status})`);
  }
  return res.json();
}

// Admin: Update Property
export async function updateProperty(id: string | number, property: Partial<Property>): Promise<Property | null> {
  try {
    const res = await fetch(`${API_URL}/admin/properties/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        ...buildPropertyPayload(property),
        status: property.status,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Update property failed:", errorText);
      return null;
    }
    const data = await res.json();
    return mapPropertyFromBackend(data);
  } catch (error) {
    console.error("Failed to update property:", error);
    return null;
  }
}

// Admin: Delete Property
export async function deleteProperty(id: string | number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/properties/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Failed to delete property:", error);
    return false;
  }
}

// ─── Dashboard API (fixed: /admin/dashboard instead of /super-admin) ─

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

// ─── Helper: Build property payload for create/update ────────────────

function buildPropertyPayload(property: Partial<Property>) {
  return {
    title: property.title,
    description: property.description,
    price: property.price || 0,
    rentAmount: property.rentAmount || 0,
    location: property.location,
    size: property.size || "",
    type: property.type,
    imageUrl: property.imageUrl || "",
    imageGallery: property.imageGallery || "",
    brochureUrl: property.brochureUrl || "",
    bedrooms: property.bedrooms || null,
    bathrooms: property.bathrooms || null,
    sqft: property.sqft || null,
    featured: property.featured || false,
    buildingType: property.buildingType || "",
    propertyCategory: property.propertyCategory || "",
    city: property.city || "",
    microMarket: property.microMarket || "",
    locality: property.locality || "",
    flooring: property.flooring || "",
    floorNumber: property.floorNumber || null,
    totalFloors: property.totalFloors || null,
    unitNumber: property.unitNumber || null,
    availableFrom: property.availableFrom || "",
    tags: property.tags || "",
    furnishingDetails: property.furnishingDetails || "",
    furnishingStatus: property.furnishingStatus || "",
    agentName: property.agentName || "",
    agentPhotoUrl: property.agentPhotoUrl || "",
    amenities: property.amenities || "",
  };
}

// ─── Helper: Map backend DTO → frontend Property ────────────────────

function mapPropertyFromBackend(dto: Record<string, unknown>): Property {
  return {
    id: dto.id as number,
    title: (dto.title as string) || "",
    description: (dto.description as string) || "",
    price: dto.price ? Number(dto.price) : undefined,
    rentAmount: dto.rentAmount ? Number(dto.rentAmount) : undefined,
    location: (dto.location as string) || "",
    size: (dto.size as string) || "",
    type: (dto.type as PropertyType) || PropertyType.SALE,
    status: normalizePropertyStatus(dto.status),
    createdBy: dto.createdBy ? Number(dto.createdBy) : undefined,
    createdAt: dto.createdAt ? String(dto.createdAt) : undefined,
    imageUrl: (dto.imageUrl as string) || undefined,
    imageGallery: (dto.imageGallery as string) || undefined,
    brochureUrl: (dto.brochureUrl as string) || undefined,
    bedrooms: dto.bedrooms ? Number(dto.bedrooms) : undefined,
    bathrooms: dto.bathrooms ? Number(dto.bathrooms) : undefined,
    sqft: dto.sqft ? Number(dto.sqft) : undefined,
    featured: (dto.featured as boolean) || false,
    buildingType: (dto.buildingType as string) || undefined,
    propertyCategory: (dto.propertyCategory as string) || undefined,
    city: (dto.city as string) || undefined,
    microMarket: (dto.microMarket as string) || undefined,
    locality: (dto.locality as string) || undefined,
    flooring: (dto.flooring as string) || undefined,
    floorNumber: dto.floorNumber ? Number(dto.floorNumber) : undefined,
    totalFloors: dto.totalFloors ? Number(dto.totalFloors) : undefined,
    unitNumber: dto.unitNumber ? Number(dto.unitNumber) : undefined,
    availableFrom: (dto.availableFrom as string) || undefined,
    tags: (dto.tags as string) || undefined,
    furnishingDetails: (dto.furnishingDetails as string) || undefined,
    furnishingStatus: (dto.furnishingStatus as string) || undefined,
    agentName: (dto.agentName as string) || undefined,
    agentPhotoUrl: (dto.agentPhotoUrl as string) || undefined,
    amenities: (dto.amenities as string) || undefined,
  };
}

// ─── Default Property (for forms) ───────────────────────────────────────

export const defaultProperty: Property = {
  title: "",
  description: "",
  type: PropertyType.SALE,
  status: PropertyStatus.AVAILABLE,
  location: "",
  price: 0,
  rentAmount: 0,
  size: "",
  imageUrl: "",
  brochureUrl: "",
};

// ─── Contact Form → submits as an inquiry with type "CONTACT" ─────────────

export async function submitContactForm(submission: ContactFormSubmission): Promise<boolean> {
  try {
    const normalUserToken = getNormalUserToken();
    const res = await fetch(
      `${API_URL}${normalUserToken ? "/normal-user/inquiries" : "/inquiries"}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(normalUserToken
          ? { Authorization: `Bearer ${normalUserToken}` }
          : {}),
      },
      body: JSON.stringify({
        name: submission.name,
        phone: submission.phone,
        email: submission.email,
        type: "CONTACT",
        city: submission.location,
        message: submission.message,
      }),
      },
    );
    return res.ok;
  } catch (error) {
    console.error("Failed to submit contact form:", error);
    return false;
  }
}

export async function submitInquiry(inquiry: {
  name: string;
  phone: string;
  email?: string;
  type: string;
  city?: string;
  propertyType?: string;
  message?: string;
}): Promise<boolean> {
  const res = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inquiry),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `Failed to submit inquiry (HTTP ${res.status})`);
  }
  return true;
}

// ─── Visitor identity for the backend-backed like system ────────────────────

let visitorId: string | null = null;

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  if (!visitorId) visitorId = crypto.randomUUID();
  return visitorId;
}

// ─── Like System (DB-backed) ─────────────────────────────────────────────

export async function likeProperty(propertyId: string | number): Promise<boolean> {
  try {
    const visitorId = getVisitorId();
    const res = await fetch(`${API_URL}/likes/${propertyId}?visitorId=${visitorId}`, {
      method: "POST",
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to like property:", error);
    return false;
  }
}

export async function unlikeProperty(propertyId: string | number): Promise<boolean> {
  try {
    const visitorId = getVisitorId();
    const res = await fetch(`${API_URL}/likes/${propertyId}?visitorId=${visitorId}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to unlike property:", error);
    return false;
  }
}

export async function fetchLikedPropertyIds(): Promise<number[]> {
  try {
    const visitorId = getVisitorId();
    const res = await fetch(`${API_URL}/likes?visitorId=${visitorId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch liked IDs:", error);
    return [];
  }
}

export async function fetchLikedProperties(): Promise<Property[]> {
  try {
    const visitorId = getVisitorId();
    const res = await fetch(`${API_URL}/likes/properties?visitorId=${visitorId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(mapPropertyFromBackend);
  } catch (error) {
    console.error("Failed to fetch liked properties:", error);
    return [];
  }
}

// ─── Blog API ───────────────────────────────────────────────────────────

function mapBlogFromBackend(dto: Record<string, unknown>): Blog {
  return {
    id: Number(dto.id),
    title: String(dto.title || ""),
    content: String(dto.content || ""),
    author: String(dto.authorName || dto.author || ""),
    category: String(dto.category || "Real Estate"),
    imageName: dto.imageUrl ? String(dto.imageUrl) : undefined,
    createdAt: dto.createdAt ? String(dto.createdAt) : undefined,
    updatedAt: dto.moderatedAt ? String(dto.moderatedAt) : undefined,
    status: dto.status ? String(dto.status) : undefined,
  };
}

async function fetchBlogPage(
  path: string,
  headers: Record<string, string> = {},
): Promise<Blog[]> {
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch blogs (HTTP ${res.status})`);
  const data = await res.json();
  const content = Array.isArray(data) ? data : data.content || [];
  return content.map(mapBlogFromBackend);
}

export async function fetchBlogs(): Promise<Blog[]> {
  try {
    return await fetchBlogPage("/blogs?page=0&size=100");
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export async function fetchAdminBlogs(): Promise<Blog[]> {
  try {
    return await fetchBlogPage(
      "/admin/blogs?page=0&size=100",
      getAuthHeader(),
    );
  } catch (error) {
    console.error("Failed to fetch admin blogs:", error);
    return [];
  }
}

export async function fetchBlogById(id: number): Promise<Blog | null> {
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`);
    if (!res.ok) return null;
    return mapBlogFromBackend(await res.json());
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}

export async function createBlog(formData: FormData): Promise<Blog | null> {
  try {
    let imageUrl: string | undefined;
    const image = formData.get("image");
    if (image instanceof File && image.size > 0) {
      imageUrl = await uploadImage(image);
    }

    const res = await fetch(`${API_URL}/admin/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        authorName: formData.get("author"),
        title: formData.get("title"),
        content: formData.get("content"),
        imageUrl,
      }),
    });
    if (!res.ok) return null;
    return mapBlogFromBackend(await res.json());
  } catch (error) {
    console.error("Failed to create blog:", error);
    return null;
  }
}

export async function deleteBlog(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Failed to delete blog:", error);
    return false;
  }
}

// ─── Inquiry/Lead API (Real Backend) ─────────────────────────────────────

export async function fetchContactSubmissions(): Promise<Inquiry[]> {
  return fetchInquiries();
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  try {
    const res = await fetch(`${API_URL}/admin/inquiries`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
    return [];
  }
}

export async function deleteInquiry(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/inquiries/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Failed to delete inquiry:", error);
    return false;
  }
}

// ─── Helper: Get admin role from JWT ────────────────────────────────────

export function getAdminRole(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("adminToken");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch {
    return null;
  }
}

// ─── Image Upload API ───────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Upload failed: ${err.error || res.statusText}`);
  }

  const data = await res.json();
  return data.url;
}

// ─── Super Admin API ───────────────────────────────────────────────────

export async function fetchAdmins(): Promise<import("../types").Admin[]> {
  try {
    const res = await fetch(`${API_URL}/super-admin/admins`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error("Failed to fetch admins");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteAdmin(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/super-admin/admins/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createAdmin(data: { name: string; email: string; password: string }): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/super-admin/admins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.ok || res.status === 201;
  } catch (error) {
    console.error("Failed to create admin:", error);
    return false;
  }
}

// ─── Normal User (public visitor) API ────────────────────────────────────
//
// Backs the AuthContext account system with the real Spring Boot backend
// (POST /normal-user/register|login, GET|PUT /normal-user/me). Tokens are
// NORMAL_USER-typed JWTs, kept separate from the admin `adminToken`.

export interface NormalUserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  firebaseUid?: string;
  createdAt: string;
}

export interface NormalUserAuthResult {
  ok: boolean;
  error?: string;
  token?: string;
  user?: NormalUserAccount;
}

const NORMAL_USER_TOKEN_KEY = "rupali_token";

export function getNormalUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NORMAL_USER_TOKEN_KEY);
}

export async function fetchNormalUserInquiries(
  token: string,
): Promise<Inquiry[]> {
  try {
    const res = await fetch(`${API_URL}/normal-user/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch user inquiries:", error);
    return [];
  }
}

function mapNormalUser(dto: Record<string, unknown>): NormalUserAccount {
  return {
    id: String(dto.id ?? ""),
    name: (dto.name as string) || "",
    email: (dto.email as string) || "",
    phone: (dto.phone as string) || "",
    phoneVerified: Boolean(dto.phoneVerified),
    phoneVerifiedAt: dto.phoneVerifiedAt ? String(dto.phoneVerifiedAt) : undefined,
    firebaseUid: dto.firebaseUid ? String(dto.firebaseUid) : undefined,
    createdAt: dto.createdAt ? String(dto.createdAt) : "",
  };
}

// Backend surfaces validation/business errors as { message } or { error }.
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return (data.message as string) || (data.error as string) || fallback;
  } catch {
    return fallback;
  }
}

export async function registerNormalUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  phoneVerified: boolean;
  firebaseUid: string;
}): Promise<NormalUserAuthResult> {
  try {
    const res = await fetch(`${API_URL}/normal-user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { ok: false, error: await readError(res, "Could not create your account. Please try again.") };
    }
    const body = await res.json();
    return { ok: true, token: body.token, user: mapNormalUser(body.user) };
  } catch (error) {
    console.error("Failed to register normal user:", error);
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

export async function loginNormalUser(email: string, password: string): Promise<NormalUserAuthResult> {
  try {
    const res = await fetch(`${API_URL}/normal-user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      return { ok: false, error: await readError(res, "Invalid email or password.") };
    }
    const body = await res.json();
    return { ok: true, token: body.token, user: mapNormalUser(body.user) };
  } catch (error) {
    console.error("Failed to log in normal user:", error);
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

export async function fetchNormalUserProfile(token: string): Promise<NormalUserAccount | null> {
  try {
    const res = await fetch(`${API_URL}/normal-user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return mapNormalUser(await res.json());
  } catch (error) {
    console.error("Failed to fetch normal user profile:", error);
    return null;
  }
}

export async function updateNormalUserProfile(
  token: string,
  data: {
    name?: string;
    phone?: string;
    phoneVerified?: boolean;
    firebaseUid?: string;
  },
): Promise<NormalUserAuthResult> {
  try {
    const res = await fetch(`${API_URL}/normal-user/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { ok: false, error: await readError(res, "Could not update your profile.") };
    }
    return { ok: true, user: mapNormalUser(await res.json()) };
  } catch (error) {
    console.error("Failed to update normal user profile:", error);
    return { ok: false, error: "Network error. Please try again." };
  }
}
