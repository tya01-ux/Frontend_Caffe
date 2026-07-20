import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, TrendingUp, TrendingDown, ShieldCheck } from "lucide-react";
import { useCriteriaStore } from "../../../store/useCriteriaStore";
import { useTenantStore } from "../../../store/useTenantStore";
import type { CriteriaType } from "../../../store/useCriteriaStore";

const CriteriaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { criterias, fetchCriterias, updateCriteria, isLoading, error } = useCriteriaStore();
  const { tenants, fetchTenants } = useTenantStore();

  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    tenantId: 0,
    code: "",
    name: "",
    type: "BENEFIT" as CriteriaType,
    weight: "" as number | "",
    description: "",
  });

  useEffect(() => {
    const load = async () => {
      if (criterias.length === 0) await fetchCriterias();
      if (tenants.length === 0) await fetchTenants();
      setIsFetching(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isFetching && id) {
      const found = criterias.find((c) => c.id === Number(id));
      if (found) {
        setFormData({
          tenantId: found.tenantId,
          code: found.code,
          name: found.name,
          type: found.type,
          weight: found.weight,
          description: found.description || "",
        });
      }
    }
  }, [isFetching, criterias, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "tenantId" || name === "weight"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const success = await updateCriteria(Number(id), {
      ...formData,
      weight: Number(formData.weight),
    });
    if (success) {
      alert("Kriteria berhasil diperbarui!");
      navigate("/admin/criterias");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-[#C8A27C]" />
      </div>
    );
  }

  const criteriaNotFound = !criterias.find((c) => c.id === Number(id));

  if (criteriaNotFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-[#8B735C]">
        <ShieldCheck size={40} className="opacity-20" />
        <p className="text-lg font-semibold">Kriteria tidak ditemukan.</p>
        <button
          onClick={() => navigate("/admin/criterias")}
          className="mt-2 px-5 py-2.5 bg-[#F8F4EF] text-[#3E2C23] rounded-xl font-bold hover:bg-[#EDE2D5] transition"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/criterias")}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-[#3E2C23] transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#3E2C23]">
            Edit Kriteria
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perbarui informasi kriteria yang digunakan dalam perhitungan SPK.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold text-sm">
          ⚠ Terjadi Kesalahan: {error}
        </div>
      )}

      {/* PREVIEW CARD */}
      <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-lg shrink-0 font-mono">
          {formData.code || <ShieldCheck size={22} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[#3E2C23] text-lg truncate">
            {formData.name || (
              <span className="text-[#C8A27C] font-normal italic text-base">
                Nama kriteria...
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {formData.type === "BENEFIT" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FFF4] text-green-700 text-xs font-bold">
                <TrendingUp size={10} /> Benefit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF1F1] text-red-500 text-xs font-bold">
                <TrendingDown size={10} /> Cost
              </span>
            )}
            {formData.weight !== "" && (
              <span className="text-xs text-[#8B735C]">
                Bobot: <strong className="text-[#3E2C23]">{formData.weight}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E8DED5] rounded-[28px] p-6 md:p-8 shadow-[0_10px_30px_rgba(62,44,35,0.06)] space-y-6"
      >
        <h3 className="text-base font-bold text-[#3E2C23] border-b border-gray-100 pb-2">
          📊 Informasi Kriteria
        </h3>

        {/* Tenant */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">Tenant *</label>
          <select
            name="tenantId"
            required
            value={formData.tenantId || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all"
          >
            <option value="">Pilih Tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kode & Nama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">Kode Kriteria *</label>
            <input
              type="text"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="Contoh: C1"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all"
            />
            <p className="text-xs text-gray-400">Kode unik per tenant (misal: C1, C2, C3)</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">Nama Kriteria *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Harga, Fasilitas"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all"
            />
          </div>
        </div>

        {/* Tipe */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">Tipe Kriteria *</label>
          <div className="grid grid-cols-2 gap-3">
            {(["BENEFIT", "COST"] as CriteriaType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                className={`py-4 rounded-2xl text-sm font-bold transition flex flex-col items-center gap-2 border-2 ${
                  formData.type === t
                    ? t === "BENEFIT"
                      ? "bg-[#F0FFF4] border-green-500 text-green-700"
                      : "bg-[#FFF1F1] border-red-400 text-red-500"
                    : "bg-[#FAF8F5] border-gray-200 text-gray-400 hover:border-[#C8A27C]"
                }`}
              >
                {t === "BENEFIT" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span>{t}</span>
                <span className="text-xs font-normal">
                  {t === "BENEFIT"
                    ? "Semakin tinggi = semakin baik"
                    : "Semakin rendah = semakin baik"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bobot */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">Bobot *</label>
          <input
            type="number"
            name="weight"
            required
            step="0.01"
            min="0"
            max="1"
            value={formData.weight}
            onChange={handleChange}
            placeholder="0.00 — 1.00"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all"
          />
          <p className="text-xs text-gray-400">
            Nilai antara 0 sampai 1. Total bobot semua kriteria sebaiknya = 1.
          </p>
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Deskripsi singkat tentang kriteria ini..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all resize-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/admin/criterias")}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriteriaEdit;