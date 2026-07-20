import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Phone, ArrowLeft, Wifi, Accessibility, Coffee, Loader2 } from "lucide-react";

// ============ TYPES (disesuaikan dengan schema.prisma yang asli) ============
interface Criteria {
  id: number;
  code: string;
  name: string;
  type: "COST" | "BENEFIT";
  weight: number;
}

interface CafeValue {
  id: number;
  criteriaId: number;
  value: number;
  criteria?: Criteria;
}

interface CafeDetailData {
  id: number;
  name: string;
  address: string;
  lokasi?: string | null;
  image?: string | null;
  description?: string | null;
  values: CafeValue[];
}

// Skala penilaian di database kamu 1–5 (lihat halaman admin "Nilai Alternatif")
const MAX_CRITERIA_VALUE = 5;

/**
 * Backend (Prisma) mengirim relasi nilai kriteria dengan nama `cafecriteriavalue`
 * (sesuai nama model di schema.prisma), bukan `values`. Kita normalisasi di sini
 * supaya sisa komponen tetap gampang dipakai lewat `cafe.values`.
 */
function normalizeCafeData(raw: any): CafeDetailData {
  const rawValues: any[] =
    raw?.values ??
    raw?.cafecriteriavalue ??
    raw?.cafeCriteriaValue ??
    raw?.CafeCriteriaValue ??
    raw?.cafeValues ??
    [];

  return {
    id: raw?.id ?? 0,
    name: raw?.name || "Nama Cafe Tidak Diketahui",
    address: raw?.address || "Alamat belum tersedia",
    lokasi: raw?.lokasi ?? null,
    image: raw?.image ?? null,
    description: raw?.description ?? null,
    values: rawValues,
  };
}

function findValueByKeyword(values: CafeValue[], keywords: string[]): number | null {
  for (const v of values) {
    const name = v.criteria?.name?.toLowerCase() ?? "";
    const code = v.criteria?.code?.toLowerCase() ?? "";
    if (keywords.some((k) => name.includes(k) || code.includes(k))) return v.value;
  }
  return null;
}

export const CafeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<CafeDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCafeDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3000/cafes/${id}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil detail data cafe");
        }
        const raw = await response.json();
        const rawCafe = raw?.data ?? raw;
        setCafe(normalizeCafeData(rawCafe));
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCafeDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#8B1E3F]" size={32} />
        <p className="font-serif text-[#8B1E3F] font-bold text-sm">Memuat detail cafe...</p>
      </div>
    );
  }

  if (error || !cafe) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium text-sm">Error: {error || "Data cafe tidak ditemukan"}</p>
        <button
          onClick={() => navigate("/cafes")}
          className="flex items-center gap-2 text-sm font-bold text-[#8B1E3F] hover:underline"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Cafe
        </button>
      </div>
    );
  }

  // Rating diambil dari kriteria "Rating Umum" (kalau ada), fallback rata-rata semua nilai BENEFIT
  const ratingValue = findValueByKeyword(cafe.values, ["rating", "ulasan"]);
  const benefitVals = cafe.values.filter((v) => v.criteria?.type === "BENEFIT");
  const fallbackRating = benefitVals.length
    ? benefitVals.reduce((sum, v) => sum + v.value, 0) / benefitVals.length
    : null;
  const rating = ratingValue ?? fallbackRating;

  // Urutkan kriteria berdasarkan code (C1, C2, C3, ...) biar konsisten dengan tabel admin
  const sortedValues = [...cafe.values].sort((a, b) =>
    (a.criteria?.code ?? "").localeCompare(b.criteria?.code ?? "")
  );

  return (
    <div className="w-full min-h-screen bg-[#FDFBF9] py-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Tombol Back */}
        <button
          onClick={() => navigate("/cafes")}
          className="flex items-center gap-2 text-xs font-bold text-[#8A766E] hover:text-[#8B1E3F] transition"
        >
          <ArrowLeft size={14} /> Kembali ke Daftar Cafe
        </button>

        {/* ================= ATAS: HERO DETAIL ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

          {/* Foto Cafe */}
          <div className="md:col-span-5 h-[280px] md:h-[340px] rounded-xl overflow-hidden bg-gray-50">
            <img
              src={cafe.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"}
              alt={cafe.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop";
              }}
            />
          </div>

          {/* Ringkasan Informasi */}
          <div className="md:col-span-7 flex flex-col justify-between py-2 space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-serif font-bold text-[#2B0F16]">{cafe.name}</h1>
                <div className="bg-[#8B1E3F]/5 px-2.5 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-[#8B1E3F]">
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  {rating !== null ? rating.toFixed(1) : "Baru"}
                  <span className="text-gray-400 font-normal">/ 5</span>
                </div>
              </div>

              {/* List Fasilitas Icon (belum ada kolom fasilitas di database, jadi masih statis) */}
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="flex items-center gap-1.5 text-xs bg-[#F4EEE8] text-[#6B5A52] px-3 py-1.5 rounded-lg font-medium"><Wifi size={14} /> Free Wifi</span>
                <span className="flex items-center gap-1.5 text-xs bg-[#F4EEE8] text-[#6B5A52] px-3 py-1.5 rounded-lg font-medium"><Accessibility size={14} /> AC</span>
                <span className="flex items-center gap-1.5 text-xs bg-[#F4EEE8] text-[#6B5A52] px-3 py-1.5 rounded-lg font-medium"><Coffee size={14} /> Outdoor Area</span>
              </div>
            </div>

            {/* Detail Kontak & Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs text-[#6B5A52]">
              <div className="space-y-2.5">
                <p className="flex items-center gap-2"><Clock size={15} className="text-[#8B1E3F]" /> <span className="font-semibold text-[#2B0F16]">Jam Buka:</span> 08.00 - 22.00</p>
                <p className="flex items-center gap-2"><Phone size={15} className="text-[#8B1E3F]" /> <span className="font-semibold text-[#2B0F16]">Telepon:</span> 0812-3456-7890</p>
              </div>
              <div className="flex gap-2">
                <MapPin size={15} className="text-[#8B1E3F] shrink-0 mt-0.5" />
                <p><span className="font-semibold text-[#2B0F16]">Alamat:</span><br />{cafe.address}{cafe.lokasi ? ` — ${cafe.lokasi}` : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BAWAH: DESKRIPSI vs PENILAIAN KRITERIA ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sisi Kiri: Deskripsi */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#2B0F16] border-b border-gray-100 pb-2">Deskripsi Cafe</h3>
            <p className="text-sm text-[#6B5A52] leading-relaxed">
              {cafe.description
                ? cafe.description
                : `${cafe.name} menawarkan suasana yang tenang dan sangat cocok untuk fokus bekerja, nugas kuliah, atau sekadar berkumpul santai bersama teman.`}
            </p>
          </div>

          {/* Sisi Kanan: Penilaian Kriteria SPK (dinamis, sesuai kriteria tenant cafe ini) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2B0F16]">Penilaian Kriteria</h3>
              <p className="text-xs text-[#8A766E] mt-0.5">Nilai parameter dasar untuk perhitungan SPK</p>
            </div>

            {sortedValues.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                ⚠ Belum ada nilai kriteria untuk cafe ini. Isi lewat halaman admin "Nilai Alternatif".
              </p>
            ) : (
              <div className="space-y-4 pt-1">
                {sortedValues.map((v) => {
                  const label = v.criteria?.name ?? `Kriteria ${v.criteriaId}`;
                  const code = v.criteria?.code ?? "";
                  const type = v.criteria?.type;
                  const pct = Math.min(100, (v.value / MAX_CRITERIA_VALUE) * 100);
                  return (
                    <div key={v.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#2B0F16]">
                        <span className="flex items-center gap-1.5">
                          {label} {code && <span className="text-[#8A766E] font-normal">({code})</span>}
                          {type && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${type === "BENEFIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                              {type}
                            </span>
                          )}
                        </span>
                        <span className="text-[#8B1E3F]">{v.value}/{MAX_CRITERIA_VALUE}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#8B1E3F] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CafeDetail;