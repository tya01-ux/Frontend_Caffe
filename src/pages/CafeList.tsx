import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, Search, MapPin, Loader2, SlidersHorizontal, X,
  ArrowUpDown, Wallet, Compass, Tag, GitCompare, Check,
  ChevronRight, Trophy, Info, Save, RotateCcw, LayoutGrid,
  Building2, Calculator, Wifi, Coffee, Zap, Users, Car,
  Music, Sun, Clock, ParkingCircle, Heart, type LucideIcon,
} from "lucide-react";
import { useCafeStore, type Cafe, type CafeValue } from "../store/useCaffeStore";
import { useAuthStore } from "../store/authStore";
import { useUserCriteriaWeightStore } from "../store/useusercriteriaweightstore";
import { useCriteriaStore } from "../store/useCriteriaStore";
import { useTenantStore } from "../store/useTenantStore";
import { useSPKStore, type SPKMethod as SPKMethodType } from "../store/useSPKStore";
import { useActivityLogStore } from "../store/useActivityLogStore";
import { useFavoriteStore } from "../store/useFavoriteStore";

// ============ HELPERS ============
function findCriteriaValue(cafe: Cafe, keyword: string): number | null {
  const entry = cafe.values?.find(
    (v: CafeValue) =>
      v.criteria?.code?.toLowerCase().includes(keyword) ||
      v.criteria?.name?.toLowerCase().includes(keyword)
  );
  return entry ? entry.value : null;
}

function getCafeRating(cafe: Cafe): number | null {
  const rating = findCriteriaValue(cafe, "rating");
  if (rating !== null) return rating;
  const benefitValues = cafe.values?.filter((v: CafeValue) => v.criteria?.type === "BENEFIT") ?? [];
  if (!benefitValues.length) return null;
  const avg = benefitValues.reduce((sum: number, v: CafeValue) => sum + v.value, 0) / benefitValues.length;
  return Math.min(5, Math.round(avg * 10) / 10);
}

const HARGA_KEYWORDS = ["harga", "price", "budget", "biaya", "cost"];
const JARAK_KEYWORDS = ["jarak", "distance", "km"];

function getCafeHarga(cafe: Cafe): number | null {
  for (const kw of HARGA_KEYWORDS) {
    const val = findCriteriaValue(cafe, kw);
    if (val !== null && val > 0) return val;
  }
  return null;
}

function getCafeJarak(cafe: Cafe): number | null {
  for (const kw of JARAK_KEYWORDS) {
    const val = findCriteriaValue(cafe, kw);
    if (val !== null) return val;
  }
  return null;
}

function formatHargaRange(cafe: Cafe): string {
  const harga = getCafeHarga(cafe);
  if (harga === null) return "—";
  const min = Math.floor(harga / 1000) * 1000;
  const max = min + 25000;
  return `Rp${min.toLocaleString("id-ID")} – Rp${max.toLocaleString("id-ID")}`;
}

const EXCLUDED_KEYWORDS = ["rating", "harga", "price", "jarak", "distance", "budget", "biaya", "cost", "km"];
function isFacilityCriteria(name: string) {
  const lower = name.toLowerCase();
  return !EXCLUDED_KEYWORDS.some((k) => lower.includes(k));
}
function cafeHasFacility(cafe: Cafe, facilityName: string) {
  return cafe.values?.some((v: CafeValue) => v.criteria?.name === facilityName && v.value > 0);
}

function findValueByCriteriaId(cafe: Cafe, criteriaId: number): CafeValue | undefined {
  return cafe.values?.find(
    (v: any) => v.criteriaId === criteriaId || v.criteria?.id === criteriaId
  );
}

export function getCriteriaIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return Wifi;
  if (lower.includes("harga") || lower.includes("price") || lower.includes("budget") || lower.includes("biaya")) return Wallet;
  if (lower.includes("jarak") || lower.includes("distance") || lower.includes("lokasi")) return Compass;
  if (lower.includes("rating") || lower.includes("ulasan")) return Star;
  if (lower.includes("kopi") || lower.includes("coffee") || lower.includes("menu")) return Coffee;
  if (lower.includes("listrik") || lower.includes("colokan") || lower.includes("power") || lower.includes("outlet")) return Zap;
  if (lower.includes("kapasitas") || lower.includes("seat") || lower.includes("tempat duduk")) return Users;
  if (lower.includes("parkir") || lower.includes("parking")) return ParkingCircle;
  if (lower.includes("musik") || lower.includes("music")) return Music;
  if (lower.includes("outdoor") || lower.includes("luar") || lower.includes("terbuka")) return Sun;
  if (lower.includes("jam") || lower.includes("buka") || lower.includes("operasional") || lower.includes("hour")) return Clock;
  if (lower.includes("mobil") || lower.includes("kendaraan") || lower.includes("akses")) return Car;
  return Tag;
}

function getCriteriaDescription(name: string, type: "COST" | "BENEFIT"): string {
  return type === "COST" ? "Semakin rendah nilainya, semakin baik" : "Semakin tinggi nilainya, semakin baik";
}

const IMPORTANCE_MIN = 1;
const IMPORTANCE_MAX = 5;
const IMPORTANCE_LABELS: Record<number, string> = {
  1: "Tidak penting", 2: "Kurang penting", 3: "Cukup penting", 4: "Penting", 5: "Sangat penting",
};
function getImportanceLabel(value: number): string { return IMPORTANCE_LABELS[value] ?? ""; }

// ============ TYPES ============
type SortOption = "" | "terdekat" | "rating" | "harga_asc" | "harga_desc";
export type SPKMethod = "SAW" | "WP" | "TOPSIS";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "terdekat", label: "Terdekat" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "harga_asc", label: "Harga Terendah" },
  { value: "harga_desc", label: "Harga Tertinggi" },
];

const SPK_METHODS: { value: SPKMethod; label: string; desc: string; color: string }[] = [
  { value: "SAW", label: "SAW", desc: "Penjumlahan nilai ternormalisasi × bobot", color: "border-[#2A1E14] bg-[#2A1E14] text-white" },
  { value: "WP", label: "WP", desc: "Perkalian nilai berpangkat bobot", color: "border-[#6B5C4D] bg-[#6B5C4D] text-white" },
  { value: "TOPSIS", label: "TOPSIS", desc: "Rangking berdasarkan jarak ke solusi ideal", color: "border-[#A0714F] bg-[#A0714F] text-white" },
];

export const METHOD_BADGE: Record<SPKMethod, string> = {
  SAW: "bg-[#FFF4E8] text-[#C97A2B] border-[#F0D5B0]",
  WP: "bg-[#F8F4EF] text-[#6B5C4D] border-[#E8DED5]",
  TOPSIS: "bg-[#FAF8F5] text-[#8B5E3C] border-[#D4B896]",
};

const MAX_HARGA = 100000;
const MAX_JARAK = 10;
const MAX_COMPARE = 3;
const API_BASE = "http://localhost:3000";

interface FilterState {
  sort: SortOption;
  lokasi: string;
  maxHarga: number;
  minRating: number;
  maxJarak: number;
  facilities: string[];
}

const DEFAULT_FILTER: FilterState = {
  sort: "", lokasi: "", maxHarga: MAX_HARGA, minRating: 0, maxJarak: MAX_JARAK, facilities: [],
};

// ============ COMPARE MODAL ============
function CompareModal({ cafes: initialCafes, onClose }: { cafes: Cafe[]; onClose: () => void }) {
  const [cafes, setCafes] = useState<Cafe[]>(initialCafes);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    setLoadingDetails(true);
    Promise.all(
      initialCafes.map((cafe) =>
        fetch(`${API_BASE}/cafes/${cafe.id}`)
          .then((r) => r.json())
          .then((data) => {
            const fetched = data?.data ?? data;
            const rawValues =
              fetched?.values ??
              fetched?.cafecriteriavalue ??
              fetched?.cafeCriteriaValue ??
              fetched?.CafeCriteriaValue ??
              fetched?.cafeValues ??
              cafe.values ??
              [];
            return { ...cafe, ...fetched, values: rawValues };
          })
          .catch(() => cafe)
      )
    ).then((enriched) => {
      setCafes(enriched);
      setLoadingDetails(false);
    });
  }, []);

  const allCriteriaNames = useMemo(() => {
    const set = new Set<string>();
    cafes.forEach((cafe) => {
      cafe.values?.forEach((v: CafeValue) => { if (v.criteria?.name) set.add(v.criteria.name); });
    });
    return Array.from(set);
  }, [cafes]);

  const getValue = (cafe: Cafe, criteriaName: string): number | null => {
    const entry = cafe.values?.find((v: CafeValue) => v.criteria?.name === criteriaName);
    return entry ? entry.value : null;
  };

  const getBestIdx = (criteriaName: string, type: "BENEFIT" | "COST" | undefined): number => {
    const vals = cafes.map((c) => getValue(c, criteriaName));
    if (vals.every((v) => v === null)) return -1;
    if (type === "COST") {
      const min = Math.min(...(vals.filter((v) => v !== null) as number[]));
      return vals.findIndex((v) => v === min);
    }
    const max = Math.max(...(vals.filter((v) => v !== null) as number[]));
    return vals.findIndex((v) => v === max);
  };

  const recommendation = useMemo(() => {
    const rows: { name: string; type: "BENEFIT" | "COST"; getVal: (c: Cafe) => number | null }[] = [
      { name: "Harga", type: "COST", getVal: getCafeHarga },
      { name: "Jarak", type: "COST", getVal: getCafeJarak },
      ...allCriteriaNames.map((name) => {
        const type = cafes.flatMap((c) => c.values ?? []).find((v) => v.criteria?.name === name)?.criteria?.type ?? "BENEFIT";
        return { name, type, getVal: (c: Cafe) => getValue(c, name) };
      }),
    ];
    const wins = cafes.map(() => 0);
    let totalComparable = 0;
    rows.forEach((row) => {
      const vals = cafes.map((c) => row.getVal(c));
      const validVals = vals.filter((v): v is number => v !== null);
      if (validVals.length < 2) return;
      totalComparable++;
      const best = row.type === "COST" ? Math.min(...validVals) : Math.max(...validVals);
      const bestIdx = vals.findIndex((v) => v === best);
      if (bestIdx !== -1) wins[bestIdx]++;
    });
    if (totalComparable === 0) return null;
    const maxWin = Math.max(...wins);
    if (maxWin === 0) return null;
    return { winnerIdx: wins.indexOf(maxWin), winCount: maxWin, totalComparable };
  }, [cafes, allCriteriaNames]);

  const winnerCafe = recommendation ? cafes[recommendation.winnerIdx] : null;
  const isWinnerCol = (cafeId: number) => winnerCafe?.id === cafeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] flex items-center justify-center">
              <GitCompare size={18} className="text-[#C97A2B]" />
            </div>
            <div>
              <h2 className="font-black text-[#2A1E14] text-xl">Perbandingan Cafe</h2>
              <p className="text-xs text-[#8A7A66]">{cafes.length} cafe dipilih</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition">
            <X size={18} />
          </button>
        </div>

        {loadingDetails && (
          <div className="flex items-center justify-center gap-3 py-6 text-[#8A7A66] shrink-0">
            <Loader2 size={20} className="animate-spin text-[#C8A27C]" />
            <span className="text-sm">Memuat detail kriteria cafe...</span>
          </div>
        )}

        {!loadingDetails && winnerCafe && recommendation && (
          <div className="mx-6 mt-5 flex items-center gap-3 rounded-2xl border border-[#F0D5B0] bg-[#FFF8E8] px-5 py-4 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFE0] text-[#D4A24C] shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              {/* <p className="text-[10px] font-bold uppercase tracking-wide text-[#9C5419]">🏆 Rekomendasi Terbaik</p> */}
              <p className="text-base font-black text-[#2A1E14]">{winnerCafe.name}</p>
              <p className="text-xs text-[#8A7A66]">Unggul di <strong>{recommendation.winCount}</strong> dari <strong>{recommendation.totalComparable}</strong> kriteria yang bisa dibandingkan</p>
            </div>
          </div>
        )}

        {!loadingDetails && allCriteriaNames.length === 0 && getCafeHarga(cafes[0]) === null && getCafeJarak(cafes[0]) === null && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-700 shrink-0">
            ⚠ Data nilai kriteria cafe belum tersedia. Pastikan admin sudah mengisi Nilai Alternatif untuk cafe-cafe ini.
          </div>
        )}

        <div className="overflow-auto flex-1 mt-2">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-[#F8F4EF] px-5 py-4 text-left text-xs font-bold text-[#6F4E37] uppercase tracking-wider w-36 z-10">
                  Kriteria
                </th>
                {cafes.map((cafe) => {
                  const rating = getCafeRating(cafe);
                  const isWinner = isWinnerCol(cafe.id);
                  return (
                    <th key={cafe.id} className={`px-5 py-4 text-center border-l border-[#F0E8DF] ${isWinner ? "bg-[#FFFBF0]" : "bg-[#FAF8F5]"}`}>
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-[#F0E8DF] shrink-0 ${isWinner ? "ring-2 ring-[#D4A24C]" : ""}`}>
                          <img src={cafe.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80"} alt={cafe.name} className="w-full h-full object-cover" />
                        </div>
                        <p className={`flex items-center gap-1 font-black text-sm ${isWinner ? "text-[#9C5419]" : "text-[#2A1E14]"}`}>
                          {isWinner && <Trophy size={12} className="text-[#D4A24C]" />}
                          {cafe.name}
                        </p>
                        {rating !== null && (
                          <div className="flex items-center gap-1 text-xs font-bold text-[#C97A2B]">
                            <Star size={11} className="fill-[#D4A24C] text-[#D4A24C]" />
                            {rating.toFixed(1)}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-[#8A7A66]">
                          <MapPin size={11} />
                          {cafe.lokasi || "—"}
                        </div>
                        {isWinner && (
                          <span className="bg-[#D4A24C] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            Terbaik
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {(() => {
                const vals = cafes.map((c) => getCafeHarga(c));
                const validVals = vals.filter((v): v is number => v !== null);
                const min = validVals.length ? Math.min(...validVals) : null;
                return (
                  <tr className="border-t border-[#F0E8DF]">
                    <td className="sticky left-0 bg-white px-5 py-4 text-sm font-bold text-[#6F4E37] z-10">
                      <div className="flex items-center gap-1.5">
                        <Wallet size={13} className="text-[#C97A2B]" />
                        Harga
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-500">COST</span>
                      </div>
                    </td>
                    {cafes.map((cafe) => {
                      const harga = getCafeHarga(cafe);
                      const isBest = harga !== null && min !== null && harga === min;
                      return (
                        <td key={cafe.id} className={`px-5 py-4 text-center border-l border-[#F0E8DF] ${isWinnerCol(cafe.id) ? "bg-[#FFFBF0]" : ""}`}>
                          <span className={`text-sm font-bold ${isBest ? "text-green-600" : "text-[#2A1E14]"}`}>
                            {harga !== null ? formatHargaRange(cafe) : "—"}
                          </span>
                          {isBest && <span className="ml-1 text-green-500">✓</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {(() => {
                const vals = cafes.map((c) => getCafeJarak(c));
                const validVals = vals.filter((v): v is number => v !== null);
                const min = validVals.length ? Math.min(...validVals) : null;
                return (
                  <tr className="border-t border-[#F0E8DF] bg-[#FDFCFA]">
                    <td className="sticky left-0 bg-[#FDFCFA] px-5 py-4 text-sm font-bold text-[#6F4E37] z-10">
                      <div className="flex items-center gap-1.5">
                        <Compass size={13} className="text-[#C97A2B]" />
                        Jarak
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-500">COST</span>
                      </div>
                    </td>
                    {cafes.map((cafe) => {
                      const jarak = getCafeJarak(cafe);
                      const isBest = jarak !== null && min !== null && jarak === min;
                      return (
                        <td key={cafe.id} className={`px-5 py-4 text-center border-l border-[#F0E8DF] ${isWinnerCol(cafe.id) ? "bg-[#FFFBF0]" : "bg-[#FDFCFA]"}`}>
                          <span className={`text-sm font-bold ${isBest ? "text-green-600" : "text-[#2A1E14]"}`}>
                            {jarak !== null ? `${jarak} km` : "—"}
                          </span>
                          {isBest && <span className="ml-1 text-green-500">✓</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {allCriteriaNames.map((criteriaName, i) => {
                const type = cafes.flatMap((c) => c.values ?? []).find((v) => v.criteria?.name === criteriaName)?.criteria?.type;
                const bestIdx = getBestIdx(criteriaName, type);
                const rowBg = i % 2 === 0 ? "" : "bg-[#FDFCFA]";
                return (
                  <tr key={criteriaName} className={`border-t border-[#F0E8DF] ${rowBg}`}>
                    <td className={`sticky left-0 px-5 py-4 text-sm font-bold text-[#6F4E37] z-10 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"}`}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {criteriaName}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${type === "BENEFIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                          {type}
                        </span>
                      </div>
                    </td>
                    {cafes.map((cafe, idx) => {
                      const val = getValue(cafe, criteriaName);
                      const isBest = idx === bestIdx && val !== null;
                      return (
                        <td key={cafe.id} className={`px-5 py-4 text-center border-l border-[#F0E8DF] ${isWinnerCol(cafe.id) ? "bg-[#FFFBF0]" : ""}`}>
                          <span className={`text-sm font-bold ${isBest ? "text-green-600" : "text-[#2A1E14]"}`}>
                            {val !== null ? val : "—"}
                          </span>
                          {isBest && <span className="ml-1 text-green-500">✓</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#F0E8DF] bg-[#FAF8F5] flex items-center justify-between">
          {/* <p className="text-xs text-[#8A7A66]">✓ = nilai terbaik untuk kriteria tersebut &nbsp;·&nbsp; 🏆 = cafe paling unggul secara keseluruhan</p> */}
          <button onClick={onClose} className="px-6 py-2.5 rounded-2xl bg-[#2A1E14] text-white font-bold text-sm hover:opacity-90 transition">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ============ ATUR BOBOT PANEL (di-export biar bisa dipakai dari Profile.tsx juga) ============
interface AturBobotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (method: SPKMethod, tenantId: number) => void;
  initialTenantId?: number | null;
}

export function AturBobotPanel({ isOpen, onClose, onApply, initialTenantId }: AturBobotPanelProps) {
  const { user } = useAuthStore();
  const { criterias, fetchCriterias } = useCriteriaStore();
  const { tenants, fetchTenants } = useTenantStore();
  const { weights: savedWeights, fetchWeights, setWeights, resetWeights, isLoading, error, clearError } = useUserCriteriaWeightStore();
  const { createLog } = useActivityLogStore();

  const [selectedMethod, setSelectedMethod] = useState<SPKMethod>("SAW");
  const [tenantId, setTenantId] = useState<number | null>(initialTenantId ?? null);
  const [localWeights, setLocalWeights] = useState<Record<number, number>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const isImportanceMethod = selectedMethod !== "SAW";

  useEffect(() => { if (!isOpen) return; fetchTenants(); fetchCriterias(); }, [isOpen]);

  // Kalau dibuka dengan initialTenantId (mis. dari Profile), pakai itu.
  // Kalau tidak, fallback ke tenant pertama.
  useEffect(() => {
    if (!isOpen) return;
    if (initialTenantId) { setTenantId(initialTenantId); return; }
    if (tenants.length > 0 && !tenantId) setTenantId(tenants[0].id);
  }, [isOpen, tenants, initialTenantId]);

  useEffect(() => { if (!isOpen || !user?.id || !tenantId) return; fetchWeights(user.id, tenantId); }, [isOpen, user?.id, tenantId]);

  const tenantCriterias = criterias.filter((c) => c.tenantId === tenantId);

  useEffect(() => {
    if (!tenantCriterias.length) return;
    if (savedWeights.length > 0) {
      const map: Record<number, number> = {};
      savedWeights.forEach((w) => {
        map[w.criteriaId] = isImportanceMethod
          ? Math.min(IMPORTANCE_MAX, Math.max(IMPORTANCE_MIN, Math.round(w.weight * IMPORTANCE_MAX)))
          : Math.round(w.weight * 100);
      });
      setLocalWeights(map);
    } else {
      const map: Record<number, number> = {};
      const total = tenantCriterias.reduce((sum, c) => sum + c.weight, 0);
      tenantCriterias.forEach((c) => {
        if (isImportanceMethod) {
          const ratio = total > 0 ? c.weight / total : 1 / tenantCriterias.length;
          map[c.id] = Math.min(IMPORTANCE_MAX, Math.max(IMPORTANCE_MIN, Math.round(ratio * IMPORTANCE_MAX)));
        } else {
          map[c.id] = total > 0 ? Math.round((c.weight / total) * 100) : Math.round(100 / tenantCriterias.length);
        }
      });
      setLocalWeights(map);
    }
  }, [savedWeights, tenantCriterias.length, isImportanceMethod]);

  const totalBobot = Object.values(localWeights).reduce((sum, v) => sum + v, 0);
  const isValid = isImportanceMethod
    ? Object.values(localWeights).every((v) => v > 0) && tenantCriterias.length > 0
    : totalBobot === 100;

  const handleSliderChange = (criteriaId: number, value: number) => {
    setLocalWeights((prev) => ({ ...prev, [criteriaId]: value }));
    clearError?.(); setSuccessMsg("");
  };

  const handleAutoBalance = () => {
    const count = tenantCriterias.length;
    if (!count) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    const map: Record<number, number> = {};
    tenantCriterias.forEach((c, i) => { map[c.id] = base + (i < remainder ? 1 : 0); });
    setLocalWeights(map);
  };

  const handleReset = async () => {
    if (!user?.id || !tenantId) return;
    await resetWeights(user.id, tenantId);
    setSuccessMsg("Bobot berhasil direset!"); setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleApply = async () => {
    if (!isValid || !user?.id || !tenantId) return;
    const weightPayload = tenantCriterias.map((c) => {
      const raw = localWeights[c.id] ?? 0;
      const normalized = isImportanceMethod ? (totalBobot > 0 ? raw / totalBobot : 0) : raw / 100;
      return { criteriaId: c.id, weight: normalized };
    });
    const ok = await setWeights({ userId: user.id, tenantId, weights: weightPayload });
    if (!ok) return;
    const tenantName = tenants.find((t) => t.id === tenantId)?.name ?? "tenant";
    await createLog({ userId: user.id, action: "CALCULATE", entityType: "SPK", entityId: tenantId,
      description: `Menerapkan bobot metode ${selectedMethod} untuk tenant "${tenantName}"` });
    setSuccessMsg(`Bobot tersimpan! Metode: ${selectedMethod}`);
    setTimeout(() => setSuccessMsg(""), 3000);
    onApply?.(selectedMethod, tenantId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#F0E8DF] shrink-0">
          <div>
            <h2 className="font-black text-[#2A1E14] text-xl">Atur Bobot & Metode</h2>
            <p className="mt-1 text-sm text-[#8A7A66]">Pilih metode SPK dan tentukan bobot kriteria sesuai preferensimu.</p>
          </div>
          <button onClick={onClose} className="text-[#6B5C4D] hover:text-[#2A1E14] transition"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2"><Building2 size={15} className="text-[#2A1E14]" /><p className="text-xs font-bold uppercase tracking-wide text-[#2A1E14]">Pilih Tenant</p></div>
            <select value={tenantId ?? ""} onChange={(e) => setTenantId(Number(e.target.value))}
              className="w-full rounded-xl border border-[#E8DED5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#2A1E14] focus:border-[#2A1E14] focus:outline-none">
              <option value="">Pilih Tenant...</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2"><Calculator size={15} className="text-[#2A1E14]" /><p className="text-xs font-bold uppercase tracking-wide text-[#2A1E14]">Pilih Metode SPK</p></div>
            <div className="grid grid-cols-3 gap-2">
              {SPK_METHODS.map((m) => (
                <button key={m.value} type="button" onClick={() => setSelectedMethod(m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${selectedMethod === m.value ? m.color + " shadow-sm" : "border-[#E8DED5] bg-[#FAF8F5] text-[#6B5C4D] hover:border-[#C9B8A2]"}`}>
                  <span className="font-black text-sm font-mono">{m.label}</span>
                  <span className="text-[10px] leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#8A7A66] bg-[#FAF8F5] rounded-xl px-3 py-2">
              {selectedMethod === "SAW" && "☑ Penjumlahan nilai ternormalisasi × bobot — cocok untuk pemula"}
              {selectedMethod === "WP" && "☑ Perkalian nilai berpangkat bobot — lebih sensitif terhadap perbedaan nilai"}
              {selectedMethod === "TOPSIS" && "☑ Rangking berdasarkan jarak ke solusi ideal — paling presisi"}
            </p>
          </div>

          <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-[#FFF8E8] text-[#9C5419] border border-[#F0D5B0]">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              {isImportanceMethod
                ? <><strong>Bobot Kepentingan ({selectedMethod})</strong> — isi angka 1–5. Tidak harus total 100%, sistem normalisasi otomatis.</>
                : <>Total bobot harus tepat <strong>100%</strong></>}
            </span>
          </div>

          {isLoading ? (
            <div className="py-10 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#C8A27C]" /></div>
          ) : !tenantId ? (
            <div className="py-8 text-center text-sm text-[#8A7A66]">Pilih tenant terlebih dahulu.</div>
          ) : tenantCriterias.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#8A7A66]">Belum ada kriteria untuk tenant ini.</div>
          ) : (
            <div className="space-y-5">
              {tenantCriterias.map((criteria) => {
                const val = localWeights[criteria.id] ?? 0;
                const Icon = getCriteriaIcon(criteria.name);
                return (
                  <div key={criteria.id} className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#F3ECE2] flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-[#6F4E37]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#2A1E14]">{criteria.name}</p>
                          <p className="text-[11px] text-[#8A7A66]">{getCriteriaDescription(criteria.name, criteria.type)}</p>
                        </div>
                      </div>
                      {isImportanceMethod ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => handleSliderChange(criteria.id, Math.max(IMPORTANCE_MIN, val - 1))}
                            className="w-7 h-7 rounded-lg bg-[#F3ECE2] text-[#6F4E37] font-black flex items-center justify-center hover:bg-[#E8DED5] transition text-lg leading-none">−</button>
                          <span className="text-sm font-black w-8 text-center text-[#2A1E14] bg-white border border-[#E8DED5] rounded-xl py-1">{val}</span>
                          <button type="button" onClick={() => handleSliderChange(criteria.id, Math.min(IMPORTANCE_MAX, val + 1))}
                            className="w-7 h-7 rounded-lg bg-[#F3ECE2] text-[#6F4E37] font-black flex items-center justify-center hover:bg-[#E8DED5] transition text-lg leading-none">+</button>
                        </div>
                      ) : (
                        <span className="text-sm font-black px-3.5 py-1.5 rounded-xl bg-white border border-[#E8DED5] text-[#2A1E14] shrink-0">{val}%</span>
                      )}
                    </div>
                    {isImportanceMethod ? (
                      <div className="px-1">
                        <input type="range" min={IMPORTANCE_MIN} max={IMPORTANCE_MAX} step={1} value={val}
                          onChange={(e) => handleSliderChange(criteria.id, Number(e.target.value))} className="w-full accent-[#2A1E14] h-1.5" />
                        <div className="flex justify-between text-[10px] text-[#B8A78F] mt-0.5 px-0.5"><span>1 (Tidak penting)</span><span>5 (Sangat penting)</span></div>
                        <p className="mt-1 text-[11px] font-semibold text-[#C97A2B] text-center">{val} — {getImportanceLabel(val)}</p>
                      </div>
                    ) : (
                      <div className="px-1">
                        <input type="range" min={0} max={100} step={5} value={val}
                          onChange={(e) => handleSliderChange(criteria.id, Number(e.target.value))} className="w-full accent-[#2A1E14] h-1.5" />
                        <div className="flex justify-between text-[10px] text-[#B8A78F] mt-0.5 px-0.5"><span>0%</span><span>100%</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#F0E8DF] px-5 py-4 space-y-3 bg-[#FAF8F5]">
          {isImportanceMethod ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#8A7A66]">Distribusi Kepentingan Relatif</p>
              <div className="flex rounded-xl overflow-hidden h-3">
                {tenantCriterias.map((c, i) => {
                  const pct = totalBobot > 0 ? ((localWeights[c.id] ?? 0) / totalBobot) * 100 : 0;
                  const colors = ["bg-[#8B5E3C]","bg-[#C8A27C]","bg-[#A0714F]","bg-[#D4B896]","bg-[#6B4226]"];
                  return <div key={c.id} style={{ width: `${pct}%` }} className={`${colors[i % colors.length]} transition-all`} />;
                })}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tenantCriterias.map((c, i) => {
                  const pct = totalBobot > 0 ? ((localWeights[c.id] ?? 0) / totalBobot) * 100 : 0;
                  const colors = ["text-[#8B5E3C]","text-[#C97A2B]","text-[#A0714F]","text-[#6B4226]","text-[#D4A24C]"];
                  return <span key={c.id} className={`text-[10px] font-bold ${colors[i % colors.length]}`}>{c.name}: {pct.toFixed(0)}%</span>;
                })}
              </div>
              <p className="text-[10px] text-[#8A7A66]">Sistem akan normalisasi bobot otomatis saat perhitungan.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#8A7A66] font-semibold">
                <span>Total Bobot</span>
                <span className={`font-black text-sm ${isValid ? "text-green-600" : totalBobot > 100 ? "text-red-500" : "text-[#C97A2B]"}`}>{totalBobot}%</span>
              </div>
              <div className="h-2 bg-[#E8DED5] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isValid ? "bg-green-500" : totalBobot > 100 ? "bg-red-400" : "bg-[#C8A27C]"}`} style={{ width: `${Math.min(totalBobot, 100)}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">⚠ {error}</p>}
          {successMsg && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-xl flex items-center gap-1.5"><Check size={12} /> {successMsg}</p>}

          <div className="flex items-center justify-between px-1">
            {!isImportanceMethod ? (
              <button onClick={handleAutoBalance} className="flex items-center gap-1.5 text-xs font-semibold text-[#8A7A66] hover:text-[#2A1E14] transition">
                <RotateCcw size={12} />Seimbangkan
              </button>
            ) : <span />}
            <button onClick={handleReset} disabled={isLoading} className="flex items-center gap-1.5 text-xs font-semibold text-[#8A7A66] hover:text-red-500 transition disabled:opacity-50">
              <Save size={12} />Reset ke default
            </button>
          </div>

          <button onClick={handleApply} disabled={!isValid || isLoading || !tenantId}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2A1E14] text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Terapkan Bobot ({selectedMethod})
          </button>
        </div>
      </div>
    </>
  );
}

// ============ MAIN ============
export default function CafeList() {
  const navigate = useNavigate();
  const { cafes, isLoading, fetchCafes } = useCafeStore();
  const { tenants } = useTenantStore();
  const { result: spkResult, calculateSAW, calculateWP, calculateTOPSIS, clearResult } = useSPKStore();
  const { user } = useAuthStore();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, isFavorited } = useFavoriteStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isBobotOpen, setIsBobotOpen] = useState(false);
  const [appliedMethod, setAppliedMethod] = useState<SPKMethod>("SAW");
  const [appliedTenantId, setAppliedTenantId] = useState<number | null>(null);
  const [appliedTenantName, setAppliedTenantName] = useState<string>("");
  const [favoritePending, setFavoritePending] = useState<number | null>(null);

  useEffect(() => { fetchCafes(); }, [fetchCafes]);
  useEffect(() => { if (user?.id) fetchFavorites(user.id); }, [user?.id]);

  useEffect(() => {
    if (!appliedTenantId) return;
    if (appliedMethod === "WP") calculateWP(appliedTenantId);
    else if (appliedMethod === "TOPSIS") calculateTOPSIS(appliedTenantId);
    else calculateSAW(appliedTenantId);
  }, [appliedTenantId, appliedMethod]);

  const handleToggleCompare = () => { setCompareMode((prev) => { if (prev) setSelectedIds([]); return !prev; }); };
  const handleSelectCafe = (id: number) => {
    if (!compareMode) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  // Toggle favorit. Kalau belum login, arahkan ke halaman login dulu.
  const handleToggleFavorite = async (e: React.MouseEvent, cafeId: number) => {
    e.stopPropagation();
    if (!user?.id) { navigate("/login"); return; }
    setFavoritePending(cafeId);
    if (isFavorited(user.id, cafeId)) {
      await removeFavorite(user.id, cafeId);
    } else {
      await addFavorite({ userId: user.id, cafeId });
    }
    setFavoritePending(null);
  };

  const selectedCafes = cafes.filter((c: Cafe) => selectedIds.includes(c.id));

  const facilityOptions = useMemo(() => {
    const set = new Set<string>();
    cafes.forEach((cafe: Cafe) => {
      cafe.values?.forEach((v: CafeValue) => { const name = v.criteria?.name?.trim(); if (name && isFacilityCriteria(name)) set.add(name); });
    });
    return Array.from(set);
  }, [cafes]);

  const cafeScores = useMemo(() => {
    if (!spkResult || spkResult.tenantId !== appliedTenantId || spkResult.method !== appliedMethod) return null;
    const map = new Map<number, number>();
    spkResult.ranking.forEach((r: any) => map.set(r.cafeId, r.score));
    return map;
  }, [spkResult, appliedTenantId, appliedMethod]);

  const filteredCafes = useMemo(() => {
    const baseCafes = cafeScores ? cafes.filter((c: Cafe) => c.tenantId === appliedTenantId) : cafes;
    let result = baseCafes.filter((cafe: Cafe) => {
      const matchSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLokasi = filters.lokasi === "" || (cafe.lokasi ?? "").toLowerCase() === filters.lokasi.toLowerCase();
      const harga = getCafeHarga(cafe);
      const matchHarga = harga === null || harga <= filters.maxHarga;
      const rating = getCafeRating(cafe);
      const matchRating = filters.minRating === 0 || (rating ?? 0) >= filters.minRating;
      const jarak = getCafeJarak(cafe);
      const matchJarak = jarak === null || jarak <= filters.maxJarak;
      const matchFacilities = filters.facilities.every((f) => cafeHasFacility(cafe, f));
      return matchSearch && matchLokasi && matchHarga && matchRating && matchJarak && matchFacilities;
    });
    if (cafeScores) result = [...result].sort((a: Cafe, b: Cafe) => (cafeScores.get(b.id) ?? 0) - (cafeScores.get(a.id) ?? 0));
    else if (filters.sort === "rating") result = [...result].sort((a: Cafe, b: Cafe) => (getCafeRating(b) ?? 0) - (getCafeRating(a) ?? 0));
    else if (filters.sort === "harga_asc") result = [...result].sort((a: Cafe, b: Cafe) => (getCafeHarga(a) ?? Infinity) - (getCafeHarga(b) ?? Infinity));
    else if (filters.sort === "harga_desc") result = [...result].sort((a: Cafe, b: Cafe) => (getCafeHarga(b) ?? -Infinity) - (getCafeHarga(a) ?? -Infinity));
    else if (filters.sort === "terdekat") result = [...result].sort((a: Cafe, b: Cafe) => (getCafeJarak(a) ?? Infinity) - (getCafeJarak(b) ?? Infinity));
    return result;
  }, [cafes, searchQuery, filters, cafeScores, appliedTenantId]);

  const activeFilterCount = (filters.sort ? 1 : 0) + (filters.lokasi ? 1 : 0) + (filters.maxHarga < MAX_HARGA ? 1 : 0) + (filters.minRating > 0 ? 1 : 0) + (filters.maxJarak < MAX_JARAK ? 1 : 0) + filters.facilities.length;
  const toggleFacility = (name: string) => { setFilters((f) => ({ ...f, facilities: f.facilities.includes(name) ? f.facilities.filter((x) => x !== name) : [...f.facilities, name] })); };

  const FilterPanel = () => (
    <div className="space-y-7">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[#2A1E14]"><ArrowUpDown size={15} /><p className="text-xs font-bold uppercase tracking-wide">Urutkan</p></div>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => { const active = filters.sort === opt.value; return (
            <button key={opt.value} type="button" onClick={() => setFilters((f) => ({ ...f, sort: active ? "" : opt.value }))}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? "border-[#2A1E14] bg-[#2A1E14] text-white" : "border-[#E8DED5] bg-[#FAF8F5] text-[#6B5C4D] hover:border-[#C9B8A2]"}`}>
              {opt.label}</button>); })}
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[#2A1E14]"><MapPin size={15} /><p className="text-xs font-bold uppercase tracking-wide">Lokasi</p></div>
        <select value={filters.lokasi} onChange={(e) => setFilters((f) => ({ ...f, lokasi: e.target.value }))}
          className="w-full rounded-xl border border-[#E8DED5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#2A1E14] focus:outline-none">
          <option value="">Semua Lokasi</option>
          {tenants.map((t) => <option key={t.id} value={t.name.toLowerCase()}>{t.name}</option>)}
        </select>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[#2A1E14]">
          <div className="flex items-center gap-2"><Wallet size={15} /><p className="text-xs font-bold uppercase tracking-wide">Rentang Harga</p></div>
          <span className="rounded-full bg-[#FBEFE0] px-2.5 py-0.5 text-xs font-bold text-[#9C5419]">Rp{filters.maxHarga.toLocaleString("id-ID")}</span>
        </div>
        <div className="rounded-xl bg-[#FAF8F5] p-3.5">
          <input type="range" min={0} max={MAX_HARGA} step={5000} value={filters.maxHarga} onChange={(e) => setFilters((f) => ({ ...f, maxHarga: Number(e.target.value) }))} className="w-full accent-[#2A1E14]" />
          <div className="mt-1 flex justify-between text-[11px] text-[#8A7A66]"><span>Rp0</span><span>Rp{MAX_HARGA.toLocaleString("id-ID")}</span></div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[#2A1E14]"><Star size={15} /><p className="text-xs font-bold uppercase tracking-wide">Rating Minimal</p></div>
        <div className="flex items-center gap-2 rounded-xl bg-[#FAF8F5] p-3.5">
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setFilters((f) => ({ ...f, minRating: f.minRating === n ? 0 : n }))} className="transition active:scale-90">
              <Star size={22} className={n <= filters.minRating ? "fill-[#D4A24C] text-[#D4A24C]" : "fill-transparent text-[#D9C8B4]"} />
            </button>
          ))}
          {filters.minRating > 0 && <span className="ml-1 text-xs font-semibold text-[#8A7A66]">{filters.minRating}+ keatas</span>}
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[#2A1E14]">
          <div className="flex items-center gap-2"><Compass size={15} /><p className="text-xs font-bold uppercase tracking-wide">Jarak (km)</p></div>
          <span className="rounded-full bg-[#FBEFE0] px-2.5 py-0.5 text-xs font-bold text-[#9C5419]">{filters.maxJarak} km</span>
        </div>
        <div className="rounded-xl bg-[#FAF8F5] p-3.5">
          <input type="range" min={0} max={MAX_JARAK} step={0.5} value={filters.maxJarak} onChange={(e) => setFilters((f) => ({ ...f, maxJarak: Number(e.target.value) }))} className="w-full accent-[#2A1E14]" />
          <div className="mt-1 flex justify-between text-[11px] text-[#8A7A66]"><span>0 km</span><span>{MAX_JARAK} km</span></div>
        </div>
      </div>
      {facilityOptions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[#2A1E14]"><Tag size={15} /><p className="text-xs font-bold uppercase tracking-wide">Fasilitas</p></div>
          <div className="flex flex-wrap gap-2">
            {facilityOptions.map((name) => { const active = filters.facilities.includes(name); return (
              <button key={name} type="button" onClick={() => toggleFacility(name)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? "border-[#2A1E14] bg-[#2A1E14] text-white" : "border-[#E8DED5] bg-[#FAF8F5] text-[#6B5C4D] hover:border-[#C9B8A2]"}`}>
                {name}</button>); })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="min-h-screen bg-[#F7F3EC] py-10 px-6 md:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="font-serif text-3xl font-black text-[#2A1E14] md:text-4xl">Jelajahi Semua Cafe</h1>
            <p className="mt-1 text-sm text-[#8A7A66]">Temukan tempat ternyaman untuk produktivitas atau sekadar bersantai.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={handleToggleCompare}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${compareMode ? "border-[#C97A2B] bg-[#FFF4E8] text-[#C97A2B]" : "border-[#E8DED5] bg-white text-[#6F4E37] hover:bg-[#FAF8F5]"}`}>
              <GitCompare size={16} />Mode Perbandingan
            </button>
            <button type="button" onClick={() => setIsBobotOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#2A1E14] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition">
              <SlidersHorizontal size={16} />Atur Bobot
            </button>
          </div>
        </div>

        {compareMode && (
          <div className="flex items-center justify-between gap-4 bg-[#FFF4E8] border border-[#F0D5B0] rounded-2xl px-5 py-3">
            <div className="flex items-center gap-2 text-[#C97A2B]">
              <GitCompare size={16} />
              <p className="text-sm font-semibold">{selectedIds.length === 0 ? "Pilih cafe yang ingin dibandingkan (maks. 3)" : `${selectedIds.length} dari ${MAX_COMPARE} cafe dipilih`}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 1 && (
                <button onClick={() => setShowCompareModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C97A2B] text-white text-xs font-bold hover:opacity-90 transition">
                  Bandingkan <ChevronRight size={14} />
                </button>
              )}
              {selectedIds.length > 0 && (
                <button onClick={() => setSelectedIds([])} className="px-3 py-2 rounded-xl bg-white border border-[#E8DED5] text-xs font-semibold text-[#6F4E37] hover:bg-[#F8F4EF] transition">Reset</button>
              )}
            </div>
          </div>
        )}

        {cafeScores && (
          <div className="flex items-center justify-between gap-3 bg-[#FFF4E8] border border-[#F0D5B0] rounded-2xl px-5 py-3">
            <div className="flex items-center gap-3 text-[#C97A2B] flex-wrap">
              <SlidersHorizontal size={16} />
              <p className="text-sm font-semibold">Diurutkan berdasarkan bobot preferensimu{appliedTenantName ? ` — ${appliedTenantName}` : ""}</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${METHOD_BADGE[appliedMethod]}`}>{appliedMethod}</span>
            </div>
            <button onClick={() => { clearResult(); setAppliedTenantId(null); setAppliedTenantName(""); }}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DED5] text-xs font-semibold text-[#6F4E37] hover:bg-[#F8F4EF] transition">
              Hapus Bobot
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1 rounded-xl border border-[#E8DED5] bg-white">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7A66]" size={18} />
            <input type="text" placeholder="Cari nama cafe..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-[#2A1E14] focus:outline-none" />
          </div>
          <button type="button" onClick={() => setIsFilterOpen(true)}
            className="relative flex items-center gap-2 justify-center rounded-xl border border-[#E8DED5] bg-white px-4 py-3 text-sm font-semibold text-[#2A1E14] hover:bg-[#FAF8F5] transition">
            <SlidersHorizontal size={18} />Filter Lainnya
            {activeFilterCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4A24C] text-[10px] font-bold text-white">{activeFilterCount}</span>}
          </button>
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
            <div className="relative ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-base font-bold text-[#2A1E14]">Filter Cafe</p>
                <button onClick={() => setIsFilterOpen(false)}><X size={20} className="text-[#6B5C4D]" /></button>
              </div>
              <FilterPanel />
              <button type="button" onClick={() => setIsFilterOpen(false)} className="mt-6 w-full rounded-xl bg-[#2A1E14] py-3 text-sm font-semibold text-white">Terapkan Filter</button>
            </div>
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-[#8A7A66]">
              <Loader2 className="animate-spin text-[#2A1E14]" size={32} />
              <span className="text-sm font-medium">Memuat daftar cafe...</span>
            </div>
          ) : filteredCafes.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#8A7A66]">Tidak ada cafe yang cocok dengan filter kamu.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCafes.map((cafe, rank) => {
                const rating = getCafeRating(cafe);
                const isSelected = selectedIds.includes(cafe.id);
                const isMaxReached = selectedIds.length >= MAX_COMPARE && !isSelected;
                const score = cafeScores?.get(cafe.id);
                const favorited = !!user?.id && isFavorited(user.id, cafe.id);
                return (
                  <div key={cafe.id}
                    onClick={() => compareMode ? handleSelectCafe(cafe.id) : navigate(`/cafes/${cafe.id}`)}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition ${compareMode ? isSelected ? "border-[#C97A2B] shadow-[0_0_0_3px_rgba(201,122,43,0.15)] -translate-y-1" : isMaxReached ? "border-[#E8DED5] opacity-50 cursor-not-allowed" : "border-[#E8DED5] hover:border-[#C8A27C] hover:-translate-y-1 hover:shadow-lg" : "border-[#E8DED5] hover:-translate-y-1 hover:shadow-lg"}`}>
                    <div className="relative h-48 w-full overflow-hidden bg-[#F0E8DF]">
                      <img src={cafe.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80"} alt={cafe.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-[#2A1E14]">
                        <Star size={12} className="fill-[#D4A24C] text-[#D4A24C]" />
                        {rating !== null ? rating.toFixed(1) : "Baru"}
                      </div>
                      {cafeScores && rank < 3 && (
                        <div className={`absolute top-3 left-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black ${rank === 0 ? "bg-yellow-400 text-white" : rank === 1 ? "bg-gray-300 text-white" : "bg-orange-400 text-white"}`}>
                          <Trophy size={11} />#{rank + 1}
                        </div>
                      )}
                      {compareMode && (
                        <div className={`absolute top-3 left-3 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition ${isSelected ? "bg-[#C97A2B] border-[#C97A2B]" : "bg-white/90 border-[#D9C8B4]"}`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      )}
                      {compareMode && isSelected && <div className="absolute inset-0 bg-[#C97A2B]/10" />}
                    </div>

                    {/* Tombol favorit — nggak muncul saat Mode Perbandingan aktif biar ga nabrak checkbox */}
                    {!compareMode && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, cafe.id)}
                        disabled={favoritePending === cafe.id}
                        className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition disabled:opacity-60 ${favorited ? "bg-[#C97A2B] text-white" : "bg-white/90 text-[#6B5C4D] hover:bg-white"}`}
                        title={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
                      >
                        {favoritePending === cafe.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Heart size={14} className={favorited ? "fill-white" : ""} />
                        )}
                      </button>
                    )}

                    <div className="flex flex-1 flex-col justify-between space-y-3 p-5">
                      <div>
                        <h4 className={`line-clamp-1 font-serif text-lg font-bold transition ${compareMode && isSelected ? "text-[#C97A2B]" : "text-[#2A1E14] group-hover:text-[#B5651D]"}`}>{cafe.name}</h4>
                        <div className="mt-1 flex items-center gap-1 text-xs text-[#8A7A66]"><MapPin size={12} /><span>{cafe.lokasi || cafe.address}</span></div>
                        <p className="mt-2 font-mono text-sm font-bold text-[#2A1E14]">{formatHargaRange(cafe)}</p>
                        {score !== undefined && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${METHOD_BADGE[appliedMethod]}`}>{appliedMethod}</span>
                            <span className="text-xs font-black text-[#C97A2B] font-mono">{score.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                      {compareMode && (
                        <div className={`w-full py-2 rounded-xl text-xs font-bold text-center transition ${isSelected ? "bg-[#FFF4E8] text-[#C97A2B]" : isMaxReached ? "bg-[#F8F4EF] text-[#C8A27C]" : "bg-[#FAF8F5] text-[#6F4E37]"}`}>
                          {isSelected ? "✓ Dipilih" : isMaxReached ? "Maks. 3 cafe" : "+ Pilih untuk bandingkan"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {compareMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 bg-[#2A1E14] text-white rounded-2xl px-5 py-3.5 shadow-2xl">
            <div className="flex -space-x-2">
              {selectedCafes.map((cafe) => (
                <div key={cafe.id} className="w-8 h-8 rounded-full border-2 border-[#2A1E14] overflow-hidden bg-[#F0E8DF]">
                  <img src={cafe.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&q=80"} alt={cafe.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold">{selectedIds.length} cafe dipilih</span>
            {selectedIds.length > 1 && (
              <button onClick={() => setShowCompareModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C97A2B] text-white text-xs font-bold hover:opacity-90 transition">
                <GitCompare size={14} />Bandingkan
              </button>
            )}
          </div>
        </div>
      )}

      {showCompareModal && selectedCafes.length > 1 && (
        <CompareModal cafes={selectedCafes} onClose={() => setShowCompareModal(false)} />
      )}

      <AturBobotPanel isOpen={isBobotOpen} onClose={() => setIsBobotOpen(false)}
        onApply={(method, tenantId) => {
          setAppliedMethod(method); setAppliedTenantId(tenantId);
          setAppliedTenantName(tenants.find((t) => t.id === tenantId)?.name ?? "");
        }} />
    </section>
  );
}