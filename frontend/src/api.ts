const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type Params = Record<string, string | undefined>;

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// drops empty values so we don't send ?search=&role=
const toQuery = (params: Params = {}) => {
  const clean = Object.entries(params).filter(([, v]) => v) as [string, string][];
  return clean.length ? "?" + new URLSearchParams(clean) : "";
};

const post = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) });

export const api = {
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/auth/login", post(body)),
  register: (body: { name: string; email: string; password: string; address: string }) =>
    request<{ token: string; user: any }>("/auth/register", post(body)),
  getMe: () => request<{ user: any }>("/auth/me"),
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    request<{ message: string }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getAdminMetrics: () =>
    request<{ totalUsers: number; totalStores: number; totalRatings: number }>("/admin/metrics"),
  getAdminUsers: (params?: Params) => request<{ users: any[] }>("/admin/users" + toQuery(params)),
  createAdminUser: (body: { name: string; email: string; password: string; address: string; role: string }) =>
    request<{ message: string; user: any }>("/admin/users", post(body)),
  getAdminStores: (params?: Params) => request<{ stores: any[] }>("/admin/stores" + toQuery(params)),
  createAdminStore: (body: { name: string; email: string; address: string; ownerId?: string | null }) =>
    request<{ message: string; store: any }>("/admin/stores", post(body)),

  getStores: (params?: Params) => request<{ stores: any[] }>("/stores" + toQuery(params)),
  getStoreById: (id: string) => request<{ store: any }>(`/stores/${id}`),
  submitRating: (body: { storeId: string; score: number }) =>
    request<{
      message: string;
      rating: any;
      storeStats: { averageRating: number; totalRatings: number };
    }>("/ratings", post(body)),

  getOwnerDashboard: () => request("/owner/dashboard"),
  getOwnerReviewers: (params?: Params) =>
    request<{ reviewers: any[] }>("/owner/reviewers" + toQuery(params)),
};
