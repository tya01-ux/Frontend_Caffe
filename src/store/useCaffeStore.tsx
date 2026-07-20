import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface Tenant {
  id: number;
  name: string;
  email?: string;
}

export interface Criteria {
  id: number;
  code: string;
  name: string;
  type: "COST" | "BENEFIT";
  weight: number;
}

export interface CafeValue {
  id: number;
  criteriaId: number;
  value: number;
  criteria?: Criteria;
}

export interface Cafe {
  id: number;
  tenantId: number;
  tenant?: Tenant;
  name: string;
  image: string | null;
  lokasi: string | null;
  address: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  values?: CafeValue[];
}

export interface CafeInput {
  tenantId: number;
  name: string;
  image?: string | null;
  lokasi?: string | null;
  address: string;
  description?: string | null;
}

interface CafeState {
  cafes: Cafe[];
  currentCafe: Cafe | null;
  isLoading: boolean;
  error: string | null;

  fetchCafes: () => Promise<void>;
  fetchCafeById: (id: number) => Promise<void>;
  createCafe: (data: CafeInput) => Promise<boolean>;
  updateCafe: (id: number, data: CafeInput) => Promise<boolean>;
  deleteCafe: (id: number) => Promise<boolean>;
  clearError: () => void;
}

const API_URL = "http://localhost:3000/cafes";

function authHeaders() {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * PENTING: backend (Prisma) mengirim relasi nilai kriteria dengan nama
 * `cafecriteriavalue` (sesuai nama model di schema.prisma), BUKAN `values`.
 * Seluruh frontend (CafeList, CompareModal, dll) sudah terlanjur ditulis
 * memakai `cafe.values`, jadi kita normalisasi di sini SEKALI SAJA supaya
 * komponen lain tidak perlu diubah satu-satu.
 *
 * Fungsi ini juga jaga-jaga terhadap beberapa kemungkinan nama lain
 * (cafeCriteriaValue, CafeCriteriaValue, cafeValues) kalau suatu saat
 * nama relasi di backend berubah.
 */
function normalizeCafe(raw: any): Cafe {
  const rawValues =
    raw?.values ??
    raw?.cafecriteriavalue ??
    raw?.cafeCriteriaValue ??
    raw?.CafeCriteriaValue ??
    raw?.cafeValues ??
    [];

  return {
    ...raw,
    values: rawValues,
  };
}

function normalizeCafeList(rawList: any[]): Cafe[] {
  return (rawList ?? []).map(normalizeCafe);
}

export const useCafeStore = create<CafeState>((set, get) => ({
  cafes: [],
  currentCafe: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCafes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, { headers: authHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      set({ cafes: normalizeCafeList(result.data), isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch cafes", isLoading: false });
    }
  },

  fetchCafeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      set({ currentCafe: normalizeCafe(result.data), isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch cafe", isLoading: false });
    }
  },

  createCafe: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      await get().fetchCafes();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed create cafe", isLoading: false });
      return false;
    }
  },

  updateCafe: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      await get().fetchCafes();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed update cafe", isLoading: false });
      return false;
    }
  },

  deleteCafe: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      set((state) => ({
        cafes: state.cafes.filter((cafe) => cafe.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed delete cafe", isLoading: false });
      return false;
    }
  },
}));