import React, { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  X,
  Loader2,
  Coffee,
  Heart,
  Activity,
  MapPin,
  Calculator,
  Clock,
  ChevronRight,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useFavoriteStore } from "../store/useFavoriteStore";
import { useActivityLogStore } from "../store/useActivityLogStore";

const ACTION_COLOR: Record<string, string> = {
  CREATE_CAFE: "bg-emerald-50 text-emerald-600",
  UPDATE_CAFE: "bg-amber-50 text-amber-600",
  DELETE_CAFE: "bg-red-50 text-red-500",
  ADD_FAVORITE: "bg-pink-50 text-pink-500",
  REMOVE_FAVORITE: "bg-gray-100 text-gray-500",
  CALCULATE: "bg-blue-50 text-blue-600",
};

const METHOD_BADGE_COLOR: Record<string, string> = {
  SAW: "bg-blue-50 text-blue-700 border-blue-200",
  WP: "bg-purple-50 text-purple-700 border-purple-200",
  TOPSIS: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function extractMethodFromDescription(description: string): string | null {
  const match = description.match(/metode (SAW|WP|TOPSIS)/i);
  return match ? match[1].toUpperCase() : null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const {
    favorites,
    isLoading: isFavoritesLoading,
    fetchFavorites,
    removeFavorite,
  } = useFavoriteStore();

  const { logs, isLoading: isLogsLoading, fetchLogs } = useActivityLogStore();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      fetchFavorites(user.id);
      fetchLogs(user.id, 30);
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center space-y-3">
          <p className="text-[#8B735C]">Kamu belum login.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-bold"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  const openEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      await updateProfile(formData);
      setIsEditOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  // logout handled via header; no local logout button here

  const handleRemoveFavorite = async (cafeId: number) => {
    if (confirm("Hapus cafe ini dari favorit?")) {
      await removeFavorite(user.id, cafeId);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} hari lalu`;
  };

  const formatFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const riwayatBobot = logs.filter(
    (log) => log.entityType === "SPK" && log.action === "CALCULATE",
  );

  const riwayatUmum = logs.filter(
    (log) => !(log.entityType === "SPK" && log.action === "CALCULATE"),
  );

  const rekomendasiCount = logs.filter((log) =>
    log.description.toLowerCase().includes("rekomendasi"),
  ).length;

  const lastActivityAt = logs[0]?.createdAt;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-12 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ===== KOLOM UTAMA ===== */}
        <div className="space-y-6 min-w-0">
          {/* HEADER PROFIL */}
          <div className="relative bg-white border border-[#E8DED5] rounded-[28px] p-6 md:p-8 shadow-sm overflow-hidden">
            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={openEdit}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-[#E8DED5] flex items-center justify-center shadow-sm hover:bg-[#FAF8F5] transition"
                  >
                    <Pencil size={13} className="text-[#8B5E3C]" />
                  </button>
                </div>

                <div className="pt-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-black text-[#3E2C23] truncate">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FFF4E8] text-[#C97A2B]">
                    <ShieldCheck size={11} />
                    {user.role}
                  </span>
                  <p className="text-sm text-[#8B735C] italic mt-3 max-w-sm leading-relaxed">
                    "Coffee is not just a drink, it's a moment of comfort in a
                    busy day."
                  </p>
                </div>
              </div>

              {/* <div className="flex gap-2 shrink-0">
                <button
                  onClick={openEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-[#E8DED5] text-[#6F4E37] font-bold text-sm hover:bg-[#FAF8F5] transition"
                >
                  <Pencil size={15} />
                  Edit Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3E2C23] text-white font-bold text-sm hover:bg-[#2B1E17] transition"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div> */}

              {/* ASUMSI: belum ada foto cafe asli, diganti ilustrasi gradient
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-64 rounded-r-[28px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#C8A27C]/30 via-[#8B5E3C]/20 to-transparent flex items-center justify-center">
                  <Coffee size={64} className="text-[#C8A27C]/40" />
                </div>
              </div> */}
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                <Mail size={16} className="text-[#C8A27C] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-bold text-[#3E2C23]">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                <Phone size={16} className="text-[#C8A27C] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">
                    No HP
                  </p>
                  <p className="text-sm font-bold text-[#3E2C23]">
                    {user.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CAFE FAVORIT */}
          <div className="bg-white border border-[#E8DED5] rounded-[28px] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-pink-500" />
                <h2 className="font-bold text-[#3E2C23]">Cafe Favorit Saya</h2>
              </div>
              <button
                onClick={() => navigate("/profile/favorites")}
                className="flex items-center gap-1 text-xs font-bold text-[#C97A2B] hover:underline shrink-0"
              >
                Lihat Semua <ChevronRight size={13} />
              </button>
            </div>

            {isFavoritesLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#C8A27C]" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="py-12 text-center text-[#8B735C] text-sm">
                <Heart size={28} className="mx-auto mb-2 opacity-20" />
                Belum ada cafe favorit.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
                {favorites.slice(0, 4).map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => navigate(`/cafes/${fav.cafe.id}`)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-[#F0E8DF] bg-[#FCFAF8] hover:bg-[#FAF8F5] transition cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F0E8DF]">
                      {fav.cafe.image ? (
                        <img
                          src={fav.cafe.image}
                          alt={fav.cafe.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee size={18} className="text-[#C8A27C]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#3E2C23] text-sm truncate group-hover:text-[#8B5E3C] transition">
                        {fav.cafe.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[#8B735C] truncate">
                        <MapPin size={11} className="shrink-0" />
                        {fav.cafe.lokasi || fav.cafe.address}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(fav.cafe.id);
                      }}
                      className="w-9 h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition shrink-0"
                    >
                      <Heart size={15} className="fill-pink-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIWAYAT PEMBOBOTAN */}
          <div className="bg-white border border-[#E8DED5] rounded-[28px] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-[#C97A2B]" />
                <div>
                  <h2 className="font-bold text-[#3E2C23]">
                    Riwayat Pembobotan
                  </h2>
                  <p className="text-xs text-[#8B735C] mt-0.5">
                    Preferensi bobot SPK yang pernah kamu terapkan
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/profile/riwayat-bobot")}
                className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#C97A2B] hover:underline"
              >
                Lihat Semua <ChevronRight size={13} />
              </button>
            </div>

            {isLogsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#C8A27C]" />
              </div>
            ) : riwayatBobot.length === 0 ? (
              <div className="py-12 text-center text-[#8B735C] text-sm">
                <Clock size={28} className="mx-auto mb-2 opacity-20" />
                Belum ada riwayat pembobotan.
              </div>
            ) : (
              <div className="divide-y divide-[#F4ECE4]">
                {riwayatBobot.slice(0, 5).map((log) => {
                  const method = extractMethodFromDescription(log.description);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 px-6 py-3.5"
                    >
                      <div className="w-14 shrink-0 text-center">
                        <p className="text-[10px] font-bold text-[#8B735C] leading-tight">
                          {formatFullDate(log.createdAt)}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] flex items-center justify-center shrink-0">
                        <Calculator size={14} className="text-[#C97A2B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {method && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${METHOD_BADGE_COLOR[method] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                            >
                              {method}
                            </span>
                          )}
                          <span className="text-xs text-[#C8A27C] font-semibold">
                            {formatRelativeTime(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#3E2C23] mt-1 truncate">
                          {log.description}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/profile/riwayat-bobot/${log.id}`)
                        }
                        className="shrink-0 px-3 py-1.5 rounded-lg border border-[#E8DED5] text-xs font-bold text-[#6F4E37] hover:bg-[#FAF8F5] transition"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIWAYAT AKTIVITAS */}
          <div className="bg-white border border-[#E8DED5] rounded-[28px] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[#8B5E3C]" />
                <div>
                  <h2 className="font-bold text-[#3E2C23]">
                    Riwayat Aktivitas
                  </h2>
                  <p className="text-xs text-[#8B735C] mt-0.5">
                    Aktivitas terakhir pada sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/profile/aktivitas")}
                className="flex items-center gap-1 text-xs font-bold text-[#C97A2B] hover:underline shrink-0"
              >
                Lihat Semua <ChevronRight size={13} />
              </button>
            </div>

            {isLogsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#C8A27C]" />
              </div>
            ) : riwayatUmum.length === 0 ? (
              <div className="py-12 text-center text-[#8B735C] text-sm">
                <Activity size={28} className="mx-auto mb-2 opacity-20" />
                Belum ada aktivitas tercatat.
              </div>
            ) : (
              <div className="divide-y divide-[#F4ECE4]">
                {riwayatUmum.slice(0, 6).map((log) => (
                  <button
                    key={log.id}
                    onClick={() => navigate(`/profile/aktivitas/${log.id}`)}
                    className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-[#FAF8F5] transition text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ACTION_COLOR[log.action] || "bg-[#F8F4EF] text-[#8B5E3C]"}`}
                    >
                      <Activity size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3E2C23] truncate">
                        {log.description}
                      </p>
                      <p className="text-xs text-[#8B735C] mt-0.5">
                        {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-[#C8A27C] shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== SIDEBAR KANAN: RINGKASAN AKUN ===== */}
        <div className="space-y-4 xl:sticky xl:top-6">
          <div className="bg-[#FAF3EA] border border-[#E8DED5] rounded-[28px] p-5">
            <p className="font-bold text-sm mb-4 text-[#3E2C23]">
              Ringkasan Akun
            </p>

            <div className="space-y-3.5">
              <SummaryStat
                icon={<Heart size={16} className="text-pink-500" />}
                label="Cafe Favorit"
                sub="Cafe yang kamu sukai"
                value={favorites.length}
              />
              <div className="border-t border-[#E8DED5]" />
              <SummaryStat
                icon={<Calculator size={16} className="text-[#C97A2B]" />}
                label="Riwayat Bobot"
                sub="Total pengaturan bobot"
                value={riwayatBobot.length}
              />
              <div className="border-t border-[#E8DED5]" />
              <SummaryStat
                icon={<BarChart3 size={16} className="text-blue-500" />}
                label="Rekomendasi"
                sub="Rekomendasi dibuat"
                value={rekomendasiCount}
              />
              <div className="border-t border-[#E8DED5]" />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#E8DED5]">
                  <Clock size={16} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8B735C]">Login Terakhir</p>
                  <p className="text-sm font-bold text-[#3E2C23]">
                    {lastActivityAt ? formatRelativeTime(lastActivityAt) : "—"}
                  </p>
                  {lastActivityAt && (
                    <p className="text-[10px] text-[#8B735C]">
                      {formatFullDate(lastActivityAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF4E8] border border-[#F3DDBF] rounded-[24px] p-4 flex items-start gap-3">
            <Lightbulb size={18} className="text-[#C97A2B] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#8B5E3C] mb-1">Tips</p>
              <p className="text-xs text-[#8B735C] leading-relaxed">
                Atur bobot kriteria sesuai prioritasmu untuk hasil rekomendasi
                yang lebih akurat!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
              <h2 className="font-black text-[#3E2C23] text-xl">Edit Profil</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                  Nama
                </label>
                <div className="relative">
                  <UserIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]"
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]"
                  />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                  No HP
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]"
                  />
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
                  ⚠ {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-[#E8DED5] text-[#6F4E37] font-semibold hover:bg-[#F8F4EF] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryStat = ({
  icon,
  label,
  sub,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: number;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-[#D9C6B5] truncate">{label}</p>
      <p className="text-[10px] text-[#8B735C] truncate">{sub}</p>
    </div>
    <p className="text-lg font-black text-white shrink-0">{value}</p>
  </div>
);

export default Profile;
