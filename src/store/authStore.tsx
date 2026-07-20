import { create } from "zustand";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "USER";
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  updateProfile: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const API_URL = "http://localhost:3000/auth";
const USER_API_URL = "http://localhost:3000/users";

// Ambil data user lama dari localStorage jika ada, biar pas di-refresh ga hilang
const savedUser = localStorage.getItem("user");

export const useAuthStore = create<AuthState>((set, get) => ({
  // FIX: Ambil data user yang sudah di-parse dari string JSON, jika tidak ada baru set null
  user: savedUser ? JSON.parse(savedUser) : null,
  token: localStorage.getItem("token"),

  register: async (data) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Gagal mendaftar akun baru.");
    }
  },

  login: async (data) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Email atau password salah.");
    }

    // FIX: Simpan token DAN objek data user (diubah jadi string) ke local storage
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    // Update global state di Zustand
    set({
      user: result.user,
      token: result.token,
    });

    return result.user;
  },

  updateProfile: async (data) => {
    const { user, token } = get();
    if (!user) throw new Error("Belum login");

    const res = await fetch(`${USER_API_URL}/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Gagal memperbarui profil.");
    }

    // Gabungkan data lama dengan data baru, lalu simpan ulang ke localStorage + state
    const updatedUser = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: () => {
    // FIX: Bersihkan semua jejak login dari penyimpanan lokal browser
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Bersihkan state global
    set({
      user: null,
      token: null,
    });
  },
}));