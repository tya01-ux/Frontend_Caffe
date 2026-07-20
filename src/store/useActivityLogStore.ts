import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ActivityLogInput {
  userId: number;
  action: string;
  entityType: string;
  entityId?: number;
  description: string;
}

interface ActivityLogMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AllLogsFilters {
  userId?: number;
  action?: string;
  entityType?: string;
  limit?: number;
  page?: number;
}

interface ActivityLogState {
  logs: ActivityLog[];
  meta: ActivityLogMeta | null;
  isLoading: boolean;
  error: string | null;

  fetchLogs: (userId: number, limit?: number) => Promise<void>;
  fetchAllLogs: (filters?: AllLogsFilters) => Promise<void>;
  createLog: (data: ActivityLogInput) => Promise<boolean>;
  deleteLog: (id: number) => Promise<boolean>;
  clearError: () => void;

  getLogsByUser: (userId: number) => ActivityLog[];
  getLogsByEntityType: (entityType: string) => ActivityLog[];
}

const API_URL = "http://localhost:3000/activity-logs";

function authHeaders() {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const useActivityLogStore = create<ActivityLogState>((set, get) => ({
  logs: [],
  meta: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchLogs: async (userId, limit) => {
    set({ isLoading: true, error: null });
    try {
      const query = limit ? `?limit=${limit}` : "";
      const res = await fetch(`${API_URL}/user/${userId}${query}`, {
        headers: authHeaders(),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ logs: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch activity logs", isLoading: false });
    }
  },

  fetchAllLogs: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("userId", String(filters.userId));
      if (filters?.action) params.append("action", filters.action);
      if (filters?.entityType) params.append("entityType", filters.entityType);
      if (filters?.limit) params.append("limit", String(filters.limit));
      if (filters?.page) params.append("page", String(filters.page));

      const query = params.toString();
      const res = await fetch(query ? `${API_URL}?${query}` : API_URL, {
        headers: authHeaders(),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ logs: result.data, meta: result.meta || null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch activity logs", isLoading: false });
    }
  },

  createLog: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        logs: [result.data, ...state.logs],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed create activity log", isLoading: false });
      return false;
    }
  },

  deleteLog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        logs: state.logs.filter((l) => l.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed delete activity log", isLoading: false });
      return false;
    }
  },

  getLogsByUser: (userId) => get().logs.filter((l) => l.userId === userId),

  getLogsByEntityType: (entityType) =>
    get().logs.filter((l) => l.entityType === entityType),
}));