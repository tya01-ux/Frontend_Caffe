import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Loader2,
  TrendingUp,
  TrendingDown,
  Coffee,
  LayoutGrid,
} from "lucide-react";
import { useCafeCriteriaValueStore } from "../../../store/useCafeCriteriaValue(NilaiAlternatif)";

interface NilaiAlternatifEditProps {
  isOpen: boolean;
  editId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const NilaiAlternatifEdit: React.FC<NilaiAlternatifEditProps> = ({
  isOpen,
  editId,
  onClose,
  onSuccess,
}) => {
  const { values, fetchValues, updateValue, isLoading, error } =
    useCafeCriteriaValueStore();

  const [newValue, setNewValue] = useState<string>("");

  useEffect(() => {
    fetchValues();
  }, []);

  useEffect(() => {
    if (isOpen && editId) {
      const found = values.find((v) => v.id === editId);
      if (found) {
        setNewValue(String(found.value));
      }
    }
  }, [isOpen, editId, values]);

  const existing = editId ? values.find((v) => v.id === editId) : null;
  const { cafe, criteria } = existing ?? { cafe: null, criteria: null };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || newValue === "") return;

    const success = await updateValue(editId, Number(newValue));
    if (success) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  if (isLoading && !existing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg p-10 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#C8A27C]" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
          <h2 className="font-black text-[#3E2C23] text-xl">Edit Nilai Alternatif</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">⚠ {error}</p>
          )}

          {existing && cafe && criteria ? (
            <>
              {/* Info Cafe & Kriteria */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E8DED5] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center shrink-0">
                    <Coffee size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">Cafe</p>
                    <p className="font-black text-[#3E2C23]">{cafe.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0E8DF] flex items-center justify-center shrink-0">
                    <LayoutGrid size={15} className="text-[#8B5E3C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">Kriteria</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 bg-white border border-[#E8DED5] rounded-lg text-[#6F4E37] font-black">
                        {criteria.code}
                      </span>
                      <span className="font-bold text-[#3E2C23] text-sm">{criteria.name}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                    criteria.type === "BENEFIT"
                      ? "bg-[#F0FFF4] text-green-700"
                      : "bg-[#FFF1F1] text-red-500"
                  }`}>
                    {criteria.type === "BENEFIT" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {criteria.type}
                  </span>
                </div>
              </div>

              {/* Hint */}
              <p className="text-xs text-[#8B735C] px-1">
                {criteria.type === "BENEFIT"
                  ? "💡 Semakin tinggi nilai, semakin baik untuk kriteria ini."
                  : "💡 Semakin rendah nilai, semakin baik untuk kriteria ini."}
              </p>

              {/* Perbandingan nilai lama → baru */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                <span className="text-xs text-[#8B735C] font-semibold">Nilai saat ini:</span>
                <span className="text-2xl font-black text-[#3E2C23]">{existing.value}</span>
                {newValue !== "" && Number(newValue) !== existing.value && (
                  <>
                    <span className="text-[#C8A27C] font-black text-lg">→</span>
                    <span className="text-2xl font-black text-[#8B5E3C]">{newValue}</span>
                    <span className="text-xs text-[#8B735C]">
                      ({Number(newValue) > existing.value ? "+" : ""}
                      {(Number(newValue) - existing.value).toFixed(2)})
                    </span>
                  </>
                )}
              </div>

              {/* Input nilai baru */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                  Nilai Baru *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Masukkan nilai baru..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm font-mono outline-none focus:ring-2 focus:ring-[#C8A27C]"
                />
                <p className="text-xs text-[#8B735C]">
                  Contoh: harga dalam ribuan rupiah, rating 1–5, jarak dalam km, dst.
                </p>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-[#8B735C]">
              <LayoutGrid size={36} className="mx-auto mb-3 opacity-20" />
              <p>Data nilai tidak ditemukan.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-[#E8DED5] text-[#6F4E37] font-semibold hover:bg-[#F8F4EF] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || newValue === "" || Number(newValue) === existing?.value}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NilaiAlternatifEdit;