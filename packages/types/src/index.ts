// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  ARTIST = "artist",
  BUYER = "buyer",
  ADMIN = "admin",
}

export enum EditionType {
  UNIQUE = "unique",
  LIMITED = "limited",
  OPEN = "open",
}

export enum ArtworkStatus {
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  LIVE = "live",
  SOLD = "sold",
  REJECTED = "rejected",
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  FULFILLED = "fulfilled",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum Medium {
  PAINTING = "painting",
  SCULPTURE = "sculpture",
  PHOTOGRAPHY = "photography",
  PRINT = "print",
  DIGITAL = "digital",
  DRAWING = "drawing",
  MIXED_MEDIA = "mixed_media",
  OTHER = "other",
}

// ─── User & Profiles ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  clerkId: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type ArtistStatus = "pending" | "approved" | "rejected";

export interface ArtistProfile {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  instagramHandle: string | null;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  status: ArtistStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  shippingAddress: ShippingAddress | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ─── Artworks ─────────────────────────────────────────────────────────────────

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  medium: Medium;
  width: number | null;
  height: number | null;
  depth: number | null;
  dimensionUnit: "cm" | "in";
  year: number | null;
  price: number;
  editionType: EditionType;
  editionTotal: number | null;
  editionNumber: number | null;
  status: ArtworkStatus;
  artistId: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtworkImage {
  id: string;
  artworkId: string;
  url: string;
  publicId: string;
  order: number;
  width: number | null;
  height: number | null;
}

export interface ArtworkWithRelations extends Artwork {
  images: ArtworkImage[];
  artist: ArtistProfile;
  _count?: {
    savedBy: number;
  };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  buyerId: string;
  artworkId: string;
  status: OrderStatus;
  subtotal: number;
  platformFee: number;
  artistPayout: number;
  shippingAddress: ShippingAddress;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithRelations extends Order {
  artwork: ArtworkWithRelations;
  buyer: User;
}

// ─── Saved Works ──────────────────────────────────────────────────────────────

export interface SavedWork {
  id: string;
  buyerId: string;
  artworkId: string;
  createdAt: Date;
}

export interface SavedWorkWithRelations extends SavedWork {
  artwork: ArtworkWithRelations;
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  buyerId: string;
  artworkId: string;
  amount: number;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface ArtworkViewEvent {
  id: string;
  artworkId: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ArtistAnalyticsSummary {
  artworkId: string;
  title: string;
  views: number;
  saves: number;
  revenue: number;
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Browse / Filter Params ───────────────────────────────────────────────────

export interface ArtworkFilterParams {
  query?: string;
  medium?: Medium[];
  minPrice?: number;
  maxPrice?: number;
  size?: "small" | "medium" | "large";
  availability?: "available" | "sold";
  artistId?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "most_saved";
  page?: number;
  limit?: number;
}
