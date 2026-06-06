import React, { useState } from "react";
import { Search, Filter, Edit, Trash2, PlusCircle, Calendar, MapPin, RefreshCw, X } from "lucide-react";
import { Obat, User } from "../types";
import { formatDate, getDaysToExpiry, formatNumber } from "../utils/helpers";

interface MedicineTableProps {
  medicines: Obat[];
  currentUser: User;
  onEdit: (med: Obat) => void;
  onDelete: (id: string, name: string) => void;
  onAddClick: () => void;
  isLoading: boolean;
  onRefresh: () => void;
  highlightedQuery: string;
}

export default function MedicineTable({
  medicines,
  currentUser,
  onEdit,
  onDelete,
  onAddClick,
  isLoading,
  onRefresh,
  highlightedQuery
}: MedicineTableProps) {
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState(highlightedQuery || "");
  const [unitFilter, setUnitFilter] = useState("");
  const [alertFilter, setAlertFilter] = useState<"All" | "Low" | "Expiry">("All");

  // Sync searchQuery from props if focused from alerting component
  React.useEffect(() => {
    if (highlightedQuery) {
      setSearchTerm(highlightedQuery);
    }
  }, [highlightedQuery]);

  // Clean filters
  const resetFilters = () => {
    setSearchTerm("");
    setUnitFilter("");
    setAlertFilter("All");
  };

  // Process filters locally
  const filteredMedicines = medicines.filter((med) => {
    // 1. Search name & code
    const matchesSearch =
      med.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.kodeObat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.produsen.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Unit status
    const matchesUnit = unitFilter ? med.satuan === unitFilter : true;

    // 3. Alerts status
    let matchesAlert = true;
    if (alertFilter === "Low") {
      matchesAlert = med.jumlah < 5;
    } else if (alertFilter === "Expiry") {
      const { isUnder3Months, isExpired } = getDaysToExpiry(med.tanggalExpired);
      matchesAlert = isUnder3Months || isExpired;
    }

    return matchesSearch && matchesUnit && matchesAlert;
  });

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="glass p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-10 rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-white placeholder-slate-400 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
            placeholder="Cari Nama atau Kode Obat..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Bersihkan Pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories / Unit Filter */}
        <div id="filters-container" className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          
          {/* Unit Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 text-xs py-1.5 px-3 text-slate-200 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua Satuan</option>
              <option value="Tablet">Tablet</option>
              <option value="Botol">Botol</option>
              <option value="Kapsul">Kapsul</option>
              <option value="Pcs">Pcs</option>
              <option value="Kaplet">Kaplet</option>
              <option value="Salep">Salep</option>
            </select>
          </div>

          {/* Quick alert selector badges */}
          <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5">
            <button
              onClick={() => setAlertFilter("All")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                alertFilter === "All" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setAlertFilter("Low")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                alertFilter === "Low" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-amber-300"
              }`}
            >
              Stok &lt; 5
            </button>
            <button
              onClick={() => setAlertFilter("Expiry")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                alertFilter === "Expiry" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "text-slate-400 hover:text-rose-300"
              }`}
            >
              Exp &lt; 3 Bln
            </button>
          </div>

          <button
            onClick={resetFilters}
            className="text-[10px] text-slate-400 hover:text-white underline font-semibold cursor-pointer ml-1.5"
          >
            Reset Filter
          </button>
        </div>

        {/* Global actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onAddClick}
            className="bg-emerald-400 text-slate-950 font-extrabold hover:bg-emerald-300 px-3.5 py-2 text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <PlusCircle className="h-4 w-4 text-slate-950" />
            <span>Tambah Obat</span>
          </button>
        </div>

      </div>

      {/* Main Table Grid */}
      <div className="glass rounded-xl shadow-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table id="stok-obat-table" className="min-w-full divide-y divide-white/5 text-left">
            <thead className="bg-slate-950/40 font-sans text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Kode Obat</th>
                <th className="px-6 py-4">Nama Obat</th>
                <th className="px-6 py-4">Produsen</th>
                <th className="px-6 py-4 text-right">Jumlah Stok</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4">Tgl Kedaluwarsa</th>
                <th className="px-6 py-4">Rak/Lokasi</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-sans">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 bg-transparent">
                    <p className="font-bold text-sm text-slate-300">Tidak ditemukan data obat</p>
                    <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isLow = med.jumlah < 5;
                  const { days, isUnder3Months, isExpired } = getDaysToExpiry(med.tanggalExpired);

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-white/5 transition duration-150 ${
                        isExpired ? "bg-red-500/5" : isUnder3Months ? "bg-amber-500/5" : ""
                      }`}
                    >
                      {/* Kode */}
                      <td className="px-6 py-4 font-mono font-bold text-emerald-300 text-xs">
                        {med.kodeObat}
                      </td>

                      {/* Nama & Deskripsi */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{med.nama}</span>
                          {med.deskripsi && (
                            <span className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                              {med.deskripsi}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Produsen */}
                      <td className="px-6 py-4 text-slate-300">
                        {med.produsen}
                      </td>

                      {/* Jumlah */}
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                            isLow
                              ? "bg-red-500/15 text-red-400 border border-red-500/25"
                              : "text-slate-100 bg-white/5"
                          }`}
                        >
                          {formatNumber(med.jumlah)}
                        </span>
                      </td>

                      {/* Satuan */}
                      <td className="px-6 py-4 text-slate-400">
                        {med.satuan}
                      </td>

                      {/* Expired Date & Badge alerts */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-[12px] ${isExpired || isUnder3Months ? "font-bold text-slate-100" : "text-slate-300"}`}>
                            {formatDate(med.tanggalExpired)}
                          </span>
                          
                          {/* Alert Badge representation */}
                          {isExpired ? (
                            <span className="inline-flex items-center text-[9px] font-bold text-rose-400 mt-1 uppercase tracking-wide">
                              ⚠️ Kadaluwarsa
                            </span>
                          ) : isUnder3Months ? (
                            <span className="inline-flex items-center text-[9px] font-bold text-amber-400 mt-1 uppercase tracking-wide">
                              ⏳ Exp &lt; {Math.ceil(days / 30)} Bln ({days} H)
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[9px] font-medium text-emerald-400 mt-1">
                              ✓ Aman ({days} Hari)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rak Penyimpanan */}
                      <td className="px-6 py-4 font-sans">
                        <span className="inline-flex items-center space-x-1.5 bg-white/5 text-emerald-250 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-white/5">
                          <MapPin className="h-3 w-3 text-emerald-400" />
                          <span>{med.rakPenyimpanan || "Belum ditentukan"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          
                          {/* Edit / Restock button */}
                          <button
                            onClick={() => onEdit(med)}
                            className="p-1 px-3 rounded-lg border border-white/10 text-emerald-300 hover:text-slate-950 hover:bg-emerald-400 hover:border-emerald-400 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                            title="Edit atau Restock obat"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete button (Restricted for Petugas Gudang role !) */}
                          {currentUser.role !== "Petugas Gudang" ? (
                            <button
                              onClick={() => onDelete(med.id, med.nama)}
                              className="p-1 px-2 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 rounded-lg border border-white/10 transition cursor-pointer"
                              title="Hapus data obat"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1 px-2 text-slate-600 rounded-lg border border-white/5 cursor-not-allowed bg-white/5"
                              title="Hanya Apoteker/Admin yang dapat menghapus obat!"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic status/legend bar inside layout */}
        <div className="bg-slate-950/40 px-6 py-4.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <div>
            Menampilkan <strong>{filteredMedicines.length}</strong> data obat aktif
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500/20 inline-block border border-red-500/30"></span>
              <span>Stok Menipis (&lt;5)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/20 inline-block border border-amber-500/30"></span>
              <span>Kedaluwarsa Berdekatan</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
