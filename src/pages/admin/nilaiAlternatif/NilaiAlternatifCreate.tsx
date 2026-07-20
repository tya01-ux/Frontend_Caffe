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
import { useCafeStore } from "../../../store/useCaffeStore";
import { useCriteriaStore } from "../../../store/useCriteriaStore";

interface NilaiAlternatifCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefilledCafeId?: number;
  prefilledCriteriaId?: number;
}

const NilaiAlternatifCreate: React.FC<NilaiAlternatifCreateProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledCafeId,
  prefilledCriteriaId,
}) => {
  const { createValue, isLoading, error } = useCafeCriteriaValueStore();
  const { cafes, fetchCafes } = useCafeStore();
  const { criterias, fetchCriterias } = useCriteriaStore();

  const [formCafeId, setFormCafeId] = useState<string>("");
  const [formCriteriaId, setFormCriteriaId] = useState<string>("");
  const [formValue, setFormValue] = useState<string>("");

  useEffect(() => {
    fetchCafes();
    fetchCriterias();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormCafeId(prefilledCafeId ? String(prefilledCafeId) : "");
      setFormCriteriaId(prefilledCriteriaId ? String(prefilledCriteriaId) : "");
      setFormValue("");
    }
  }, [isOpen, prefilledCafeId, prefilledCriteriaId]);

  const selectedCafe = cafes.find((c) => c.id === Number(formCafeId));
  const selectedCriteria = criterias.find((c) => c.id === Number(formCriteriaId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCafeId || !formCriteriaId || formValue === "") return;

    const success = await createValue({
      cafeId: Number(formCafeId),
      criteriaId: Number(formCriteriaId),
      value: Number(formValue),
    });

    if (success) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
          <h2 className="font-black text-[#3E2C23] text-xl">Tambah Nilai Alternatif</h2>
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

          {/* Pilih Cafe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
              Cafe *
            </label>
            {prefilledCafeId ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] border border-[#E8DED5] rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center shrink-0">
                  <Coffee size={13} className="text-white" />
                </div>
                <span className="text-sm font-bold text-[#3E2C23]">
                  {selectedCafe?.name || "—"}
                </span>
              </div>
            ) : (
              <select
                required
                value={formCafeId}
                onChange={(e) => setFormCafeId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
              >
                <option value="">Pilih Cafe</option>
                {cafes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Pilih Kriteria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
              Kriteria *
            </label>
            {prefilledCriteriaId ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] border border-[#E8DED5] rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-[#F0E8DF] flex items-center justify-center shrink-0">
                  <LayoutGrid size={13} className="text-[#8B5E3C]" />
                </div>
                <span className="font-mono text-xs px-2 py-0.5 bg-white border border-[#E8DED5] rounded-lg text-[#6F4E37] font-black">
                  {selectedCriteria?.code}
                </span>
                <span className="text-sm font-bold text-[#3E2C23]">
                  {selectedCriteria?.name}
                </span>
              </div>
            ) : (
              <select
                required
                value={formCriteriaId}
                onChange={(e) => setFormCriteriaId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
              >
                <option value="">Pilih Kriteria</option>
                {criterias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Info tipe kriteria */}
          {selectedCriteria && (
            <div
              className={`rounded-2xl p-4 flex items-center gap-3 ${
                selectedCriteria.type === "BENEFIT"
                  ? "bg-[#F0FFF4] border border-green-100"
                  : "bg-[#FFF1F1] border border-red-100"
              }`}
            >
              {selectedCriteria.type === "BENEFIT" ? (
                <TrendingUp size={18} className="text-green-600 shrink-0" />
              ) : (
                <TrendingDown size={18} className="text-red-500 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-bold ${selectedCriteria.type === "BENEFIT" ? "text-green-700" : "text-red-600"}`}>
                  {selectedCriteria.type === "BENEFIT"
                    ? "Semakin tinggi nilai, semakin baik"
                    : "Semakin rendah nilai, semakin baik"}
                </p>
                <p className="text-xs text-[#8B735C] mt-0.5">
                  Bobot: <strong>{selectedCriteria.weight}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Input nilai */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
              Nilai *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="Masukkan nilai numerik..."
              className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm font-mono outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
            <p className="text-xs text-[#8B735C]">
              Contoh: harga dalam ribuan rupiah, rating 1–5, jarak dalam km, dst.
            </p>
          </div>

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
              disabled={isLoading || !formCafeId || !formCriteriaId || formValue === ""}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Nilai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NilaiAlternatifCreate;