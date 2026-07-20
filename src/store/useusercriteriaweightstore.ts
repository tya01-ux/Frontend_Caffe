import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface UserCriteriaWeight {
  id: number;
  userId: number;
  tenantId: number;
  criteriaId: number;
  weight: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  tenant?: {
    id: number;
    name: string;
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

export interface WeightItemInput {
  criteriaId: number;
  weight: number;
}

export interface BulkSetWeightsInput {
  userId: number;
  tenantId: number;
  weights: WeightItemInput[];
}

export interface UserCriteriaWeightInput {
  userId: number;
  tenantId: number;
  criteriaId: number;
  weight: number;
}

interface UserCriteriaWeightState {
  weights: UserCriteriaWeight[];
  isLoading: boolean;
  error: string | null;

  fetchWeights: (userId: number, tenantId: number) => Promise<void>;
  fetchAllWeights: (filters?: { userId?: number; tenantId?: number }) => Promise<void>;
  setWeights: (data: BulkSetWeightsInput) => Promise<boolean>;
  createWeight: (data: UserCriteriaWeightInput) => Promise<boolean>;
  updateWeight: (id: number, weight: number) => Promise<boolean>;
  deleteWeight: (id: number) => Promise<boolean>;
  resetWeights: (userId: number, tenantId: number) => Promise<boolean>;
  clearError: () => void;

  getWeightByCriteria: (criteriaId: number) => UserCriteriaWeight | undefined;
  getTotalWeight: () => number;
}

const API_URL = "http://localhost:3000/user-criteria-weights";

function authHeaders() {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Parse response dengan aman. Kalau server balikin HTML/non-JSON (server mati,
// salah port, atau kena fallback dari dev server), kita kasih pesan yang jelas
// alih-alih melempar "Unexpected token '<'..." mentah-mentah ke UI.
async function safeParseJson(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const rawText = await res.text().catch(() => "");
    console.error("Respons bukan JSON dari", res.url, "status:", res.status, rawText.slice(0, 300));
    throw new Error(
      `Server tidak mengembalikan JSON (status ${res.status}). ` +
      `Pastikan backend berjalan di ${API_URL.replace("/user-criteria-weights", "")} dan endpoint-nya benar.`
    );
  }

  try {
    return await res.json();
  } catch {
    throw new Error("Gagal membaca respons server (format JSON tidak valid).");
  }
}

export const useUserCriteriaWeightStore = create<UserCriteriaWeightState>((set, get) => ({
  weights: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchWeights: async (userId, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/user/${userId}/tenant/${tenantId}`, {
        headers: authHeaders(),
      });
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal mengambil bobot kriteria");

      set({ weights: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch user criteria weights", isLoading: false });
    }
  },

  fetchAllWeights: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("userId", String(filters.userId));
      if (filters?.tenantId) params.append("tenantId", String(filters.tenantId));

      const query = params.toString();
      const res = await fetch(query ? `${API_URL}?${query}` : API_URL, {
        headers: authHeaders(),
      });
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal mengambil semua bobot kriteria");

      set({ weights: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch all criteria weights", isLoading: false });
    }
  },

  setWeights: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/bulk`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal menyimpan bobot kriteria");

      set({ weights: result.data, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed save criteria weights", isLoading: false });
      return false;
    }
  },

  createWeight: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal membuat bobot kriteria");

      set((state) => ({
        weights: [...state.weights, result.data],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed create criteria weight", isLoading: false });
      return false;
    }
  },

  updateWeight: async (id, weight) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ weight }),
      });
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal memperbarui bobot kriteria");

      set((state) => ({
        weights: state.weights.map((w) =>
          w.id === id ? { ...w, weight: result.data.weight } : w
        ),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed update criteria weight", isLoading: false });
      return false;
    }
  },

  deleteWeight: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal menghapus bobot kriteria");

      set((state) => ({
        weights: state.weights.filter((w) => w.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed delete criteria weight", isLoading: false });
      return false;
    }
  },

  resetWeights: async (userId, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${API_URL}/user/${userId}/tenant/${tenantId}/reset`,
        { method: "DELETE", headers: authHeaders() }
      );
      const result = await safeParseJson(res);

      if (!res.ok) throw new Error(result.message || "Gagal mereset bobot kriteria");

      set({ weights: [], isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed reset criteria weights", isLoading: false });
      return false;
    }
  },

  getWeightByCriteria: (criteriaId) =>
    get().weights.find((w) => w.criteriaId === criteriaId),

  getTotalWeight: () =>
    get().weights.reduce((sum, w) => sum + w.weight, 0),
}));