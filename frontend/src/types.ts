export type UserRole = "ADMIN" | "USER" | "STORE_OWNER";

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt?: string;
  storeName?: string | null;
  storeRating?: number | null;
  store?: {
    id: string;
    name: string;
    email: string;
    address: string;
  } | null;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number | null;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AdminMetrics {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface ReviewerRecord {
  ratingId: string;
  score: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

export interface OwnerDashboardData {
  store: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
  stats: {
    averageRating: number;
    totalRatings: number;
    breakdown: Record<number, number>;
  };
  reviewers: ReviewerRecord[];
}
