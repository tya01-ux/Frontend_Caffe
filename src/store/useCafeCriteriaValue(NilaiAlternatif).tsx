import { create } from "zustand";

export interface CafeCriteriaValue {
  id: number;
  cafeId: number;
  criteriaId: number;
  value: number;
  cafe: {
    id: number;
    name: string;
    tenantId: number;
  };
  criteria: {
    id: number;
    code: string;
    name: string;
    type: "COST" | "BENEFIT";
    weight: number;
    tenantId: number;
  };
}

export interface CafeCriteriaValueInput {
  cafeId: number;
  criteriaId: number;
  value: number;
}

interface CafeCriteriaValueState {
  values: CafeCriteriaValue[];
  isLoading: boolean;
  error: string | null;

  fetchValues: () => Promise<void>;
  createValue: (data: CafeCriteriaValueInput) => Promise<boolean>;
  updateValue: (id: number, value: number) => Promise<boolean>;
  deleteValue: (id: number) => Promise<boolean>;
  clearError: () => void;

  // Helpers
  getValuesByTenant: (tenantId: number) => CafeCriteriaValue[];
  getValuesByCafe: (cafeId: number) => CafeCriteriaValue[];
  getValueByCafeAndCriteria: (cafeId: number, criteriaId: number) => CafeCriteriaValue | undefined;
}

const API_URL = "http://localhost:3000/cafe-values";

export const useCafeCriteriaValueStore = create<CafeCriteriaValueState>((set, get) => ({
  values: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchValues: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ values: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch values", isLoading: false });
    }
  },

  createValue: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchValues();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed create value", isLoading: false });
      return false;
    }
  },

  updateValue: async (id, value) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        values: state.values.map((v) =>
          v.id === id ? { ...v, value: result.data.value } : v
        ),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed update value", isLoading: false });
      return false;
    }
  },

  deleteValue: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        values: state.values.filter((v) => v.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed delete value", isLoading: false });
      return false;
    }
  },

  // Helpers
  getValuesByTenant: (tenantId) =>
    get().values.filter((v) => v.cafe.tenantId === tenantId),

  getValuesByCafe: (cafeId) =>
    get().values.filter((v) => v.cafeId === cafeId),

  getValueByCafeAndCriteria: (cafeId, criteriaId) =>
    get().values.find((v) => v.cafeId === cafeId && v.criteriaId === criteriaId),
}));