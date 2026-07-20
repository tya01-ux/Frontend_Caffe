import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Image } from "lucide-react";
import { useCafeStore, type CafeInput } from "../../../store/useCaffeStore";

const CafesCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCafe, isLoading, error } = useCafeStore();

  const [formData, setFormData] = useState<any>({
    name: "",
    image: "",
    lokasi: "",
    address: "",
    description: "",
    harga: "",
    fasilitas: "",
    kenyamanan: "",
    rating: "",
    jarak: "",
  });

  // State untuk preview (pakai debounce sederhana via state terpisah)
  const [imagePreview, setImagePreview] = useState("");
  const [previewError, setPreviewError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = ["harga", "fasilitas", "kenyamanan", "rating", "jarak"];

    setFormData((prev: CafeInput) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));

    // Update preview saat field image berubah
    if (name === "image") {
      setPreviewError(false);
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80",
      };
      await createCafe(payload);
      alert("Data cafe berhasil disimpan!");
      navigate("/admin/cafes");
    } catch (err) {
      console.error("Gagal menyimpan cafe:", err);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/cafes")}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-[#2B0F16] transition-all shadow-xs"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#2B0F16]">
            Tambah Cafe Baru
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Masukkan data kafe beserta variabel kriteria untuk perhitungan SPK.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold text-sm">
          ⚠ Terjadi Kesalahan: {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#5B2333]/10 rounded-[28px] p-6 md:p-8 shadow-[0_10px_30px_rgba(43,15,22,0.02)] space-y-6"
      >
        {/* SECTION 1: INFORMASI DASAR */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#2B0F16] border-b border-gray-100 pb-2">
            ℹ️ Informasi Dasar Kafe
          </h3>

          {/* PREVIEW FOTO */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Preview Foto Cafe
            </label>
            <div className="w-full h-52 rounded-2xl overflow-hidden bg-[#F8F4EF] border-2 border-dashed border-gray-200 flex items-center justify-center relative">
              {imagePreview && !previewError ? (
                <img
                  src={imagePreview}
                  alt="Preview Foto"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Image size={36} className="opacity-30" />
                  <p className="text-xs text-gray-400">
                    {previewError
                      ? "❌ URL foto tidak valid atau tidak bisa dimuat"
                      : "Preview foto akan tampil di sini setelah URL diisi"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BARIS: NAMA, KOTA, URL FOTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Cafe *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Kopi Kasih"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kota / Lokasi SPK *</label>
              <select
                name="lokasi"
                required
                value={formData.lokasi}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] transition-all cursor-pointer"
              >
                <option value="">Pilih Kota</option>
                <option value="Semarang">Semarang</option>
                <option value="Tegal">Tegal</option>
                <option value="Pekalongan">Pekalongan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">URL Link Foto Cafe *</label>
              <div className="relative">
                <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  name="image"
                  required
                  value={formData.image || ""}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* ALAMAT */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Alamat Lengkap *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Contoh: Jl. Ngesrep Timur V No. 45, Banyumanik"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] transition-all"
            />
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Deskripsi Singkat</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Berikan deskripsi singkat suasana kafe..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] transition-all resize-none"
            />
          </div>
        </div>

        {/* SECTION 2: KRITERIA SPK */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-base font-bold text-[#8B1E3F] uppercase tracking-wider">
              📊 Variabel Parameter Kriteria SPK
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Nilai numerik murni ini digunakan sistem untuk perhitungan perangkingan.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Harga (C1)</label>
              <input type="number" name="harga" min="0" required value={formData.harga} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:border-[#8B1E3F]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Fasilitas (C2)</label>
              <input type="number" name="fasilitas" min="0" required value={formData.fasilitas} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:border-[#8B1E3F]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kenyamanan (C3)</label>
              <input type="number" name="kenyamanan" min="0" required value={formData.kenyamanan} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:border-[#8B1E3F]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Rating Umum (C4)</label>
              <input type="number" name="rating" step="0.1" min="0" max="5" required value={formData.rating} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:border-[#8B1E3F]" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Jarak (C5) - km</label>
              <input type="number" name="jarak" step="0.01" min="0" required value={formData.jarak} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:border-[#8B1E3F]" />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/admin/cafes")}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#8B1E3F] text-white rounded-xl font-bold text-sm hover:bg-[#701832] shadow-md shadow-[#8B1E3F]/10 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Simpan Data Kafe</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CafesCreate;