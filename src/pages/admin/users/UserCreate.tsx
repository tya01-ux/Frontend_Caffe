import React, { useState } from "react";
import { X, Loader2, ShieldCheck, UserCircle, KeyRound } from "lucide-react";
import { useUserStore } from "../../../store/useUserStore";
import type { UserInput } from "../../../store/useUserStore";

type RoleType = "ADMIN" | "USER";

interface UserCreateModalProps {
  onClose: () => void;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({ onClose }) => {
  const { isLoading, error, createUser } = useUserStore();

  const [formData, setFormData] = useState<UserInput>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createUser(formData);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
          <h2 className="font-black text-[#3E2C23] text-xl">Tambah User Baru</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nama */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Nama *</label>
            <input
              type="text"
              required
              placeholder="Nama lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Email *</label>
            <input
              type="email"
              required
              placeholder="email@contoh.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Password *</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
              />
            </div>
          </div>

          {/* No HP */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">No HP</label>
            <input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Role *</label>
            <div className="flex gap-2">
              {(["USER", "ADMIN"] as RoleType[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border-2 ${
                    formData.role === r
                      ? r === "ADMIN"
                        ? "bg-[#FFF4E8] border-[#C97A2B] text-[#C97A2B]"
                        : "bg-blue-50 border-blue-400 text-blue-700"
                      : "bg-[#FAF8F5] border-[#E8DED5] text-[#8B735C]"
                  }`}
                >
                  {r === "ADMIN" ? <ShieldCheck size={13} /> : <UserCircle size={13} />}
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">⚠ {error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-[#E8DED5] text-[#6F4E37] font-semibold hover:bg-[#F8F4EF] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Simpan User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal;