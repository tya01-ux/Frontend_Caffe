// import React, { useEffect, useState } from "react";
// import {
//   History,
//   Trash2,
//   Eye,
//   Loader2,
//   Trophy,
//   Medal,
//   Star,
//   Coffee,
//   X,
//   Hash,
//   Calculator,
//   Search,
//   Filter,
// } from "lucide-react";
// import { useRecommendationStore } from "../../../store/useReqomendation";
// import type { Recommendation, RecommendationResultItem, RecommendationMethod } from "../../../store/useReqomendation";

// // ============ HELPERS ============

// const METHOD_COLOR: Record<RecommendationMethod, string> = {
//   SAW: "bg-blue-50 text-blue-700 border-blue-200",
//   WP: "bg-purple-50 text-purple-700 border-purple-200",
//   TOPSIS: "bg-emerald-50 text-emerald-700 border-emerald-200",
// };

// const formatDate = (iso: string) =>
//   new Date(iso).toLocaleDateString("id-ID", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });

// // ============ DETAIL MODAL ============

// const DetailModal: React.FC<{
//   data: Recommendation;
//   onClose: () => void;
// }> = ({ data, onClose }) => {
//   const result: RecommendationResultItem[] = Array.isArray(data.result) ? data.result : [];
//   const top3 = result.slice(0, 3);
//   const maxScore = result[0]?.score ?? 1;

//   const RANK_CONFIG = [
//     { icon: <Trophy size={18} className="text-yellow-500" />, badge: "bg-yellow-400 text-white", label: "Terbaik" },
//     { icon: <Medal size={18} className="text-gray-400" />, badge: "bg-gray-400 text-white", label: "Runner Up" },
//     { icon: <Star size={18} className="text-orange-400" />, badge: "bg-orange-400 text-white", label: "Pilihan" },
//   ];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//       <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
//           <div>
//             <h2 className="font-black text-[#3E2C23] text-xl">Detail Rekomendasi</h2>
//             <div className="flex items-center gap-2 mt-1">
//               <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${METHOD_COLOR[data.method]}`}>
//                 {data.method}
//               </span>
//               <span className="text-xs text-[#8B735C]">{formatDate(data.createdAt)}</span>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">

//           {/* Info */}
//           <div className="grid grid-cols-3 gap-3">
//             <div className="bg-[#FAF8F5] rounded-2xl p-4 text-center">
//               <p className="text-xs text-[#8B735C] font-medium mb-1">Metode</p>
//               <p className="font-black text-[#3E2C23] font-mono">{data.method}</p>
//             </div>
//             <div className="bg-[#FAF8F5] rounded-2xl p-4 text-center">
//               <p className="text-xs text-[#8B735C] font-medium mb-1">Total Cafe</p>
//               <p className="font-black text-[#3E2C23]">{result.length}</p>
//             </div>
//             <div className="bg-[#FFF4E8] rounded-2xl p-4 text-center">
//               <p className="text-xs text-[#8B735C] font-medium mb-1">Skor Tertinggi</p>
//               <p className="font-black text-[#C97A2B] font-mono">{maxScore.toFixed(4)}</p>
//             </div>
//           </div>

//           {/* Top 3 */}
//           <div>
//             <p className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-3">Top 3</p>
//             <div className="space-y-2">
//               {top3.map((item, i) => (
//                 <div
//                   key={item.cafeId}
//                   className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DED5]"
//                 >
//                   <div className={`w-7 h-7 rounded-lg ${RANK_CONFIG[i].badge} flex items-center justify-center font-black text-xs shrink-0`}>
//                     {i + 1}
//                   </div>
//                   {RANK_CONFIG[i].icon}
//                   <p className="font-bold text-[#3E2C23] flex-1">{item.name}</p>
//                   <span className="font-black font-mono text-[#C97A2B]">{item.score.toFixed(4)}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Tabel semua */}
//           <div>
//             <p className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-3">Semua Hasil</p>
//             <div className="rounded-2xl border border-[#E8DED5] overflow-hidden">
//               <div className="overflow-auto max-h-[320px]">
//                 <table className="w-full text-sm">
//                   <thead className="sticky top-0 z-10">
//                     <tr className="bg-[#F8F4EF] text-[#6F4E37]">
//                       <th className="px-4 py-3 text-left w-12">Rank</th>
//                       <th className="px-4 py-3 text-left">Cafe</th>
//                       <th className="px-4 py-3 text-center">Skor</th>
//                       <th className="px-4 py-3 text-center">Bar</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {result.map((item, i) => {
//                       const pct = maxScore === 0 ? 0 : (item.score / maxScore) * 100;
//                       return (
//                         <tr key={item.cafeId} className="border-t border-[#F4ECE4] hover:bg-[#FCFAF8]">
//                           <td className="px-4 py-3 text-center">
//                             {i === 0 ? <Trophy size={16} className="text-yellow-500 mx-auto" />
//                               : i === 1 ? <Medal size={16} className="text-gray-400 mx-auto" />
//                               : i === 2 ? <Star size={16} className="text-orange-400 mx-auto" />
//                               : <span className="text-[#8B735C] font-bold text-xs flex items-center justify-center gap-0.5"><Hash size={11} />{i + 1}</span>}
//                           </td>
//                           <td className="px-4 py-3 font-medium text-[#3E2C23]">{item.name}</td>
//                           <td className="px-4 py-3 text-center font-black font-mono text-[#3E2C23]">
//                             {item.score.toFixed(4)}
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="flex items-center gap-2">
//                               <div className="flex-1 h-2 bg-[#F0E8DF] rounded-full overflow-hidden">
//                                 <div
//                                   className="h-full rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C]"
//                                   style={{ width: `${pct}%` }}
//                                 />
//                               </div>
//                               <span className="text-xs text-[#8B735C] font-mono w-8 text-right">{pct.toFixed(0)}%</span>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full py-3 rounded-2xl bg-[#F8F4EF] text-[#3E2C23] font-bold hover:bg-[#EDE2D5] transition"
//           >
//             Tutup
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============ MAIN PAGE ============

// const RiwayatRekomendasi: React.FC = () => {
//   const { recommendations, isLoading, fetchRecommendations, deleteRecommendation } =
//     useRecommendationStore();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterMethod, setFilterMethod] = useState<"" | RecommendationMethod>("");
//   const [detailData, setDetailData] = useState<Recommendation | null>(null);

//   useEffect(() => {
//     fetchRecommendations();
//   }, []);

//   const handleDelete = async (id: number) => {
//     if (confirm("Yakin hapus riwayat rekomendasi ini?")) {
//       await deleteRecommendation(id);
//     }
//   };

//   const filtered = recommendations.filter((r) => {
//     const matchSearch =
//       r.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       r.method.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchMethod = filterMethod === "" || r.method === filterMethod;
//     return matchSearch && matchMethod;
//   });

//   // Stats
//   const totalSAW = recommendations.filter((r) => r.method === "SAW").length;
//   const totalWP = recommendations.filter((r) => r.method === "WP").length;
//   const totalTOPSIS = recommendations.filter((r) => r.method === "TOPSIS").length;

//   return (
//     <div className="space-y-8">

//       {/* HEADER */}
//       <div>
//         <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Riwayat Rekomendasi</h1>
//         <p className="text-[#8B735C] mt-2">
//           Semua hasil perhitungan SPK yang pernah dilakukan
//         </p>
//       </div>

//       {/* STAT CARDS */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
//           <div className="w-11 h-11 rounded-2xl bg-[#FFF4E8] flex items-center justify-center shrink-0">
//             <History size={20} className="text-[#C97A2B]" />
//           </div>
//           <div>
//             <p className="text-xs text-[#8B735C] font-medium">Total</p>
//             <p className="text-2xl font-black text-[#3E2C23]">{recommendations.length}</p>
//           </div>
//         </div>
//         <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
//           <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
//             <Calculator size={20} className="text-blue-600" />
//           </div>
//           <div>
//             <p className="text-xs text-[#8B735C] font-medium">SAW</p>
//             <p className="text-2xl font-black text-[#3E2C23]">{totalSAW}</p>
//           </div>
//         </div>
//         <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
//           <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
//             <Calculator size={20} className="text-purple-600" />
//           </div>
//           <div>
//             <p className="text-xs text-[#8B735C] font-medium">WP</p>
//             <p className="text-2xl font-black text-[#3E2C23]">{totalWP}</p>
//           </div>
//         </div>
//         <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
//           <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
//             <Calculator size={20} className="text-emerald-600" />
//           </div>
//           <div>
//             <p className="text-xs text-[#8B735C] font-medium">TOPSIS</p>
//             <p className="text-2xl font-black text-[#3E2C23]">{totalTOPSIS}</p>
//           </div>
//         </div>
//       </div>

//       {/* FILTER */}
//       <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-6 shadow-[0_10px_40px_rgba(62,44,35,0.08)]">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="relative flex-1">
//             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]" />
//             <input
//               type="text"
//               placeholder="Cari nama user atau metode..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C]"
//             />
//           </div>
//           <select
//             value={filterMethod}
//             onChange={(e) => setFilterMethod(e.target.value as "" | RecommendationMethod)}
//             className="px-5 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] min-w-[180px] outline-none focus:ring-2 focus:ring-[#C8A27C]"
//           >
//             <option value="">Semua Metode</option>
//             <option value="SAW">SAW</option>
//             <option value="WP">WP</option>
//             <option value="TOPSIS">TOPSIS</option>
//           </select>
//         </div>
//       </div>

//       {/* TABEL */}
//       <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
//         <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white">
//           <h2 className="font-bold text-[#3E2C23] text-lg">
//             Daftar Riwayat ({filtered.length})
//           </h2>
//         </div>

//         <div className="overflow-auto max-h-[550px]">
//           <table className="w-full">
//             <thead className="sticky top-0 z-20">
//               <tr className="bg-[#F8F4EF] text-[#6F4E37] text-sm">
//                 <th className="p-5 text-left">No</th>
//                 <th className="p-5 text-left">User</th>
//                 <th className="p-5 text-center">Metode</th>
//                 <th className="p-5 text-center">Rekomendasi #1</th>
//                 <th className="p-5 text-center">Skor Tertinggi</th>
//                 <th className="p-5 text-center">Jumlah Cafe</th>
//                 <th className="p-5 text-left">Tanggal</th>
//                 <th className="p-5 text-center">Aksi</th>
//               </tr>
//             </thead>
//             <tbody>
//               {isLoading && (
//                 <tr>
//                   <td colSpan={8} className="py-16 text-center">
//                     <Loader2 size={28} className="animate-spin mx-auto text-[#C8A27C]" />
//                   </td>
//                 </tr>
//               )}

//               {!isLoading && filtered.map((rec, index) => {
//                 const result: RecommendationResultItem[] = Array.isArray(rec.result) ? rec.result : [];
//                 const top = result[0];

//                 return (
//                   <tr key={rec.id} className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition">
//                     <td className="p-5 font-medium text-[#6F4E37]">{index + 1}</td>

//                     <td className="p-5">
//                       <p className="font-bold text-[#3E2C23]">{rec.user?.name || "—"}</p>
//                       <p className="text-xs text-[#8B735C]">{rec.user?.email || ""}</p>
//                     </td>

//                     <td className="p-5 text-center">
//                       <span className={`px-3 py-1 rounded-full text-xs font-black border ${METHOD_COLOR[rec.method]}`}>
//                         {rec.method}
//                       </span>
//                     </td>

//                     <td className="p-5 text-center">
//                       {top ? (
//                         <div className="flex items-center justify-center gap-2">
//                           <Trophy size={14} className="text-yellow-500 shrink-0" />
//                           <span className="font-bold text-[#3E2C23] text-sm">{top.name}</span>
//                         </div>
//                       ) : "—"}
//                     </td>

//                     <td className="p-5 text-center">
//                       <span className="font-black font-mono text-[#C97A2B]">
//                         {top ? top.score.toFixed(4) : "—"}
//                       </span>
//                     </td>

//                     <td className="p-5 text-center">
//                       <span className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#3E2C23]">
//                         <Coffee size={14} className="text-[#C8A27C]" />
//                         {result.length}
//                       </span>
//                     </td>

//                     <td className="p-5 text-sm text-[#6F4E37]">
//                       {formatDate(rec.createdAt)}
//                     </td>

//                     <td className="p-5">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => setDetailData(rec)}
//                           className="w-10 h-10 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
//                           title="Lihat Detail"
//                         >
//                           <Eye size={17} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(rec.id)}
//                           className="w-10 h-10 rounded-xl bg-[#FFF1F1] text-red-500 flex items-center justify-center hover:bg-[#FFE3E3] transition"
//                           title="Hapus"
//                         >
//                           <Trash2 size={17} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {!isLoading && filtered.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="py-16 text-center text-[#8B735C]">
//                     <History size={36} className="mx-auto mb-3 opacity-20" />
//                     <p>Belum ada riwayat rekomendasi.</p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* DETAIL MODAL */}
//       {detailData && (
//         <DetailModal data={detailData} onClose={() => setDetailData(null)} />
//       )}
//     </div>
//   );
// };

// export default RiwayatRekomendasi;