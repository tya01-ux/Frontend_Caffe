import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useCriteriaStore } from "../../../store/useCriteriaStore";
import { useTenantStore } from "../../../store/useTenantStore";
import type { CriteriaInput, CriteriaType } from "../../../store/useCriteriaStore";

const PER_PAGE = 5;

const CriteriaIndex: React.FC = () => {
  const {
    criterias,
    isLoading,
    error,
    fetchCriterias,
    createCriteria,
    updateCriteria,
    deleteCriteria,
  } = useCriteriaStore();

  const { tenants, fetchTenants } = useTenantStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"" | "COST" | "BENEFIT">("");
  const [filterTenantId, setFilterTenantId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "detail">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CriteriaInput>({
    tenantId: 0,
    code: "",
    name: "",
    type: "BENEFIT",
    weight: 0,
    description: "",
  });

  useEffect(() => {
    fetchCriterias();
    fetchTenants();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterTenantId]);

  const openModal = (type: "create" | "edit" | "detail", id?: number) => {
    setModalType(type);

    if (type === "create") {
      setFormData({ tenantId: 0, code: "", name: "", type: "BENEFIT", weight: 0, description: "" });
      setSelectedId(null);
    }

    if (id) {
      const c = criterias.find((x) => x.id === id);
      if (c) {
        setSelectedId(id);
        setFormData({
          tenantId: c.tenantId,
          code: c.code,
          name: c.name,
          type: c.type,
          weight: c.weight,
          description: c.description || "",
        });
      }
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "create") await createCriteria(formData);
    if (modalType === "edit" && selectedId) await updateCriteria(selectedId, formData);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Yakin hapus kriteria "${name}"? Semua nilai terkait akan ikut terhapus.`)) {
      await deleteCriteria(id);
    }
  };

  const filteredCriterias = criterias.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "" || c.type === filterType;
    const matchTenant = filterTenantId === "" || c.tenantId === Number(filterTenantId);
    return matchSearch && matchType && matchTenant;
  });

  // PAGINATION
  const totalPages = Math.ceil(filteredCriterias.length / PER_PAGE);
  const paginatedCriterias = filteredCriterias.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const selectedCriteria = selectedId ? criterias.find((c) => c.id === selectedId) : null;

  // ─── STAT CARDS: hitung per-tenant yang dipilih, atau semua jika tidak ada filter ───
  const criteriaForStats = filterTenantId
    ? criterias.filter((c) => c.tenantId === Number(filterTenantId))
    : criterias;

  const totalBobot = criteriaForStats.reduce((acc, c) => acc + c.weight, 0);
  const totalBenefit = criteriaForStats.filter((c) => c.type === "BENEFIT").length;
  const totalCost = criteriaForStats.filter((c) => c.type === "COST").length;

  // Bobot per-tenant untuk warning (hanya tampil kalau filter tenant aktif)
  const selectedTenantName = filterTenantId
    ? tenants.find((t) => t.id === Number(filterTenantId))?.name
    : null;

  // Cek bobot tiap tenant (untuk warning global kalau tidak ada filter)
  const tenantBobotWarnings = tenants
    .map((t) => {
      const total = criterias
        .filter((c) => c.tenantId === t.id)
        .reduce((acc, c) => acc + c.weight, 0);
      return { name: t.name, total };
    })
    .filter((t) => t.total > 0 && Math.abs(t.total - 100) > 0.01);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Data Kriteria</h1>
          <p className="text-[#8B735C] mt-2">Kelola kriteria dan bobot yang digunakan dalam perhitungan SPK</p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          <Plus size={18} />
          Tambah Kriteria
        </button>
      </div>

      {/* STAT CARDS — berubah sesuai filter tenant */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] flex items-center justify-center">
            <ShieldCheck size={22} className="text-[#C97A2B]" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">
              Total Kriteria{selectedTenantName ? ` · ${selectedTenantName}` : ""}
            </p>
            <p className="text-2xl font-black text-[#3E2C23]">{criteriaForStats.length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FFF4] flex items-center justify-center">
            <TrendingUp size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Tipe Benefit</p>
            <p className="text-2xl font-black text-[#3E2C23]">{totalBenefit}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1F1] flex items-center justify-center">
            <TrendingDown size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Tipe Cost</p>
            <p className="text-2xl font-black text-[#3E2C23]">{totalCost}</p>
          </div>
        </div>
      </div>

      {/* WARNING: bobot tenant yang belum pas */}
      {!filterTenantId && tenantBobotWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">Total bobot belum 100 di beberapa tenant:</p>
            <ul className="text-xs text-amber-700 space-y-0.5">
              {tenantBobotWarnings.map((t) => (
                <li key={t.name}>
                  • <strong>{t.name}</strong>: total bobot = {t.total.toFixed(2)} (seharusnya 100)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FILTER */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-6 shadow-[0_10px_40px_rgba(62,44,35,0.08)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]" />
            <input
              type="text"
              placeholder="Cari nama atau kode kriteria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "" | "COST" | "BENEFIT")}
            className="px-5 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] min-w-[180px] outline-none focus:ring-2 focus:ring-[#C8A27C]"
          >
            <option value="">Semua Tipe</option>
            <option value="BENEFIT">Benefit</option>
            <option value="COST">Cost</option>
          </select>
          <select
            value={filterTenantId}
            onChange={(e) => setFilterTenantId(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] min-w-[200px] outline-none focus:ring-2 focus:ring-[#C8A27C]"
          >
            <option value="">Semua Tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
        <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between">
          <h2 className="font-bold text-[#3E2C23] text-lg">
            Daftar Kriteria ({filteredCriterias.length})
          </h2>
          {criteriaForStats.length > 0 && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              Math.abs(totalBobot - 100) < 0.01
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              Total Bobot{selectedTenantName ? ` (${selectedTenantName})` : ""}:{" "}
              <span className="font-black">{totalBobot.toFixed(2)}</span>
              {Math.abs(totalBobot - 100) < 0.01 ? " ✓" : " ⚠"}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F4EF] text-[#6F4E37]">
                <th className="p-5 text-left">No</th>
                <th className="p-5 text-left">Kode</th>
                <th className="p-5 text-left">Nama Kriteria</th>
                <th className="p-5 text-left">Tenant</th>
                <th className="p-5 text-center">Tipe</th>
                <th className="p-5 text-center">Bobot</th>
                <th className="p-5 text-left">Deskripsi</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin mx-auto text-[#C8A27C]" />
                  </td>
                </tr>
              )}

              {!isLoading && paginatedCriterias.map((criteria, index) => (
                <tr key={criteria.id} className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition">
                  <td className="p-5 font-medium text-[#6F4E37]">
                    {(currentPage - 1) * PER_PAGE + index + 1}
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1.5 rounded-xl bg-[#F8F4EF] text-[#6F4E37] font-black text-sm font-mono">
                      {criteria.code}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-[#3E2C23]">{criteria.name}</p>
                  </td>
                  <td className="p-5">
                    <span className="text-sm text-[#6F4E37]">{criteria.tenant?.name || "—"}</span>
                  </td>
                  <td className="p-5 text-center">
                    {criteria.type === "BENEFIT" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FFF4] text-green-700 text-xs font-bold">
                        <TrendingUp size={12} /> Benefit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F1] text-red-500 text-xs font-bold">
                        <TrendingDown size={12} /> Cost
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <span className="font-black text-[#3E2C23] text-lg">{criteria.weight}</span>
                  </td>
                  <td className="p-5 text-sm text-[#8B735C] max-w-[220px] truncate">
                    {criteria.description || "—"}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal("detail", criteria.id)}
                        className="w-10 h-10 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        onClick={() => openModal("edit", criteria.id)}
                        className="w-10 h-10 rounded-xl bg-[#FFF4E8] text-[#C97A2B] flex items-center justify-center hover:bg-[#FFE8CC] transition"
                      >
                        <Edit2 size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(criteria.id, criteria.name)}
                        className="w-10 h-10 rounded-xl bg-[#FFF1F1] text-red-500 flex items-center justify-center hover:bg-[#FFE3E3] transition"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredCriterias.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#8B735C]">
                    <ShieldCheck size={36} className="mx-auto mb-3 opacity-20" />
                    <p>Tidak ada kriteria ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#F0E8DF] flex items-center justify-between bg-[#FAF8F5]">
            <p className="text-sm text-[#8B735C]">
              Menampilkan{" "}
              <span className="font-bold text-[#3E2C23]">
                {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filteredCriterias.length)}
              </span>{" "}
              dari <span className="font-bold text-[#3E2C23]">{filteredCriterias.length}</span> kriteria
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl bg-white border border-[#E8DED5] flex items-center justify-center hover:bg-[#EDE2D5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                    currentPage === page
                      ? "bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white shadow-md"
                      : "bg-white border border-[#E8DED5] text-[#6F4E37] hover:bg-[#F8F4EF]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl bg-white border border-[#E8DED5] flex items-center justify-center hover:bg-[#EDE2D5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODAL ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
              <h2 className="font-black text-[#3E2C23] text-xl">
                {modalType === "create" && "Tambah Kriteria Baru"}
                {modalType === "edit" && "Edit Kriteria"}
                {modalType === "detail" && "Detail Kriteria"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* DETAIL MODE */}
            {modalType === "detail" && selectedCriteria && (
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-xl">
                    {selectedCriteria.code}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#3E2C23]">{selectedCriteria.name}</h3>
                    <p className="text-sm text-[#8B735C]">{selectedCriteria.tenant?.name || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl p-4 text-center ${selectedCriteria.type === "BENEFIT" ? "bg-[#F0FFF4]" : "bg-[#FFF1F1]"}`}>
                    {selectedCriteria.type === "BENEFIT"
                      ? <TrendingUp size={20} className="mx-auto mb-1 text-green-600" />
                      : <TrendingDown size={20} className="mx-auto mb-1 text-red-500" />}
                    <p className={`text-lg font-black ${selectedCriteria.type === "BENEFIT" ? "text-green-700" : "text-red-500"}`}>
                      {selectedCriteria.type}
                    </p>
                    <p className="text-xs text-[#8B735C] mt-0.5">Tipe Kriteria</p>
                  </div>
                  <div className="bg-[#FFF4E8] rounded-2xl p-4 text-center">
                    <ShieldCheck size={20} className="mx-auto mb-1 text-[#C97A2B]" />
                    <p className="text-lg font-black text-[#3E2C23]">{selectedCriteria.weight}</p>
                    <p className="text-xs text-[#8B735C] mt-0.5">Bobot</p>
                  </div>
                </div>
                {selectedCriteria.description && (
                  <div className="bg-[#FAF8F5] rounded-2xl p-4">
                    <p className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-1.5">Deskripsi</p>
                    <p className="text-sm text-[#3E2C23]">{selectedCriteria.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-xs text-[#8B735C]">
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-0.5">Dibuat</p>
                    <p>{new Date(selectedCriteria.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-0.5">Diperbarui</p>
                    <p>{new Date(selectedCriteria.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
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

            {/* CREATE / EDIT MODE */}
            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Kode *</label>
                    <input
                      type="text"
                      required
                      placeholder="C1"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm font-mono outline-none focus:ring-2 focus:ring-[#C8A27C]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Nama Kriteria *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Harga"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Tipe *</label>
                    <div className="flex gap-2">
                      {(["BENEFIT", "COST"] as CriteriaType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t })}
                          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border-2 ${
                            formData.type === t
                              ? t === "BENEFIT"
                                ? "bg-[#F0FFF4] border-green-500 text-green-700"
                                : "bg-[#FFF1F1] border-red-400 text-red-500"
                              : "bg-[#FAF8F5] border-[#E8DED5] text-[#8B735C]"
                          }`}
                        >
                          {t === "BENEFIT" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Bobot *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.25"
                      value={formData.weight || ""}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm font-mono text-center outline-none focus:ring-2 focus:ring-[#C8A27C]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Deskripsi singkat kriteria ini..."
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
                    {modalType === "create" ? "Simpan Kriteria" : "Simpan Perubahan"}
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

export default CriteriaIndex;