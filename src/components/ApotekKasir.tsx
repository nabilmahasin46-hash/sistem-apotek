import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  FileText, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  TrendingDown,
  Activity,
  History
} from "lucide-react";
import { Obat, User, TransaksiObat } from "../types";
import { formatNumber, formatDate } from "../utils/helpers";

interface ApotekKasirProps {
  medicines: Obat[];
  currentUser: User;
  onTransactionSuccess: () => void;
}

export default function ApotekKasir({ medicines, currentUser, onTransactionSuccess }: ApotekKasirProps) {
  // State variables for search/selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObat, setSelectedObat] = useState<Obat | null>(null);
  
  // State variables for checkout details
  const [jumlahBeli, setJumlahBeli] = useState<number>(1);
  const [namaPembeli, setNamaPembeli] = useState("");
  const [catatan, setCatatan] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter medicines based on query (only show medicines with stock > 0 for selling)
  const filteredMedicines = medicines.filter(
    (med) =>
      med.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.kodeObat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.produsen && med.produsen.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle medicine choice
  const handleSelect = (med: Obat) => {
    setSelectedObat(med);
    setJumlahBeli(1);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Deselect / Reset
  const handleResetForm = () => {
    setSelectedObat(null);
    setJumlahBeli(1);
    setNamaPembeli("");
    setCatatan("");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObat) {
      setErrorMsg("Silakan pilih obat terlebih dahulu.");
      return;
    }

    if (jumlahBeli <= 0) {
      setErrorMsg("Jumlah pembelian minimal rincian adalah 1 unit.");
      return;
    }

    if (jumlahBeli > selectedObat.jumlah) {
      setErrorMsg(`Aksi ditolak: Stok tidak mencukupi! Hanya tersedia ${selectedObat.jumlah} ${selectedObat.satuan}.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const memoDetails = `Penjualan Kasir Apotek [${selectedObat.nama}]. Pasien/Pembeli: ${namaPembeli.trim() || "Pasien Umum"}.${catatan.trim() ? ` Catatan: ${catatan}` : ""}`;

    try {
      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          obatId: selectedObat.id,
          tipe: "Keluar",
          jumlah: jumlahBeli,
          keterangan: memoDetails,
          petugasNama: currentUser.nama
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Transaksi berhasil! ${jumlahBeli} ${selectedObat.satuan} dari ${selectedObat.nama} berhasil terjual.`);
        onTransactionSuccess(); // Refresh parents' lists immediately
        
        // Reset state after success
        const selectedId = selectedObat.id;
        setSelectedObat(null);
        setJumlahBeli(1);
        setNamaPembeli("");
        setCatatan("");
        setSearchQuery("");
      } else {
        setErrorMsg(data.message || "Gagal memproses transaksi penjualan.");
      }
    } catch (err) {
      setErrorMsg("Gagal menghubungi server. Periksa jaringan Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* COLUMN 1: SELECT DRUG SEARCH */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">
              1. Pilih Obat dari Inventaris
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold">
              {filteredMedicines.length} Item Siap Jual
            </span>
          </div>

          {/* Search bar input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-white placeholder-slate-400 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-150"
              placeholder="Ketik nama obat, produsen, atau kode obat..."
            />
          </div>

          {/* Medicine List Selection Scroll Area */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5 pr-1 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
            {filteredMedicines.map((med) => {
              const isSelected = selectedObat?.id === med.id;
              const isOutOfStock = med.jumlah <= 0;
              const isLowStock = med.jumlah > 0 && med.jumlah < 5;

              return (
                <button
                  key={med.id}
                  onClick={() => !isOutOfStock && handleSelect(med)}
                  disabled={isOutOfStock}
                  className={`w-full text-left p-3.5 rounded-xl transition flex items-center justify-between group ${
                    isSelected 
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-white" 
                      : isOutOfStock 
                        ? "opacity-40 cursor-not-allowed bg-transparent text-slate-500" 
                        : "hover:bg-white/5 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-white/5 text-slate-400 group-hover:text-white"
                    }`}>
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-black transition ${isSelected ? "text-emerald-400" : "text-white"}`}>
                        {med.nama}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {med.kodeObat} • Produsen: {med.produsen}
                      </p>
                      {med.rakPenyimpanan && (
                        <span className="text-[9px] text-slate-500 font-bold tracking-wide mt-1 block uppercase">
                          Rak: {med.rakPenyimpanan}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black inline-block px-2.5 py-1 rounded-lg ${
                      isOutOfStock 
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                        : isLowStock 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      Stok: {med.jumlah} {med.satuan}
                    </span>
                    <p className="text-[8px] text-slate-500 mt-1 font-mono uppercase">
                      Exp: {med.tanggalExpired}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredMedicines.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-xs">Tidak ada obat terdaftar atau cocok dengan pencarian Anda.</p>
                <p className="text-[10px] text-slate-500 mt-1">Pastikan nama obat dimasukkan dengan benar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tip Box matching original styling */}
        <div className="glass p-4 rounded-xl flex items-start space-x-3 text-slate-300 text-xs">
          <Activity className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="leading-relaxed">
            <span className="font-bold text-emerald-400">Prosedur Pengeluaran K3 Medis:</span> 
            Selalu cek label botol, indikasi, dan masa berlaku obat sebelum diserahkan pada pasien. Laporkan langsung di log jika terjadi penyusutan barang yang tidak terduga.
          </div>
        </div>
      </div>

      {/* COLUMN 2: SALE & CHECKOUT FORM */}
      <div className="space-y-4">
        <form onSubmit={handleCheckout} className="glass p-5 rounded-2xl shadow-xl space-y-5 relative">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">
            2. Rincian Pelayanan Obat
          </h3>

          {selectedObat ? (
            <div className="space-y-4 animate-fade-in">
              
              {/* Selected card snippet */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                  Obat Terpilih
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">{selectedObat.nama}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedObat.kodeObat}</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/5 mt-2">
                  <span className="text-slate-400">Stok Tersedia:</span>
                  <strong className="text-emerald-400 font-bold">{selectedObat.jumlah} {selectedObat.satuan}</strong>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Jumlah Pembelian ({selectedObat.satuan}) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setJumlahBeli(prev => Math.max(1, prev - 1))}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedObat.jumlah}
                    value={jumlahBeli}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > selectedObat.jumlah) {
                        setJumlahBeli(selectedObat.jumlah);
                      } else if (val < 1) {
                        setJumlahBeli(1);
                      } else {
                        setJumlahBeli(val);
                      }
                    }}
                    className="flex-1 text-center font-bold text-sm h-10 rounded-xl border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setJumlahBeli(prev => Math.min(selectedObat.jumlah, prev + 1))}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Patient Name / Buyer */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Nama Pasien / Pembeli
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={namaPembeli}
                    onChange={(e) => setNamaPembeli(e.target.value)}
                    className="w-full text-xs pl-9 rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-white placeholder-slate-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. Tn. Slamet Hadi (Pasien Umum)"
                  />
                </div>
              </div>

              {/* Catatan / Keterangan Pembelian */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Catatan / Keterangan Tambahan
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </span>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={2}
                    className="w-full text-xs pl-9 rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder="e.g. Resep dr. Setiadi Sp.A / Pembelian bebas"
                  />
                </div>
              </div>

              {/* Error and Success status notifications inside card */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl flex items-start space-x-2 animate-pulse">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Gagal:</strong> {errorMsg}
                  </div>
                </div>
              )}

              {/* Summary panel before submission */}
              <div className="bg-white/5 p-3 rounded-xl space-y-1.5 text-[11px] text-slate-400 border border-white/5">
                <div className="flex justify-between">
                  <span>Nama Obat:</span>
                  <span className="text-white font-semibold">{selectedObat.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span>Satuan Jumlah:</span>
                  <span className="text-white font-semibold">{jumlahBeli} {selectedObat.satuan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Stok Pasca Jual:</span>
                  <span className="text-emerald-400 font-bold">{selectedObat.jumlah - jumlahBeli} {selectedObat.satuan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pencatat / Operator:</span>
                  <span className="text-white font-mono">{currentUser.nama}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition cursor-pointer flex items-center justify-center space-x-1 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <span>{loading ? "Menyimpan Transaksi..." : "Kurangi Stok (Jual)"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">Form Belum Aktif</p>
                <p className="text-[10px] text-slate-500 px-6 leading-relaxed">
                  Silakan cari dan klik salah satu obat pada tabel kiri untuk memulai pengisian log penjualan.
                </p>
              </div>
            </div>
          )}
        </form>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-2xl flex items-start space-x-2.5 shadow-xl animate-fade-in shadow-emerald-500/5">
            <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-white mb-0.5">Penjualan Berhasil Disimpan!</strong>
              <p className="text-slate-300">{successMsg}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
