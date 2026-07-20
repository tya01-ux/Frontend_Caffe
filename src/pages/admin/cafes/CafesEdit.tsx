import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Image } from "lucide-react";
import { useCafeStore } from "../../../store/useCaffeStore";

const CafesEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { cafes, updateCafe, isLoading, error, fetchCafes } = useCafeStore();

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    lokasi: "",
    address: "",
    description: "",
    harga: 0,
    fasilitas: 0,
    kenyamanan: 0,
    rating: 0,
    jarak: 0,
    tenantId: 0,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (cafes.length === 0) fetchCafes();
  }, [cafes, fetchCafes]);

  useEffect(() => {
    if (id && cafes.length > 0) {
      const target = cafes.find((c) => c.id === Number(id));
      if (target) {
        const t = target as any;
        const data = {
          name: t.name,
          image: t.image || "",
          lokasi: t.lokasi || "",
          address: t.address,
          description: t.description || "",
          harga: t.harga ?? 0,
          fasilitas: t.fasilitas ?? 0,
          kenyamanan: t.kenyamanan ?? 0,
          rating: t.rating ?? 0,
          jarak: t.jarak ?? 0,
          tenantId: t.tenantId ?? 0,
        };
        setFormData(data);
        setImagePreview(data.image);
        setPreviewError(false);
      }
    }
  }, [id, cafes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = ["harga", "fasilitas", "kenyamanan", "rating", "jarak"];

    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));

    if (name === "image") {
      setPreviewError(false);
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateCafe(Number(id), formData);
      alert("Mantap! Perubahan data cafe berhasil diperbarui ✨");
      navigate("/admin/cafes");
    } catch (err) {
      console.error("Gagal memperbarui data cafe:", err);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/cafes")}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-[#2B0F16] transition-all shadow-xs"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#2B0F16]">
            Ubah Data Cafe
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perbarui informasi dasar atau nilai parameter kriteria SPK kafe ini.
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

          {/* NAMA, KOTA, URL FOTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Cafe *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama cafe..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kota / Lokasi SPK *</label>
              <select
                name="lokasi"
                required
                value={formData.lokasi}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] cursor-pointer"
              >
                <option value="">Pilih Kota</option>
                <option value="Semarang">Semarang</option>
                <option value="Tegal">Tegal</option>
                <option value="Pekalongan">Pekalongan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">URL Link Foto *</label>
              <div className="relative">
                <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  name="image"
                  required
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#8B1E3F]"
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
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F]"
            />
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Deskripsi Singkat</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1E3F] resize-none"
            />
          </div>
        </div>

        {/* SECTION 2: KRITERIA SPK */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-base font-bold text-[#8B1E3F] uppercase tracking-wider">
              📊 Variabel Parameter Kriteria SPK
            </h3>
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
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Rating (C4)</label>
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
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CafesEdit;