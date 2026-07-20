// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Loader2, MapPin, Star, Trophy, AlertCircle } from "lucide-react";
// import {
//   useRecommendationStore,
//   type RecommendationMethod,
// } from "../store/useReqomendation";
// import { useCafeStore, type Cafe } from "../store/useCaffeStore";

// // TODO: ganti dengan data user/tenant yang sebenarnya lagi login
// // (misal dari useAuthStore / context / localStorage), bukan angka statis.
// const CURRENT_USER_ID = 1;
// const CURRENT_TENANT_ID = 1;

// const METHODS: { value: RecommendationMethod; label: string; desc: string }[] = [
//   { value: "SAW", label: "SAW", desc: "Simple Additive Weighting" },
//   { value: "WP", label: "WP", desc: "Weighted Product" },
//   { value: "TOPSIS", label: "TOPSIS", desc: "Technique for Order Preference" },
// ];

// function findCriteriaValue(cafe: Cafe, keyword: string): number | null {
//   const entry = cafe.values?.find(
//     (v) =>
//       v.criteria?.code?.toLowerCase().includes(keyword) ||
//       v.criteria?.name?.toLowerCase().includes(keyword)
//   );
//   return entry ? entry.value : null;
// }

// function getCafeRating(cafe: Cafe): number | null {
//   const rating = findCriteriaValue(cafe, "rating");
//   if (rating !== null) return rating;

//   const benefitValues = cafe.values?.filter((v) => v.criteria?.type === "BENEFIT") ?? [];
//   if (!benefitValues.length) return null;

//   const avg = benefitValues.reduce((sum, v) => sum + v.value, 0) / benefitValues.length;
//   return Math.min(5, Math.round(avg * 10) / 10);
// }

// export default function Recommendation() {
//   const navigate = useNavigate();
//   const { cafes, fetchCafes } = useCafeStore();
//   const {
//     currentResult,
//     currentMethod,
//     isCalculating,
//     error,
//     calculate,
//     clearError,
//   } = useRecommendationStore();

//   const [selectedMethod, setSelectedMethod] = useState<RecommendationMethod>("SAW");

//   useEffect(() => {
//     fetchCafes();
//   }, [fetchCafes]);

//   const cafeMap = useMemo(() => {
//     const map = new Map<number, Cafe>();
//     cafes.forEach((c) => map.set(c.id, c));
//     return map;
//   }, [cafes]);

//   const sortedResult = useMemo(
//     () => [...currentResult].sort((a, b) => b.score - a.score),
//     [currentResult]
//   );

//   const handleHitung = async () => {
//     clearError();
//     await calculate({
//       userId: CURRENT_USER_ID,
//       tenantId: CURRENT_TENANT_ID,
//       method: selectedMethod,
//     });
//   };

//   return (
//     <section className="min-h-screen bg-[#F7F3EC] px-6 py-10 md:px-12">
//       <div className="mx-auto max-w-6xl space-y-8">

//         {/* Header — rata kiri, bukan ditengah-tengahin */}
//         <div className="max-w-xl">
//           <h1 className="font-serif text-3xl font-black text-[#2A1E14] md:text-4xl">
//             Rekomendasi Cafe
//           </h1>
//           <p className="mt-1 text-sm text-[#8A7A66]">
//             Pilih metode perhitungan, lalu lihat cafe mana yang paling cocok denganmu.
//           </p>
//         </div>

//         {/* Bar metode + tombol hitung — satu baris penuh, bukan kartu kecil ngambang */}
//         <div className="flex flex-col gap-5 rounded-2xl border border-[#E8DED5] bg-white p-5 lg:flex-row lg:items-end lg:justify-between">
//           <div className="flex-1">
//             <p className="text-xs font-bold uppercase tracking-wide text-[#8A7A66]">
//               Pilih Metode
//             </p>
//             <div className="mt-3 grid grid-cols-3 gap-3">
//               {METHODS.map((m) => {
//                 const active = selectedMethod === m.value;
//                 return (
//                   <button
//                     key={m.value}
//                     type="button"
//                     onClick={() => setSelectedMethod(m.value)}
//                     className={`rounded-xl border px-3 py-3 text-center transition ${
//                       active
//                         ? "border-[#2A1E14] bg-[#2A1E14] text-white"
//                         : "border-[#E8DED5] bg-white text-[#6B5C4D] hover:border-[#C9B8A2]"
//                     }`}
//                   >
//                     <p className="text-sm font-bold">{m.label}</p>
//                     <p
//                       className={`mt-0.5 text-[10px] leading-tight ${
//                         active ? "text-white/70" : "text-[#8A7A66]"
//                       }`}
//                     >
//                       {m.desc}
//                     </p>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={handleHitung}
//             disabled={isCalculating}
//             className="flex items-center justify-center gap-2 rounded-xl bg-[#2A1E14] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3D2B1C] disabled:cursor-not-allowed disabled:opacity-60 lg:w-56"
//           >
//             {isCalculating ? (
//               <>
//                 <Loader2 className="animate-spin" size={16} />
//                 Menghitung...
//               </>
//             ) : (
//               "Hitung Rekomendasi"
//             )}
//           </button>
//         </div>


//         {error && (
//           <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
//             <AlertCircle size={16} />
//             {error}
//           </div>
//         )}

//         {/* Hasil Rekomendasi */}
//         <div className="space-y-4">
//           <p className="text-xs font-bold uppercase tracking-wide text-[#8A7A66]">
//             Hasil Rekomendasi{currentMethod ? ` (${currentMethod})` : ""}
//           </p>

//           {sortedResult.length === 0 ? (
//             <div className="rounded-2xl border border-dashed border-[#E8DED5] bg-white/60 py-14 text-center text-sm text-[#8A7A66]">
//               Belum ada hasil. Pilih metode lalu klik &ldquo;Hitung Rekomendasi&rdquo;.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//               {sortedResult.map((item, index) => {
//                 const cafe = cafeMap.get(item.cafeId);
//                 const rank = index + 1;
//                 const rating = cafe ? getCafeRating(cafe) : null;
//                 const jarak = cafe ? findCriteriaValue(cafe, "jarak") : null;

//                 return (
//                   <div
//                     key={item.cafeId}
//                     onClick={() => navigate(`/cafes/${item.cafeId}`)}
//                     className="group cursor-pointer overflow-hidden rounded-2xl border border-[#E8DED5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
//                   >
//                     <div className="relative h-36 w-full overflow-hidden bg-[#F0E8DF]">
//                       <img
//                         src={cafe?.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80"}
//                         alt={item.name}
//                         className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
//                       />
//                       <div
//                         className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
//                           rank === 1
//                             ? "bg-[#D4A24C] text-white"
//                             : "bg-white/90 text-[#2A1E14]"
//                         }`}
//                       >
//                         {rank === 1 ? <Trophy size={14} /> : rank}
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between gap-3 p-4">
//                       <div className="min-w-0">
//                         <p className="truncate text-sm font-bold text-[#2A1E14]">{item.name}</p>
//                         <div className="mt-1 flex items-center gap-2 text-xs text-[#8A7A66]">
//                           {rating !== null && (
//                             <span className="flex items-center gap-1">
//                               <Star size={12} className="fill-[#D4A24C] text-[#D4A24C]" />
//                               {rating.toFixed(1)}
//                             </span>
//                           )}
//                           {jarak !== null && (
//                             <span className="flex items-center gap-1">
//                               <MapPin size={12} />
//                               {jarak} km
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex-shrink-0 text-right">
//                         <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A7A66]">
//                           Skor
//                         </p>
//                         <p className="text-sm font-bold text-[#2A1E14]">
//                           {item.score.toFixed(3)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }