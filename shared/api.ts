/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// ─── Auth & User Types ───────────────────────────────────────

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface UsersResponse {
  users: UserRecord[];
}

export interface AuthResponse {
  token: string;
  user: UserRecord;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  password?: string;
}

export interface ApiError {
  error: string;
}

// ─── Lost & Found Types ─────────────────────────────────────

export type ItemStatus = "lost" | "found" | "matched" | "resolved";
export type ItemCategory =
  | "electronics"
  | "clothing"
  | "accessories"
  | "documents"
  | "keys"
  | "bags"
  | "books"
  | "sports"
  | "other";

export interface ItemRecord {
  id: string;
  type: "lost" | "found";
  status: ItemStatus;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  date: string; // ISO date string when lost/found
  imageUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  reportedBy: string; // userId
  reportedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  type: "lost" | "found";
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  date: string;
  imageUrl?: string;
  contactPhone?: string;
}

export interface UpdateItemRequest {
  title?: string;
  description?: string;
  category?: ItemCategory;
  location?: string;
  date?: string;
  imageUrl?: string;
  contactPhone?: string;
  status?: ItemStatus;
}

export interface ItemsResponse {
  items: ItemRecord[];
  total: number;
}

export interface ItemResponse {
  item: ItemRecord;
}

export interface ItemSearchParams {
  q?: string;
  type?: "lost" | "found";
  category?: ItemCategory;
  status?: ItemStatus;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ─── Match Types ─────────────────────────────────────────────

export interface MatchRecord {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItemTitle: string;
  foundItemTitle: string;
  score: number; // 0-100
  reasons: string[];
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

export interface MatchesResponse {
  matches: MatchRecord[];
}

export interface MatchResponse {
  match: MatchRecord;
}

export interface MatchRunResponse {
  matches: MatchRecord[];
  message: string;
}
