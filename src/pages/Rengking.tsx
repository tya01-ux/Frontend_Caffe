import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Star, MapPin, Tag, Search, Loader2, RefreshCw, Award, Building2, LogIn,
} from "lucide-react";
import { useCafeStore, type Cafe } from "../store/useCaffeStore";
import { useSPKStore, type RankingItem } from "../store/useSPKStore";
import { useTenantStore } from "../store/useTenantStore";
import { useAuthStore } from "../store/authStore";

function findCriteriaValue(cafe: Cafe, keyword: string): number | null {
  const entry = cafe.values?.find(
    (v) =>
      v.criteria?.code?.toLowerCase().includes(keyword) ||
      v.criteria?.name?.toLowerCase().includes(keyword)
  );
  return entry ? entry.value : null;
}

function getCafeRating(cafe: Cafe): number | null {
  const rating = findCriteriaValue(cafe, "rating");
  if (rating !== null) return rating;
  const benefitValues = cafe.values?.filter((v) => v.criteria?.type === "BENEFIT") ?? [];
  if (!benefitValues.length) return null;
  const avg = benefitValues.reduce((sum, v) => sum + v.value, 0) / benefitValues.length;
  return Math.min(5, Math.round(avg * 10) / 10);
}

function getCafeHarga(cafe: Cafe): number | null {
  return findCriteriaValue(cafe, "harga") ?? findCriteriaValue(cafe, "price");
}

function getCafeJarak(cafe: Cafe): number | null {
  return findCriteriaValue(cafe, "jarak") ?? findCriteriaValue(cafe, "distance");
}

function formatHargaRange(cafe: Cafe): string {
  const harga = getCafeHarga(cafe);
  if (harga === null || harga === 0) return "—";
  const min = Math.floor(harga / 1000) * 1000;
  const max = min + 25000;
  return `Rp${min.toLocaleString("id-ID")} - Rp${max.toLocaleString("id-ID")}`;
}

// ============ TYPES ============
interface RankingRow {
  cafeId: number;
  name: string;
  saw: number | null;
  wp: number | null;
  topsis: number | null;
  skorAkhir: number;
}

type MetodeOption = "AVG" | "SAW" | "WP" | "TOPSIS";
type SortOption = "skor" | "rating" | "harga" | "jarak";

const METODE_OPTIONS: { value: MetodeOption; label: string }[] = [
  { value: "AVG", label: "Rata-rata (SAW, WP, TOPSIS)" },
  { value: "SAW", label: "SAW" },
  { value: "WP", label: "WP" },
  { value: "TOPSIS", label: "TOPSIS" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "skor", label: "Skor (Tertinggi)" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "harga", label: "Harga Terendah" },
  { value: "jarak", label: "Jarak Terdekat" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Ranking() {
  const navigate = useNavigate();
  const { cafes, fetchCafes } = useCafeStore();
  const { tenants, fetchTenants } = useTenantStore();
  const { user } = useAuthStore();
  const { calculateAll, allResult, isCalculating, error, clearResult } = useSPKStore();

  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [metode, setMetode] = useState<MetodeOption>("AVG");
  const [sortBy, setSortBy] = useState<SortOption>("skor");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCafes();
    fetchTenants();
  }, [fetchCafes, fetchTenants]);

  useEffect(() => {
    if (!selectedTenantId && tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  const computeRanking = async () => {
    if (!user || !selectedTenantId) return;
    clearResult();
    const ok = await calculateAll(selectedTenantId);
    if (ok) setLastUpdated(new Date());
  };

  useEffect(() => {
    if (user && selectedTenantId) {
      computeRanking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTenantId]);

  // Gabungkan allResult.{SAW,WP,TOPSIS} (masing-masing RankingItem[]) jadi satu tabel ranking.
  const rankingRows: RankingRow[] = useMemo(() => {
    if (!allResult) return [];

    const sawMap = new Map<number, number>();
    const wpMap = new Map<number, number>();
    const topsisMap = new Map<number, number>();
    const namesByCafe = new Map<number, string>();

    allResult.SAW.forEach((item: RankingItem) => {
      sawMap.set(item.cafeId, item.score);
      namesByCafe.set(item.cafeId, item.name);
    });
    allResult.WP.forEach((item: RankingItem) => {
      wpMap.set(item.cafeId, item.score);
      namesByCafe.set(item.cafeId, item.name);
    });
    allResult.TOPSIS.forEach((item: RankingItem) => {
      topsisMap.set(item.cafeId, item.score);
      namesByCafe.set(item.cafeId, item.name);
    });

    return Array.from(namesByCafe.entries()).map(([cafeId, name]) => {
      const saw = sawMap.get(cafeId) ?? null;
      const wp = wpMap.get(cafeId) ?? null;
      const topsis = topsisMap.get(cafeId) ?? null;
      const scores = [saw, wp, topsis].filter((s): s is number => s !== null);
      const skorAkhir = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { cafeId, name, saw, wp, topsis, skorAkhir };
    });
  }, [allResult]);

  const cafeMap = useMemo(() => {
    const map = new Map<number, Cafe>();
    cafes.forEach((c) => map.set(c.id, c));
    return map;
  }, [cafes]);

  const getSkorTampil = (row: RankingRow) => {
    if (metode === "AVG") return row.skorAkhir;
    if (metode === "SAW") return row.saw ?? 0;
    if (metode === "WP") return row.wp ?? 0;
    return row.topsis ?? 0;
  };

  const displayRows = useMemo(() => {
    let rows = rankingRows.filter((row) => {
      const matchSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });

    rows = [...rows].sort((a, b) => {
      const cafeA = cafeMap.get(a.cafeId);
      const cafeB = cafeMap.get(b.cafeId);

      if (sortBy === "rating") return (getCafeRating(cafeB!) ?? 0) - (getCafeRating(cafeA!) ?? 0);
      if (sortBy === "harga") return (getCafeHarga(cafeA!) ?? Infinity) - (getCafeHarga(cafeB!) ?? Infinity);
      if (sortBy === "jarak") return (getCafeJarak(cafeA!) ?? Infinity) - (getCafeJarak(cafeB!) ?? Infinity);
      return getSkorTampil(b) - getSkorTampil(a);
    });

    return rows;
  }, [rankingRows, cafeMap, searchQuery, sortBy, metode]);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  return (
    <section className="min-h-screen bg-[#F7F3EC] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h1 className="font-serif text-3xl font-black text-[#2A1E14] md:text-4xl">
              Perankingan Cafe
            </h1>
            <p className="mt-1 text-sm text-[#8A7A66]">
              Lihat peringkat cafe terbaik berdasarkan perhitungan keseluruhan, sesuai preferensimu.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#E8DED5] bg-white px-3.5 py-2 text-xs text-[#8A7A66]">
            {lastUpdated && (
              <>
                Terakhir diperbarui:{" "}
                {lastUpdated.toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                })}{" "}
                WIB
              </>
            )}
          </div>
        </div>

        {/* Guard: belum login */}
        {!user ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8DED5] bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4E8]">
              <LogIn size={22} className="text-[#C97A2B]" />
            </div>
            <p className="text-sm font-bold text-[#2A1E14]">Masuk dulu untuk lihat ranking</p>
            <p className="max-w-sm text-xs text-[#8A7A66]">
              Ranking dihitung pakai bobot preferensi pribadimu, jadi kamu perlu login dulu
              biar hasilnya relevan buat kamu.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 rounded-xl bg-[#2A1E14] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3D2B1C] transition"
            >
              Masuk Sekarang
            </button>
          </div>
        ) : (
          <>
            {/* Banner Top Cafe Overall */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2A1E14] via-[#3D2B1C] to-[#5C3D24] px-8 py-7">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Award size={26} className="text-[#D4A24C]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-white">
                    Top Cafe {selectedTenant ? `di ${selectedTenant.name}` : "Overall"}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    Berdasarkan perhitungan terbaik dari semua metode, sesuai bobot preferensimu
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Metode: {METODE_OPTIONS.find((m) => m.value === metode)?.label}
                  </span>
                </div>
                <Trophy size={64} className="hidden flex-shrink-0 text-[#D4A24C]/80 sm:block" />
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[#E8DED5] bg-white p-4 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#8A7A66]">
                  Metode Perhitungan
                </label>
                <select
                  value={metode}
                  onChange={(e) => setMetode(e.target.value as MetodeOption)}
                  className="w-full rounded-xl border border-[#E8DED5] bg-[#FAF8F5] px-3 py-2 text-sm text-[#2A1E14] outline-none focus:ring-2 focus:ring-[#C8A27C]"
                >
                  {METODE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#8A7A66] flex items-center gap-1">
                  <Building2 size={11} className="text-[#C97A2B]" />
                  Tenant
                </label>
                <select
                  value={selectedTenantId ?? ""}
                  onChange={(e) => setSelectedTenantId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-xl border border-[#E8DED5] bg-[#FAF8F5] px-3 py-2 text-sm text-[#2A1E14] outline-none focus:ring-2 focus:ring-[#C8A27C]"
                >
                  {tenants.length === 0 && <option value="">Memuat tenant...</option>}
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#8A7A66]">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-[#E8DED5] bg-[#FAF8F5] px-3 py-2 text-sm text-[#2A1E14] outline-none focus:ring-2 focus:ring-[#C8A27C]"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-[1.3] space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#8A7A66] sm:invisible">
                  Cari
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7A66]" size={16} />
                  <input
                    type="text"
                    placeholder="Cari cafe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#E8DED5] bg-[#FAF8F5] py-2 pl-9 pr-3 text-sm text-[#2A1E14] outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={computeRanking}
                disabled={isCalculating || !selectedTenantId}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2A1E14] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D2B1C] disabled:opacity-60 sm:self-end"
              >
                {isCalculating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Hitung Ulang
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Tabel Ranking */}
            <div className="overflow-x-auto rounded-2xl border border-[#E8DED5] bg-white">
              {isCalculating && rankingRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-[#8A7A66]">
                  <Loader2 className="animate-spin text-[#2A1E14]" size={32} />
                  <span className="text-sm font-medium">Menghitung SAW, WP, dan TOPSIS...</span>
                </div>
              ) : displayRows.length === 0 ? (
                <div className="py-20 text-center text-sm text-[#8A7A66]">
                  Belum ada data ranking untuk tenant ini.
                </div>
              ) : (
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b border-[#E8DED5] text-left text-xs font-bold uppercase tracking-wide text-[#8A7A66]">
                      <th className="px-5 py-3 w-12">#</th>
                      <th className="px-5 py-3">Cafe</th>
                      <th className="px-5 py-3">Metode</th>
                      <th className="px-5 py-3 text-center">Skor Akhir</th>
                      <th className="px-5 py-3">Rating</th>
                      <th className="px-5 py-3">Harga</th>
                      <th className="px-5 py-3">Jarak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, index) => {
                      const cafe = cafeMap.get(row.cafeId);
                      const rating = cafe ? getCafeRating(cafe) : null;
                      const jarak = cafe ? getCafeJarak(cafe) : null;
                      const skorTampil = getSkorTampil(row);

                      return (
                        <tr
                          key={row.cafeId}
                          onClick={() => navigate(`/cafes/${row.cafeId}`)}
                          className="cursor-pointer border-b border-[#F0E8DF] transition hover:bg-[#FAF8F5]"
                        >
                          <td className="px-5 py-4 text-lg">
                            {index < 3 ? MEDALS[index] : <span className="text-sm font-bold text-[#8A7A66]">{index + 1}</span>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0E8DF]">
                                <img
                                  src={cafe?.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80"}
                                  alt={row.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#2A1E14]">{row.name}</p>
                                <p className="text-xs text-[#8A7A66]">{cafe?.lokasi || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="rounded-full bg-[#FBEFE0] px-2 py-0.5 text-[11px] font-semibold text-[#9C5419]">
                                SAW {row.saw !== null ? row.saw.toFixed(3) : "—"}
                              </span>
                              <span className="rounded-full bg-[#E8EEF7] px-2 py-0.5 text-[11px] font-semibold text-[#3A5A8C]">
                                WP {row.wp !== null ? row.wp.toFixed(3) : "—"}
                              </span>
                              <span className="rounded-full bg-[#E5F2E8] px-2 py-0.5 text-[11px] font-semibold text-[#2E7D4F]">
                                TOPSIS {row.topsis !== null ? row.topsis.toFixed(3) : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-base font-black text-[#2A1E14]">
                              {skorTampil.toFixed(3)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-sm font-semibold text-[#2A1E14]">
                              <Star size={13} className="fill-[#D4A24C] text-[#D4A24C]" />
                              {rating !== null ? rating.toFixed(1) : "Baru"}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-sm text-[#6B5C4D]">
                              <Tag size={13} />
                              {formatHargaRange(cafe!)}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-sm text-[#6B5C4D]">
                              <MapPin size={13} />
                              {jarak !== null ? `${jarak} km` : "—"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}