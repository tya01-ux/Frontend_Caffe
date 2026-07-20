import React, { useEffect, useState } from "react";
import {
  Calculator,
  Loader2,
  Trophy,
  Medal,
  Star,
  RotateCcw,
  ChevronRight,
  Coffee,
  BarChart3,
  Building2,
  Hash,
} from "lucide-react";
import { useSPKStore } from "../../../store/useSPKStore";
import { useTenantStore } from "../../../store/useTenantStore";
import type { SPKMethod } from "../../../store/useSPKStore";

const METHODS: { value: SPKMethod; label: string; desc: string }[] = [
  {
    value: "SAW",
    label: "SAW",
    desc: "Simple Additive Weighting — penjumlahan terbobot nilai ternormalisasi",
  },
  {
    value: "WP",
    label: "WP",
    desc: "Weighted Product — perkalian nilai dengan pangkat bobot kriteria",
  },
  {
    value: "TOPSIS",
    label: "TOPSIS",
    desc: "Technique for Order Preference — jarak ke solusi ideal positif & negatif",
  },
];

const RANK_CONFIG = [
  {
    rank: 1,
    icon: <Trophy size={16} className="text-yellow-500" />,
    bg: "from-yellow-50 to-amber-50",
    border: "border-yellow-300",
    badge: "bg-yellow-400 text-white",
    label: "Terbaik",
  },
  {
    rank: 2,
    icon: <Medal size={16} className="text-gray-400" />,
    bg: "from-gray-50 to-slate-50",
    border: "border-gray-300",
    badge: "bg-gray-400 text-white",
    label: "Runner Up",
  },
  {
    rank: 3,
    icon: <Star size={16} className="text-orange-400" />,
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-300",
    badge: "bg-orange-400 text-white",
    label: "Pilihan",
  },
];

const PerhitunganSPK: React.FC = () => {
  const {
    result,
    currentMethod,
    isCalculating,
    error,
    clearResult,
    clearError,
    calculateSAW,
    calculateWP,
    calculateTOPSIS,
  } = useSPKStore();

  const { tenants, fetchTenants } = useTenantStore();

  const [selectedMethod, setSelectedMethod] = useState<SPKMethod>("SAW");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  useEffect(() => {
    fetchTenants();
    clearResult();
  }, []);

  const handleHitung = async () => {
    if (!selectedTenantId) return;
    clearError();
    if (selectedMethod === "SAW") await calculateSAW(Number(selectedTenantId));
    if (selectedMethod === "WP") await calculateWP(Number(selectedTenantId));
    if (selectedMethod === "TOPSIS") await calculateTOPSIS(Number(selectedTenantId));
  };

  const handleReset = () => {
    clearResult();
    setSelectedTenantId("");
    setSelectedMethod("SAW");
  };

  const currentResult = result?.ranking ?? [];
  const hasResult = currentResult.length > 0;
  const top3 = currentResult.slice(0, 3);
  const selectedTenant = tenants.find((t) => t.id === Number(selectedTenantId));

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Perhitungan SPK</h1>
          <p className="text-[#8B735C] mt-2">
            Hitung rekomendasi cafe terbaik menggunakan metode SAW, WP, atau TOPSIS
          </p>
        </div>
        {hasResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#E8DED5] text-[#6F4E37] font-semibold hover:bg-[#F8F4EF] transition"
          >
            <RotateCcw size={16} />
            Hitung Ulang
          </button>
        )}
      </div>

      {/* KONFIGURASI */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-5 shadow-[0_10px_40px_rgba(62,44,35,0.08)] space-y-4">
        <h2 className="font-bold text-[#3E2C23] text-base flex items-center gap-2">
          <BarChart3 size={18} className="text-[#C97A2B]" />
          Konfigurasi Perhitungan
        </h2>

        {/* PILIH METODE */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
            Metode Perhitungan *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelectedMethod(m.value)}
                disabled={hasResult}
                className={`p-3 rounded-2xl text-left border-2 transition-all ${
                  selectedMethod === m.value
                    ? "bg-gradient-to-br from-[#FFF4E8] to-[#FFE8CC] border-[#C97A2B] shadow-md"
                    : "bg-[#FAF8F5] border-[#E8DED5] hover:border-[#C8A27C]"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-base font-black font-mono ${
                      selectedMethod === m.value ? "text-[#C97A2B]" : "text-[#3E2C23]"
                    }`}
                  >
                    {m.label}
                  </span>
                  {selectedMethod === m.value && (
                    <span className="w-5 h-5 rounded-full bg-[#C97A2B] flex items-center justify-center">
                      <ChevronRight size={12} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8B735C] leading-snug">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* PILIH TENANT */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
            Tenant *
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            disabled={hasResult}
            className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">Pilih Tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-2xl">⚠ {error}</p>
        )}

        {/* TOMBOL HITUNG */}
        {!hasResult && (
          <button
            onClick={handleHitung}
            disabled={isCalculating || !selectedTenantId}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-bold text-lg shadow-lg hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isCalculating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menghitung...
              </>
            ) : (
              <>
                <Calculator size={20} />
                Hitung Rekomendasi
              </>
            )}
          </button>
        )}
      </div>

      {/* HASIL */}
      {hasResult && (
        <div className="space-y-4 animate-in fade-in duration-500">

          {/* INFO HASIL */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-[#FFF4E8] border border-[#F0D5B0] text-[#C97A2B] font-black text-sm font-mono">
              {currentMethod}
            </span>
            {selectedTenant && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F8F4EF] border border-[#E8DED5] text-[#6F4E37] font-semibold text-sm">
                <Building2 size={14} />
                {selectedTenant.name}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F8F4EF] border border-[#E8DED5] text-[#6F4E37] font-semibold text-sm">
              <Coffee size={14} />
              {currentResult.length} Cafe
            </span>
          </div>

          {/* TOP 3 CARDS */}
          <div>
            <h2 className="font-bold text-[#3E2C23] text-base mb-2 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              Top 3 Rekomendasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {top3.map((item, index) => {
                const config = RANK_CONFIG[index];
                return (
                  <div
                    key={item.cafeId}
                    className={`bg-gradient-to-br ${config.bg} border-2 ${config.border} rounded-2xl pl-4 pr-9 py-4 relative overflow-hidden flex items-center gap-4`}
                  >
                    <div className="shrink-0">
                      {React.cloneElement(config.icon, { size: 26 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#8B735C] uppercase tracking-wider leading-none mb-0.5">
                        {config.label}
                      </p>
                      <p className="font-black text-[#3E2C23] text-lg leading-tight truncate">
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-[#8B735C] font-medium leading-none mb-0.5">Skor</p>
                      <p className="text-xl font-black text-[#3E2C23] font-mono leading-tight">
                        {item.score.toFixed(4)}
                      </p>
                    </div>
                    <div className={`absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 rounded-md ${config.badge} flex items-center justify-center font-black text-[10px]`}>
                      #{config.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABEL DETAIL */}
          <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
            <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white">
              <h2 className="font-bold text-[#3E2C23] text-lg">
                Hasil Lengkap — Metode {currentMethod}
              </h2>
              <p className="text-xs text-[#8B735C] mt-0.5">
                Diurutkan dari skor tertinggi ke terendah
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#F8F4EF] text-[#6F4E37] text-sm">
                    <th className="p-3 text-left w-16">Rank</th>
                    <th className="p-3 text-left">Nama Cafe</th>
                    <th className="p-3 text-center">Skor</th>
                    <th className="p-3 text-center">Visualisasi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResult.map((item, index) => {
                    const maxScore = currentResult[0]?.score ?? 1;
                    const pct = maxScore === 0 ? 0 : (item.score / maxScore) * 100;
                    const isTop = index === 0;
                    const isTop3 = index < 3;

                    return (
                      <tr
                        key={item.cafeId}
                        className={`border-b border-[#F4ECE4] transition ${
                          isTop ? "bg-[#FFFBF4]" : "hover:bg-[#FCFAF8]"
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center justify-center">
                            {index === 0 ? (
                              <Trophy size={20} className="text-yellow-500" />
                            ) : index === 1 ? (
                              <Medal size={20} className="text-gray-400" />
                            ) : index === 2 ? (
                              <Star size={20} className="text-orange-400" />
                            ) : (
                              <span className="flex items-center gap-1 text-[#8B735C] font-bold text-sm">
                                <Hash size={13} />
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center shrink-0">
                              <Coffee size={12} className="text-white" />
                            </div>
                            <div>
                              <p className={`font-bold ${isTop ? "text-[#C97A2B]" : "text-[#3E2C23]"}`}>
                                {item.name}
                              </p>
                              {isTop3 && (
                                <p className="text-xs text-[#8B735C]">
                                  {index === 0 ? "🏆 Rekomendasi Utama" : index === 1 ? "🥈 Runner Up" : "🥉 Alternatif Terbaik"}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`font-black font-mono text-lg ${isTop ? "text-[#C97A2B]" : "text-[#3E2C23]"}`}>
                            {item.score.toFixed(4)}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className="flex-1 h-2.5 bg-[#F0E8DF] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isTop
                                    ? "bg-gradient-to-r from-[#C97A2B] to-[#F5C07A]"
                                    : "bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C]"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#8B735C] font-mono w-10 text-right shrink-0">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerhitunganSPK;