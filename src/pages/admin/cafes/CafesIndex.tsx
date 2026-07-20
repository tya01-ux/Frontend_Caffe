import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  Image,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCafeStore } from "../../../store/useCaffeStore";
import type { CafeInput } from "../../../store/useCaffeStore";
import { useTenantStore } from "../../../store/useTenantStore";

const PER_PAGE = 5;

const CafesIndex: React.FC = () => {
  const {
    cafes,
    isLoading,
    error,
    fetchCafes,
    createCafe,
    updateCafe,
    deleteCafe,
    clearError,
  } = useCafeStore();

  const { tenants, fetchTenants } = useTenantStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTenantId, setFilterTenantId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "detail">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CafeInput>({
    tenantId: 0,
    name: "",
    image: "",
    lokasi: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    fetchCafes();
    fetchTenants();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTenantId]);

  const openModal = (type: "create" | "edit" | "detail", id?: number) => {
    clearError();
    setModalType(type);

    if (type === "create") {
      setFormData({
        tenantId: tenants[0]?.id || 0,
        name: "",
        image: "",
        lokasi: "",
        address: "",
        description: "",
      });
      setSelectedId(null);
    }

    if (id) {
      const cafe = cafes.find((c) => c.id === id);
      if (cafe) {
        setSelectedId(id);
        setFormData({
          tenantId: cafe.tenantId,
          name: cafe.name,
          image: cafe.image || "",
          lokasi: cafe.lokasi || "",
          address: cafe.address,
          description: cafe.description || "",
        });
      }
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenantId) {
      return; // guard: tenant wajib dipilih
    }

    let success = false;
    if (modalType === "create") success = await createCafe(formData);
    if (modalType === "edit" && selectedId) success = await updateCafe(selectedId, formData);

    if (success) setIsModalOpen(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Yakin hapus cafe ${name}?`)) await deleteCafe(id);
  };

  const filteredCafes = cafes.filter((cafe) => {
    const matchSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTenant =
      filterTenantId === "" || cafe.tenantId === Number(filterTenantId);
    return matchSearch && matchTenant;
  });

  const totalPages = Math.ceil(filteredCafes.length / PER_PAGE);
  const paginatedCafes = filteredCafes.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const selectedCafe = selectedId ? cafes.find((c) => c.id === selectedId) : null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Data Cafe</h1>
          <p className="text-[#8B735C] mt-2">Kelola semua cafe yang terdaftar di sistem CafeRank</p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          <Plus size={18} />
          Tambah Cafe
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-6 shadow-[0_10px_40px_rgba(62,44,35,0.08)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]" />
            <input
              type="text"
              placeholder="Cari cafe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>
          <select
            value={filterTenantId}
            onChange={(e) => setFilterTenantId(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] min-w-[220px]"
          >
            <option value="">Semua Tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
        <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white">
          <h2 className="font-bold text-[#3E2C23] text-lg">Daftar Cafe ({filteredCafes.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F4EF] text-[#6F4E37]">
                <th className="p-5 text-left">No</th>
                <th className="p-5 text-left">Image</th>
                <th className="p-5 text-left">Cafe</th>
                <th className="p-5 text-left">Tenant</th>
                <th className="p-5 text-left">Alamat</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin mx-auto text-[#C8A27C]" />
                  </td>
                </tr>
              )}

              {!isLoading && paginatedCafes.map((cafe, index) => (
                <tr key={cafe.id} className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition">
                  <td className="p-5 font-medium text-[#6F4E37]">
                    {(currentPage - 1) * PER_PAGE + index + 1}
                  </td>
                  <td className="p-5">
                    <img
                      src={cafe.image || "/default-cafe.jpg"}
                      alt={cafe.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-cafe.jpg";
                      }}
                    />
                  </td>
                  <td className="p-5">
                    <div>
                      <h3 className="font-bold text-[#3E2C23] text-lg">{cafe.name}</h3>
                      <p className="text-sm text-[#8B735C] line-clamp-1">
                        {cafe.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </td>
                  <td className="p-5 text-[#6F4E37]">{cafe.tenant?.name || "—"}</td>
                  <td className="p-5 text-[#6F4E37] max-w-[300px] truncate">{cafe.address}</td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal("detail", cafe.id)}
                        className="w-10 h-10 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5]"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        onClick={() => openModal("edit", cafe.id)}
                        className="w-10 h-10 rounded-xl bg-[#FFF4E8] text-[#C97A2B] flex items-center justify-center hover:bg-[#FFE8CC]"
                      >
                        <Edit2 size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(cafe.id, cafe.name)}
                        className="w-10 h-10 rounded-xl bg-[#FFF1F1] text-red-500 flex items-center justify-center hover:bg-[#FFE3E3]"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredCafes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#8B735C]">
                    Tidak ada cafe ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#F0E8DF] bg-[#FAF8F5] flex items-center justify-between">
            <p className="text-sm text-[#8B735C]">
              Halaman{" "}
              <span className="font-black text-[#3E2C23]">{currentPage}</span>
              {" "}dari{" "}
              <span className="font-black text-[#3E2C23]">{totalPages}</span>
              {" "}·{" "}
              <span className="font-black text-[#3E2C23]">
                {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filteredCafes.length)}
              </span>{" "}
              dari {filteredCafes.length} cafe
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E8DED5] text-sm font-semibold text-[#6F4E37] hover:bg-[#F8F4EF] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Selanjutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
              <h2 className="font-black text-[#3E2C23] text-xl">
                {modalType === "create" && "Tambah Cafe Baru"}
                {modalType === "edit" && "Edit Data Cafe"}
                {modalType === "detail" && "Detail Cafe"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
              >
                <X size={18} />
              </button>
            </div>

            {modalType === "detail" && selectedCafe && (
              <div className="p-6 space-y-5">
                <div className="w-full h-52 rounded-2xl overflow-hidden bg-[#F8F4EF]">
                  <img
                    src={selectedCafe.image || "/default-cafe.jpg"}
                    alt={selectedCafe.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/default-cafe.jpg";
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-[#3E2C23]">{selectedCafe.name}</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FFF4E8] text-[#C97A2B] text-xs font-bold">
                      {selectedCafe.tenant?.name || "—"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedCafe.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                      {selectedCafe.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-[#6F4E37]">
                    <div className="flex gap-2">
                      <span className="font-semibold w-24 shrink-0">Alamat</span>
                      <span>: {selectedCafe.address}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold w-24 shrink-0">Deskripsi</span>
                      <span>: {selectedCafe.description || "Tidak ada deskripsi"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold w-24 shrink-0">Dibuat</span>
                      <span>: {new Date(selectedCafe.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#F8F4EF] text-[#3E2C23] font-bold hover:bg-[#EDE2D5] transition"
                >
                  Tutup
                </button>
              </div>
            )}

            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Preview Foto</label>
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-[#F8F4EF] border-2 border-dashed border-[#E8DED5] flex items-center justify-center">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`flex flex-col items-center gap-2 text-[#C8A27C] ${formData.image ? "hidden" : ""}`}>
                      <Image size={32} className="opacity-40" />
                      <p className="text-xs text-[#8B735C]">Preview foto akan muncul di sini</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">URL Foto Cafe</label>
                  <div className="relative">
                    <Image size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A27C]" />
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Nama Cafe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Kasih"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Tenant *</label>
                  <select
                    required
                    value={formData.tenantId || ""}
                    onChange={(e) => setFormData({ ...formData, tenantId: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  >
                    <option value="">Pilih Tenant</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Dekat alun-alun"
                    value={formData.lokasi || ""}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Alamat Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jl. Contoh No. 1"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Deskripsi singkat suasana cafe..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C] resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">⚠ {error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                    {modalType === "create" ? "Simpan Cafe" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CafesIndex;