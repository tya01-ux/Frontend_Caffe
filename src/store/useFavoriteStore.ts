import { create } from "zustand";

export interface Favorite {
  id: number;
  userId: number;
  cafeId: number;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  cafe: {
    id: number;
    name: string;
    image: string | null;
    lokasi: string | null;
    address: string;
    tenantId: number;
    tenant?: {
      id: number;
      name: string;
    };
  };
}

export interface FavoriteInput {
  userId: number;
  cafeId: number;
}

interface FavoriteState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  // fetchFavorites(userId) -> ambil favorit milik user tertentu
  fetchFavorites: (userId: number) => Promise<void>;
  // fetchAllFavorites() -> ambil semua favorit (admin/global)
  fetchAllFavorites: () => Promise<void>;
  addFavorite: (data: FavoriteInput) => Promise<boolean>;
  // removeFavorite(userId, cafeId) -> hapus berdasarkan kombinasi user+cafe
  removeFavorite: (userId: number, cafeId: number) => Promise<boolean>;
  removeFavoriteById: (id: number) => Promise<boolean>;
  clearError: () => void;

  // Helpers
  isFavorited: (userId: number, cafeId: number) => boolean;
  getFavoritesByUser: (userId: number) => Favorite[];
}

const API_URL = "http://localhost:3000/favorites";

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchFavorites: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/user/${userId}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ favorites: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch favorites", isLoading: false });
    }
  },

  fetchAllFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ favorites: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed fetch favorites", isLoading: false });
    }
  },

  addFavorite: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        favorites: [...state.favorites, result.data],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed add favorite", isLoading: false });
      return false;
    }
  },

  removeFavorite: async (userId, cafeId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/by-user-cafe`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cafeId }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        favorites: state.favorites.filter(
          (f) => !(f.userId === userId && f.cafeId === cafeId)
        ),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed remove favorite", isLoading: false });
      return false;
    }
  },

  removeFavoriteById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Failed remove favorite", isLoading: false });
      return false;
    }
  },

  // Helpers
  isFavorited: (userId, cafeId) =>
    get().favorites.some((f) => f.userId === userId && f.cafeId === cafeId),

  getFavoritesByUser: (userId) =>
    get().favorites.filter((f) => f.userId === userId),
}));