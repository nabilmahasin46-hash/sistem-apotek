import React, { useState, useEffect } from "react";
import { X, Save, AlertTriangle, HelpCircle } from "lucide-react";
import { Obat, User } from "../types";

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medData: any) => Promise<boolean>;
  editingMedicine: Obat | null;
  currentUser: User;
}

export default function MedicineFormModal({ isOpen, onClose, onSubmit, editingMedicine, currentUser }: MedicineFormModalProps) {
  // Local states
  const [kodeObat, setKodeObat] = useState("");
  const [nama, setNama] = useState("");
  const [produsen, setProdusen] = useState("");
  const [jumlah, setJumlah] = useState<number>(0);
  const [satuan, setSatuan] = useState<"Tablet" | "Botol" | "Kapsul" | "Pcs" | "Kaplet" | "Salep">("Tablet");
  const [tanggalExpired, setTanggalExpired] = useState("");
  const [rakPenyimpanan, setRakPenyimpanan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  
  // Custom transaction logs override for edits
  const [tipeKustom, setTipeKustom] = useState<"Masuk" | "Keluar" | "">("");
  const [keteranganKustom, setKeteranganKustom] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form when opening/editing changes
  useEffect(() => {
    if (editingMedicine) {
      setKodeObat(editingMedicine.kodeObat);
      setNama(editingMedicine.nama);
      setProdusen(editingMedicine.produsen);
      setJumlah(editingMedicine.jumlah);
      setSatuan(editingMedicine.satuan);
      setTanggalExpired(editingMedicine.tanggalExpired);
      setRakPenyimpanan(editingMedicine.rakPenyimpanan || "");
      setDeskripsi(editingMedicine.deskripsi || "");
      setTipeKustom("");
      setKeteranganKustom("");
    } else {
      // Clear forms
      setKodeObat("");
      setNama("");
      setProdusen("");
      setJumlah(0);
      setSatuan("Tablet");
      setTanggalExpired("2027-06-01"); // Future expiry default
      setRakPenyimpanan("");
      setDeskripsi("");
      setTipeKustom("");
      setKeteranganKustom("");
    }
    setErrorMsg(null);
  }, [editingMedicine, isOpen]);
 // Dynamically set default description and transaction type when stock quantity changes
  useEffect(() => {
    if (editingMedicine && isOpen) {
      const diff = jumlah - editingMedicine.jumlah;
      if (diff < 0) {
        setTipeKustom("Keluar");
        if (!keteranganKustom || keteranganKustom === "Restock" || keteranganKustom === "Diambil") {
          setKeteranganKustom("Diambil");
        }
      } else if (diff > 0) {
        setTipeKustom("Masuk");
        if (!keteranganKustom || keteranganKustom === "Diambil" || keteranganKustom === "Restock") {
          setKeteranganKustom("Restock");
        }
      } else {
         setTipeKustom("");
        setKeteranganKustom("");
      }
        }
  }, [jumlah, editingMedicine, isOpen]);


  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!kodeObat.trim()) return setErrorMsg("Kode Obat wajib diisi!");
    if (!nama.trim()) return setErrorMsg("Nama Obat wajib diisi!");
    if (!produsen.trim()) return setErrorMsg("Produsen wajib diisi!");
    if (jumlah < 1) return setErrorMsg("Jumlah stok tidak boleh negatif!");
    if (!tanggalExpired) return setErrorMsg("Tanggal Kedaluwarsa wajib dipilih!");

    setSubmitting(true);
    
    const payload = {
      id: editingMedicine?.id,
      kodeObat: kodeObat.trim().toUpperCase(),
      nama: nama.trim(),
      produsen: produsen.trim(),
      jumlah: Number(jumlah),
      satuan,
      tanggalExpired,
      rakPenyimpanan: rakPenyimpanan.trim() || undefined,
      deskripsi: deskripsi.trim() || undefined,
      petugasNama: currentUser.nama,
      // For stock adjustment logging overrides
      tipeKustom: tipeKustom || undefined,
      keteranganKustom: keteranganKustom.trim() || undefined
    };

    const success = await onSubmit(payload);
    setSubmitting(false);
    if (success) {
      onClose();
    } else {
      setErrorMsg("Gagal menyimpan data obat. Kode Obat mungkin sudah terpakai!");
    }
  };

  const hasStockChanged = editingMedicine && editingMedicine.jumlah !== Number(jumlah);

  return (
    <div id="medicine-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-2xl shadow-2xl border border-white/10 divide-y divide-white/5">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-base font-extrabold text-white tracking-wide">
            {editingMedicine ? `Sunting Obat: ${editingMedicine.nama}` : "Tambah Stok Obat Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit}>
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="bg-rose-500/10 text-rose-300 p-3 rounded-xl text-xs font-semibold border border-rose-500/20 flex items-center space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-450 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Kode Obat */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Kode Obat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kodeObat}
                  disabled={editingMedicine !== null} // Lock code in edits as standard practice
                  onChange={(e) => setKodeObat(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition disabled:opacity-40"
                  placeholder="Kode Obat, e.g. PO-001"
                />
              </div>

              {/* Nama Obat */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Obat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition"
                  placeholder="Nama Obat, e.g. Amoxicillin 500mg"
                />
              </div>

              {/* Produsen */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Produsen (Pabrik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={produsen}
                  onChange={(e) => setProdusen(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition"
                  placeholder="Produsen, e.g. Kalbe Farma"
                />
              </div>

              {/* Satuan Obat */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-sky-400 focus:outline-none transition cursor-pointer"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Botol">Botol</option>
                  <option value="Kapsul">Kapsul</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Kaplet">Kaplet</option>
                  <option value="Salep">Salep</option>
                </select>
              </div>

              {/* Jumlah Stok */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Jumlah Stok Saat Ini <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min=""
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition font-semibold"
                />
              </div>

              {/* Tanggal Expired */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tanggal Kedaluwarsa (Expired) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalExpired}
                  onChange={(e) => setTanggalExpired(e.target.value)}
                  className="w-full font-semibold rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition"
                />
              </div>

              {/* Rak Penyimpanan */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  LOKASI RAK PENYIMPANAN
                </label>
                <input
                  type="text"
                  value={rakPenyimpanan}
                  onChange={(e) => setRakPenyimpanan(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition"
                  placeholder="e.g. Rak B-2 (Antibiotik)"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                KETERANGAN / INDIKASI OBAT
              </label>
              <textarea
                value={deskripsi}
                rows={2}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-sky-400 focus:outline-none transition resize-none"
                placeholder="Deskripsi singkat obat"
              />
            </div>

            {/* If Stock Changes: Demand a Transaction Memo */}
            {hasStockChanged && (
              <div className="bg-sky-500/10 p-4 rounded-xl border border-sky-500/25 space-y-3 text-sky-200">
                <div className="flex items-start space-x-2 text-sky-200 text-xs">
                  <HelpCircle className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Log Transaksi Otomatis Terdeteksi:</span> Jumlah stok obat disunting dari{" "}
                    <strong className="text-white">
                      {editingMedicine?.jumlah} {satuan}
                    </strong>{" "}
                    menjadi{" "}
                    <strong className="text-white">
                      {jumlah} {satuan}
                    </strong>{" "}
                    (Selisih: {jumlah - (editingMedicine?.jumlah || 0)} {satuan}).
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wide font-bold text-sky-300 mb-1">
                      Kategori Log Transaksi
                    </label>
                    <select
                      value={tipeKustom}
                      onChange={(e) => setTipeKustom(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="">Otomatis (Sesuai Selisih)</option>
                      <option value="Masuk">Masuk (Penerimaan/Restock)</option>
                      <option value="Keluar">Keluar (Terjual/Rusak/Exp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wide font-bold text-sky-300 mb-1">
                      Keterangan / Memo Log <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={keteranganKustom}
                      onChange={(e) => setKeteranganKustom(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 py-1.5 px-3 text-xs text-white focus:outline-none placeholder-slate-500"
                      placeholder="e.g. Pembelian PBF, atau pasien BPJS"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-950/40 rounded-b-2xl flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-pointer disabled:opacity-55"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-extrabold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-55 shadow-lg shadow-sky-500/15"
            >
              <Save className="h-4 w-4 text-slate-950" />
              <span>{submitting ? "Menyimpan..." : "Simpan Data"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
