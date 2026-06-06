import React from "react";
import { AlertTriangle, CalendarRange, ArrowRight, ShieldAlert, BadgeInfo } from "lucide-react";
import { Obat } from "../types";
import { getDaysToExpiry } from "../utils/helpers";

interface AlertBannerListProps {
  medicines: Obat[];
  onFocusMedicine: (searchQuery: string) => void;
}

export default function AlertBannerList({ medicines, onFocusMedicine }: AlertBannerListProps) {
  // Filters
  const lowStockDrugs = medicines.filter(o => o.jumlah < 5);
  const nearExpiryDrugs = medicines.filter(o => {
    const { isUnder3Months, isExpired } = getDaysToExpiry(o.tanggalExpired);
    return isUnder3Months || isExpired;
  });

  if (lowStockDrugs.length === 0 && nearExpiryDrugs.length === 0) {
    return (
      <div id="no-alerts" className="glass-emerald rounded-xl p-4 flex items-center space-x-3 text-emerald-300">
        <BadgeInfo className="h-5 w-5 text-emerald-400 shrink-0" />
        <p className="text-xs font-semibold">
          <strong>Semua Aman:</strong> Tidak ada obat dengan stok menipis (&lt; 5) maupun obat yang akan kedaluwarsa dalam 3 bulan mendatang.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Low stock Warning Card */}
      {lowStockDrugs.length > 0 && (
        <div id="low-stock-alert" className="glass-orange rounded-xl p-4 shadow-lg text-amber-100">
          <div className="flex items-center space-x-2 text-amber-400 mb-3">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-xs tracking-wide uppercase">
              Peringatan Stok Obat Menipis (&lt; 5 Unit)
            </h3>
            <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
              {lowStockDrugs.length} Obat
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {lowStockDrugs.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-xs glass bg-white/5 p-2 px-3 rounded-xl border border-white/5 font-sans transition duration-150">
                <div className="flex flex-col">
                  <span className="font-bold text-white text-xs">{o.nama}</span>
                  <span className="font-mono text-slate-400 text-[10px] mt-0.5">{o.kodeObat} • Produsen: {o.produsen}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="badge-red text-[11px] px-2.5 py-1 rounded-lg font-bold">
                    Sisa: {o.jumlah} {o.satuan}
                  </span>
                  <button
                    onClick={() => onFocusMedicine(o.kodeObat)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer hover:underline text-[11px]"
                    title="Cari obat di tabel"
                  >
                    <span>Cari</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Expiring Warning Card */}
      {nearExpiryDrugs.length > 0 && (
        <div id="near-expiry-alert" className="glass-red rounded-xl p-4 shadow-lg text-rose-100">
          <div className="flex items-center space-x-2 text-rose-400 mb-3">
            <CalendarRange className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
            <h3 className="font-bold text-xs tracking-wide uppercase">
              Peringatan Kadaluwarsa (&lt; 3 Bulan / Habis)
            </h3>
            <span className="ml-auto bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
              {nearExpiryDrugs.length} Obat
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {nearExpiryDrugs.map((o) => {
              const { days, isExpired } = getDaysToExpiry(o.tanggalExpired);
              return (
                <div key={o.id} className="flex items-center justify-between text-xs glass bg-white/5 p-2 px-3 rounded-xl border border-white/5 font-sans transition duration-150">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">{o.nama}</span>
                    <span className="font-mono text-slate-400 text-[10px] mt-0.5">
                      Expired: <strong className="text-rose-300">{o.tanggalExpired}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isExpired ? (
                      <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-lg font-bold text-[10px]">
                        SUDAH EXPIRED
                      </span>
                    ) : (
                      <span className="badge-red px-2 py-1 rounded-lg font-bold text-[10px]">
                        {days} Hari Lagi
                      </span>
                    )}
                    <button
                      onClick={() => onFocusMedicine(o.kodeObat)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer hover:underline text-[11px]"
                    >
                      <span>Cari</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
