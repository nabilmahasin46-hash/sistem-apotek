import React, { useState } from "react";
import { Search, ListFilter, ArrowUpRight, ArrowDownLeft, Calendar, User, Eye } from "lucide-react";
import { TransaksiObat } from "../types";
import { formatDate, formatNumber } from "../utils/helpers";

interface TransactionLogsProps {
  transactions: TransaksiObat[];
}

export default function TransactionLogs({ transactions }: TransactionLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Masuk" | "Keluar">("All");

  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.namaObat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.kodeObat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.petugas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "All" ? true : tx.tipe === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Logs Controls */}
      <div className="glass p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-400 focus:bg-white/10 transition"
            placeholder="Cari obat, petugas, atau uraian transaksi..."
          />
        </div>

        {/* Filter Type Tabs */}
        <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5 w-full md:w-auto shrink-0 justify-center">
          <button
            onClick={() => setTypeFilter("All")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
              typeFilter === "All" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Semua Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter("Masuk")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition flex items-center space-x-1 ${
              typeFilter === "Masuk" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm" : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            <ArrowDownLeft className="h-3 w-3" />
            <span>Stok Masuk</span>
          </button>
          <button
            onClick={() => setTypeFilter("Keluar")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition flex items-center space-x-1 ${
              typeFilter === "Keluar" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm" : "text-slate-400 hover:text-rose-400"
            }`}
          >
            <ArrowUpRight className="h-3 w-3" />
            <span>Stok Keluar</span>
          </button>
        </div>
      </div>

      {/* Timeline List / Grid */}
      <div className="glass rounded-xl shadow-2xl overflow-hidden divide-y divide-white/5 border border-white/10">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="font-bold text-sm text-slate-300">Tidak Ada Transaksi Terpaut</p>
            <p className="text-xs text-slate-500 mt-1">Coba bersihkan kata kunci filter Anda.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isEntry = tx.tipe === "Masuk";
            return (
              <div
                key={tx.id}
                className="p-4 hover:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-150"
              >
                {/* Meta details (Direction Icon, Code, Drug Name, description) */}
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border font-sans ${
                      isEntry
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {isEntry ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[9px] font-bold bg-white/5 text-sky-300 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wide">
                        {tx.kodeObat}
                      </span>
                      <h4 className="text-sm font-extrabold text-white">{tx.namaObat}</h4>
                    </div>
                    <p className="text-xs text-slate-300 font-sans">{tx.keterangan}</p>
                    
                    {/* Timestamp & Operator details */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-sky-400" />
                        <span>{formatDate(tx.tanggal, true)}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-bold">
                        <User className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="text-slate-400">Petugas: <strong className="text-slate-200">{tx.petugas}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantitative Value badge */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide inline-flex items-center space-x-1 ${
                      isEntry
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                    }`}
                  >
                    <span>{isEntry ? "+" : "-"}</span>
                    <span>{formatNumber(tx.jumlah)}</span>
                  </span>
                  
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Sistem Log
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
