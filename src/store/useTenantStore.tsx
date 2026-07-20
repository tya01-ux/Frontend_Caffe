import { create } from "zustand";
import { useAuthStore } from "./authStore";

// ============ INTERFACES ============

export interface Cafe {
  id: number;
  name: string;
  image: string | null;
  lokasi: string | null;
  address: string;
  isActive: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Criteria {
  id: number;
  code: string;
  name: string;
  type: "COST" | "BENEFIT";
  weight: number;
}

export interface Tenant {
  id: number;
  name: string;
  address?: string;
  cafes?: Cafe[];
  user?: User;
  criteria?: Criteria[];
}

export interface TenantInput {
  name: string;
  address?: string;
}

// ============ STATE ============

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;

  fetchTenants: () => Promise<void>;
  fetchTenantById: (id: number) => Promise<void>;
  createTenant: (data: TenantInput) => Promise<boolean>;
  updateTenant: (id: number, data: TenantInput) => Promise<boolean>;
  deleteTenant: (id: number) => Promise<boolean>;
  clearError: () => void;
}

// ============ STORE ============

const API_URL = "http://localhost:3000/tenants";

// Baca token langsung dari authStore state (bukan localStorage langsung)
function authHeaders() {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenants: [],
  currentTenant: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTenants: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        headers: authHeaders(),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ tenants: result, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Gagal mengambil data tenant", isLoading: false });
    }
  },

  fetchTenantById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: authHeaders(),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ currentTenant: result, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Gagal mengambil detail tenant", isLoading: false });
    }
  },

  createTenant: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchTenants();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal membuat tenant", isLoading: false });
      return false;
    }
  },

  updateTenant: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchTenants();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal update tenant", isLoading: false });
      return false;
    }
  },

  deleteTenant: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        tenants: state.tenants.filter((t) => t.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal menghapus tenant", isLoading: false });
      return false;
    }
  },
}));