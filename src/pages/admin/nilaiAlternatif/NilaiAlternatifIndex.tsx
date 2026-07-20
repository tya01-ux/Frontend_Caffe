import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Coffee,
  Filter,
} from "lucide-react";
import { useCafeCriteriaValueStore } from "../../../store/useCafeCriteriaValue(NilaiAlternatif)";
import { useCafeStore } from "../../../store/useCaffeStore";
import { useCriteriaStore } from "../../../store/useCriteriaStore";
import { useTenantStore } from "../../../store/useTenantStore";

import NilaiAlternatifCreate from "./NilaiAlternatifCreate";
import NilaiAlternatifEdit from "./NilaiAlternatifEdit";

const NilaiAlternatifIndex: React.FC = () => {
  const {
    values,
    fetchValues,
    deleteValue,
    isLoading,
    getValueByCafeAndCriteria,
  } = useCafeCriteriaValueStore();

  const { cafes, fetchCafes } = useCafeStore();
  const { criterias, fetchCriterias } = useCriteriaStore();
  const { tenants, fetchTenants } = useTenantStore();

  const [filterTenantId, setFilterTenantId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [prefilledCafeId, setPrefilledCafeId] = useState<number | undefined>();
  const [prefilledCriteriaId, setPrefilledCriteriaId] = useState<
    number | undefined
  >();

  useEffect(() => {
    fetchValues();
    fetchCafes();
    fetchCriterias();
    fetchTenants();
  }, []);

  const filteredCafes = cafes.filter((cafe) => {
    const matchTenant =
      filterTenantId === "" || cafe.tenantId === Number(filterTenantId);
    const matchSearch = cafe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchTenant && matchSearch;
  });

  const filteredCriterias = criterias.filter(
    (c) => filterTenantId === "" || c.tenantId === Number(filterTenantId),
  );

  const openCreateManual = () => {
    setPrefilledCafeId(undefined);
    setPrefilledCriteriaId(undefined);
    setCreateOpen(true);
  };

  const openCreateFromCell = (cafeId: number, criteriaId: number) => {
    setPrefilledCafeId(cafeId);
    setPrefilledCriteriaId(criteriaId);
    setCreateOpen(true);
  };

  const openEdit = (id: number) => {
    setEditId(id);
    setEditOpen(true);
  };

  const handleSuccess = () => {
    fetchValues();
    setCreateOpen(false);
    setEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin hapus nilai ini?")) await deleteValue(id);
  };

  const totalFilled = values.filter(
    (v) =>
      filteredCafes.some((c) => c.id === v.cafeId) &&
      filteredCriterias.some((c) => c.id === v.criteriaId),
  ).length;
  const totalPossible = filteredCafes.length * filteredCriterias.length;
  const completionPct =
    totalPossible === 0 ? 0 : Math.round((totalFilled / totalPossible) * 100);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">
            Nilai Alternatif
          </h1>
          <p className="text-[#8B735C] mt-2">
            Kelola nilai setiap cafe terhadap masing-masing kriteria SPK
          </p>
        </div>
        <button
          onClick={openCreateManual}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          <Plus size={18} />
          Tambah Nilai
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] flex items-center justify-center">
            <LayoutGrid size={22} className="text-[#C97A2B]" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">
              Total Nilai Terisi
            </p>
            <p className="text-2xl font-black text-[#3E2C23]">{totalFilled}</p>
          </div>
        </div>

        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FFF4] flex items-center justify-center">
            <Coffee size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Total Cafe</p>
            <p className="text-2xl font-black text-[#3E2C23]">
              {filteredCafes.length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1F1] flex items-center justify-center">
            <Filter size={22} className="text-[#C97A2B]" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">
              Kelengkapan Data
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-[#3E2C23]">
                {completionPct}%
              </p>
              <div className="flex-1 h-2 bg-[#F0E8DF] rounded-full overflow-hidden min-w-[60px]">
                <div
                  className="h-full bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-6 shadow-[0_10px_40px_rgba(62,44,35,0.08)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]"
            />
            <input
              type="text"
              placeholder="Cari nama cafe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>
          <select
            value={filterTenantId}
            onChange={(e) => setFilterTenantId(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] min-w-[220px] outline-none focus:ring-2 focus:ring-[#C8A27C]"
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

      {/* MATRIX TABLE */}
      <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
        {/* Table Header */}
        <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between">
          <h2 className="font-bold text-[#3E2C23] text-lg">
            Matriks Nilai Alternatif
          </h2>
          <span className="text-xs text-[#8B735C] bg-[#F8F4EF] px-3 py-1 rounded-full font-medium">
            {filteredCafes.length} Cafe × {filteredCriterias.length} Kriteria
          </span>
        </div>

        {/* Scrollable area — max height biar ga panjang ke bawah */}
<div className="overflow-auto max-h-[calc(100vh-420px)]">
            {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#C8A27C]" />
            </div>
          ) : filteredCafes.length === 0 || filteredCriterias.length === 0 ? (
            <div className="py-20 text-center text-[#8B735C]">
              <Coffee size={36} className="mx-auto mb-3 opacity-20" />
              <p>Belum ada data cafe atau kriteria untuk ditampilkan.</p>
              <p className="text-xs mt-1 opacity-60">
                Pastikan sudah menambahkan cafe dan kriteria terlebih dahulu.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              {/* Sticky thead */}
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#F8F4EF] text-[#6F4E37]">
                  <th className="p-4 text-left sticky left-0 bg-[#F8F4EF] z-30 min-w-[200px] border-r border-[#EDE2D5]">
                    Nama Cafe
                  </th>
                  {filteredCriterias.map((c) => (
                    <th key={c.id} className="p-4 text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-[#3E2C23] font-mono text-xs px-2 py-0.5 bg-white rounded-lg border border-[#E8DED5]">
                          {c.code}
                        </span>
                        <span className="font-semibold text-xs">{c.name}</span>
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.type === "BENEFIT"
                              ? "bg-[#F0FFF4] text-green-700"
                              : "bg-[#FFF1F1] text-red-500"
                          }`}
                        >
                          {c.type === "BENEFIT" ? (
                            <TrendingUp size={9} />
                          ) : (
                            <TrendingDown size={9} />
                          )}
                          {c.type} · {c.weight}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCafes.map((cafe) => (
                  <tr
                    key={cafe.id}
                    className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition"
                  >
                    {/* Sticky kolom kiri nama cafe */}
                    <td className="p-4 sticky left-0 bg-white border-r border-[#F4ECE4] z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center shrink-0">
                          <Coffee size={15} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-[#3E2C23] leading-tight">
                            {cafe.name}
                          </p>
                          <p className="text-[10px] text-[#8B735C]">
                            {cafe.lokasi || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {filteredCriterias.map((criteria) => {
                      const existing = getValueByCafeAndCriteria(
                        cafe.id,
                        criteria.id,
                      );
                      return (
                        <td key={criteria.id} className="p-3 text-center">
                          {existing ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-base font-black text-[#3E2C23]">
                                {existing.value}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEdit(existing.id)}
                                  className="w-7 h-7 rounded-lg bg-[#FFF4E8] text-[#C97A2B] flex items-center justify-center hover:bg-[#FFE8CC] transition"
                                  title="Edit nilai"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(existing.id)}
                                  className="w-7 h-7 rounded-lg bg-[#FFF1F1] text-red-400 flex items-center justify-center hover:bg-[#FFE3E3] transition"
                                  title="Hapus nilai"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                openCreateFromCell(cafe.id, criteria.id)
                              }
                              className="w-9 h-9 mx-auto rounded-xl border-2 border-dashed border-[#D9CBBF] text-[#C8A27C] flex items-center justify-center hover:border-[#C8A27C] hover:bg-[#FFF8F0] transition"
                              title="Tambah nilai"
                            >
                              <Plus size={15} />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        {filteredCafes.length > 0 && (
          <div className="px-6 py-3 border-t border-[#F0E8DF] bg-[#FAF8F5]">
            <p className="text-xs text-[#8B735C]">
              Scroll atas-bawah dan kiri-kanan untuk melihat semua data ·{" "}
              <span className="font-bold text-[#3E2C23]">{totalFilled}</span>{" "}
              dari{" "}
              <span className="font-bold text-[#3E2C23]">{totalPossible}</span>{" "}
              nilai sudah terisi
            </p>
          </div>
        )}
      </div>

      {/* DRAWER CREATE */}
      <NilaiAlternatifCreate
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleSuccess}
        prefilledCafeId={prefilledCafeId}
        prefilledCriteriaId={prefilledCriteriaId}
      />

      {/* DRAWER EDIT */}
      <NilaiAlternatifEdit
        isOpen={editOpen}
        editId={editId}
        onClose={() => setEditOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default NilaiAlternatifIndex;
