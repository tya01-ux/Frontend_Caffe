import { create } from "zustand";
import { useAuthStore } from "./authStore";

// ============ INTERFACES ============

export interface RankingItem {
  rank: number;
  cafeId: number;
  name: string;
  score: number;
}

export type SPKMethod = "SAW" | "WP" | "TOPSIS";

export interface SPKResult {
  method: SPKMethod;
  tenantId: number;
  total: number;
  ranking: RankingItem[];
}

export interface SPKAllResult {
  tenantId: number;
  SAW: RankingItem[];
  WP: RankingItem[];
  TOPSIS: RankingItem[];
}

// ============ STATE ============

interface SPKState {
  result: SPKResult | null;
  allResult: SPKAllResult | null;
  currentMethod: SPKMethod | null;
  isCalculating: boolean;
  error: string | null;

  calculateSAW: (tenantId: number) => Promise<boolean>;
  calculateWP: (tenantId: number) => Promise<boolean>;
  calculateTOPSIS: (tenantId: number) => Promise<boolean>;
  calculateAll: (tenantId: number) => Promise<boolean>;
  clearResult: () => void;
  clearError: () => void;
}

// Strore
const API_URL = "http://localhost:3000/spk";

// Baca token langsung dari authStore state (bukan localStorage)
// supaya selalu dapat token terbaru setelah login
function authHeaders() {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const useSPKStore = create<SPKState>((set) => ({
  result: null,
  allResult: null,
  currentMethod: null,
  isCalculating: false,
  error: null,

  clearError: () => set({ error: null }),

  clearResult: () =>
    set({
      result: null,
      allResult: null,
      currentMethod: null,
    }),

  calculateSAW: async (tenantId) => {
    set({ isCalculating: true, error: null, result: null });
    try {
      const res = await fetch(`${API_URL}/saw/${tenantId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ result: data, currentMethod: "SAW", isCalculating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal menghitung SAW", isCalculating: false });
      return false;
    }
  },

  calculateWP: async (tenantId) => {
    set({ isCalculating: true, error: null, result: null });
    try {
      const res = await fetch(`${API_URL}/wp/${tenantId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ result: data, currentMethod: "WP", isCalculating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal menghitung WP", isCalculating: false });
      return false;
    }
  },

  calculateTOPSIS: async (tenantId) => {
    set({ isCalculating: true, error: null, result: null });
    try {
      const res = await fetch(`${API_URL}/topsis/${tenantId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ result: data, currentMethod: "TOPSIS", isCalculating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal menghitung TOPSIS", isCalculating: false });
      return false;
    }
  },

  calculateAll: async (tenantId) => {
    set({ isCalculating: true, error: null, allResult: null });
    try {
      const res = await fetch(`${API_URL}/all/${tenantId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ allResult: data, currentMethod: null, isCalculating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal menghitung semua metode", isCalculating: false });
      return false;
    }
  },
}));