import { create } from "zustand";

// ============ INTERFACES ============

export interface Tenant {
  id: number;
  name: string;
  address: string;
}

export type CriteriaType = "COST" | "BENEFIT";

export interface Criteria {
  id: number;
  tenantId: number;
  tenant?: Tenant;
  code: string;
  name: string;
  type: CriteriaType;
  weight: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CriteriaInput {
  tenantId: number;
  code: string;
  name: string;
  type: CriteriaType;
  weight: number;
  description?: string | null;
}

// ============ STATE ============

interface CriteriaState {
  criterias: Criteria[];
  currentCriteria: Criteria | null;
  isLoading: boolean;
  error: string | null;

  fetchCriterias: () => Promise<void>;
  fetchCriteriaById: (id: number) => Promise<void>;
  createCriteria: (data: CriteriaInput) => Promise<boolean>;
  updateCriteria: (id: number, data: CriteriaInput) => Promise<boolean>;
  deleteCriteria: (id: number) => Promise<boolean>;
  clearError: () => void;
}

// ============ STORE ============

const API_URL = "http://localhost:3000/criterias";

export const useCriteriaStore = create<CriteriaState>((set, get) => ({
  criterias: [],
  currentCriteria: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCriterias: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ criterias: result.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Gagal mengambil data kriteria",
        isLoading: false,
      });
    }
  },

  fetchCriteriaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ currentCriteria: result.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Gagal mengambil detail kriteria",
        isLoading: false,
      });
    }
  },

  createCriteria: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchCriterias();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal membuat kriteria", isLoading: false });
      return false;
    }
  },

  updateCriteria: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchCriterias();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal update kriteria", isLoading: false });
      return false;
    }
  },

  deleteCriteria: async (id) => {
  set({ isLoading: true, error: null });
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    await get().fetchCriterias();
    set({ isLoading: false });
    return true;
  } catch (err: any) {
    set({ error: err.message || "Gagal menghapus kriteria", isLoading: false });
    return false;
  }
},
}));
