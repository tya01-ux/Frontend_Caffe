import { create } from "zustand";

// ============ INTERFACES ============

export interface Tenant {
  id: number;
  name: string;
  address: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER";
  tenants: Tenant[]; // 1 user bisa punya banyak tenant (Tenant.userId -> User)
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "ADMIN" | "USER";
  // tenantId dihapus: tidak ada relasi User -> tenantId di schema.
  // Tenant justru yang punya userId (owner), bukan sebaliknya.
}

// ============ STATE ============

interface UserState {
  users: UserData[];
  currentUser: UserData | null;
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (data: UserInput) => Promise<boolean>;
  updateUser: (id: number, data: Partial<UserInput>) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  clearError: () => void;
}

// ============ STORE ============

const API_URL = "http://localhost:3000/users";

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ users: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Gagal mengambil data user", isLoading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set({ currentUser: result.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Gagal mengambil detail user", isLoading: false });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchUsers();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal membuat user", isLoading: false });
      return false;
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      await get().fetchUsers();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal update user", isLoading: false });
      return false;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || "Gagal menghapus user", isLoading: false });
      return false;
    }
  },
}));