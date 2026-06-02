import React, { useState, useEffect } from "react";
import { 
  Pill, 
  LayoutDashboard, 
  Database, 
  History, 
  BookOpen, 
  LogOut, 
  User as UserIcon, 
  AlertTriangle, 
  Calendar, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  HeartPulse,
  Info
} from "lucide-react";
import { User, Obat, TransaksiObat, DashboardStats } from "./types";
import Login from "./components/Login";
import AlertBannerList from "./components/AlertBannerList";
import MedicineTable from "./components/MedicineTable";
import MedicineFormModal from "./components/MedicineFormModal";
import TransactionLogs from "./components/TransactionLogs";
import ArchitectureGuide from "./components/ArchitectureGuide";
import { formatDate, formatNumber } from "./utils/helpers";

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "obat" | "logs" | "architecture">("dashboard");
  
  // Data State
  const [medicines, setMedicines] = useState<Obat[]>([]);
  const [transactions, setTransactions] = useState<TransaksiObat[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalObat: 0,
    stokMenipis: 0,
    hampirExpired: 0,
    totalMasuk: 0,
    totalKeluar: 0
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [focusQuery, setFocusQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Obat | null>(null);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem("gudang_obat_user");
    const savedToken = localStorage.getItem("gudang_obat_token");
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Fetch data whenever log in status changes
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resObat, resTx, resStats] = await Promise.all([
        fetch("/api/obat"),
        fetch("/api/transaksi"),
        fetch("/api/dashboard/stats")
      ]);

      if (resObat.ok && resTx.ok && resStats.ok) {
        const payloadObat = await resObat.json();
        const payloadTx = await resTx.json();
        const payloadStats = await resStats.json();

        setMedicines(payloadObat);
        setTransactions(payloadTx);
        setStats(payloadStats);
      }
    } catch (error) {
      console.error("Gagal menjangkau server API", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    localStorage.setItem("gudang_obat_user", JSON.stringify(user));
    localStorage.setItem("gudang_obat_token", userToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("gudang_obat_user");
    localStorage.removeItem("gudang_obat_token");
    setActiveTab("dashboard");
  };

  // Focus a specific drug on click
  const handleFocusMedicine = (searchQuery: string) => {
    setFocusQuery(searchQuery);
    setActiveTab("obat");
  };

  // Delete Medicine Handler
  const handleDeleteMedicine = async (id: string, name: string) => {
    if (!currentUser) return;
    if (currentUser.role === "Petugas Gudang") {
      alert("Akses Ditolak: Peran Petugas Gudang tidak diperbolehkan menghapus obat dari database!");
      return;
    }

    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus data obat "${name}"?\nLog pengeluaran stok sisa akan dicatat otomatis.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/obat/${id}?petugasNama=${encodeURIComponent(currentUser.nama)}`, {
        method: "DELETE"
      });

      if (response.ok) {
        // Refresh
        loadAllData();
      } else {
        const err = await response.json();
        alert(err.message || "Gagal menghapus obat.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // Form Submit Handler (both Create & Update)
  const handleFormSubmit = async (medData: any): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const isEdit = medData.id !== undefined;
      const url = isEdit ? `/api/obat/${medData.id}` : "/api/obat";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medData)
      });

      if (response.ok) {
        // Refresh data
        loadAllData();
        return true;
      } else {
        const resJson = await response.json();
        alert(resJson.message || "Gagal menyimpan obat.");
        return false;
      }
    } catch (e) {
      console.error(e);
      alert("Koneksi gagal.");
      return false;
    }
  };

  // Open Edit Dialog
  const handleEditClick = (med: Obat) => {
    setEditingMed(med);
    setIsModalOpen(true);
  };

  // Open Create Dialog
  const handleAddClick = () => {
    setEditingMed(null);
    setIsModalOpen(true);
  };

  // Guard Clause: Authentication Check
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-slate-100 transition duration-150">
      
      {/* 1. Header Navigation Bar */}
      <header className="glass sticky top-0 z-40 bg-slate-950/40 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title Identity */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
                  Apotek Sejahtera
                </h1>
                <p className="text-[9px] text-sky-400 font-bold tracking-widest uppercase mt-1.5 opacity-90">
                  Sistem Informasi Inventaris & Stok Obat
                </p>
              </div>
            </div>

            {/* Menu Tabs for Large screen */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Tab: Dashboard */}
              <button
                onClick={() => { setActiveTab("dashboard"); setFocusQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  activeTab === "dashboard" ? "bg-white/10 text-sky-400 border border-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              {/* Tab: Medicines table */}
              <button
                onClick={() => { setActiveTab("obat"); setFocusQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  activeTab === "obat" ? "bg-white/10 text-sky-400 border border-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Manajemen Stok</span>
              </button>

              {/* Tab: Logs */}
              <button
                onClick={() => { setActiveTab("logs"); setFocusQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  activeTab === "logs" ? "bg-white/10 text-sky-400 border border-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <History className="h-4 w-4" />
                <span>Log Transaksi</span>
              </button>

              {/* Tab: Docs */}
              <button
                onClick={() => { setActiveTab("architecture"); setFocusQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  activeTab === "architecture" ? "bg-white/10 text-sky-400 border border-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Panduan & Arsitektur</span>
              </button>
            </nav>

            {/* Operator Badge and Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 border-l pl-3 border-white/10">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-slate-200">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="text-left leading-none">
                  <p className="text-xs font-bold text-white">{currentUser.nama}</p>
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full inline-block mt-1 border border-sky-400/20">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 ml-1 rounded-xl border border-white/10 hover:bg-red-500/10 text-slate-400 hover:text-red-400 hover:border-red-500/20 transition cursor-pointer"
                title="Keluar dari sistem"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Submenu Toolbar */}
      <div className="md:hidden glass border-b border-white/5 py-2.5 px-4 flex items-center justify-around text-slate-300 shadow-lg">
        <button
          onClick={() => { setActiveTab("dashboard"); setFocusQuery(""); }}
          className={`flex flex-col items-center text-[10px] space-y-1 font-bold ${activeTab === "dashboard" ? "text-sky-400" : "text-slate-400"}`}
        >
          <LayoutDashboard className="h-4.5 w-4.5" />
          <span>Statistik</span>
        </button>

        <button
          onClick={() => { setActiveTab("obat"); setFocusQuery(""); }}
          className={`flex flex-col items-center text-[10px] space-y-1 font-bold ${activeTab === "obat" ? "text-sky-400" : "text-slate-400"}`}
        >
          <Layers className="h-4.5 w-4.5" />
          <span>Kelola Obat</span>
        </button>

        <button
          onClick={() => { setActiveTab("logs"); setFocusQuery(""); }}
          className={`flex flex-col items-center text-[10px] space-y-1 font-bold ${activeTab === "logs" ? "text-sky-400" : "text-slate-400"}`}
        >
          <History className="h-4.5 w-4.5" />
          <span>Logs</span>
        </button>

        <button
          onClick={() => { setActiveTab("architecture"); setFocusQuery(""); }}
          className={`flex flex-col items-center text-[10px] space-y-1 font-bold ${activeTab === "architecture" ? "text-sky-400" : "text-slate-400"}`}
        >
          <BookOpen className="h-4.5 w-4.5" />
          <span>Panduan</span>
        </button>
      </div>

      {/* 2. Main Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Dynamic header greeting info widget */}
        <div id="greeting-panel" className="glass p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selamat datang kembali</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight mt-1">
              {currentUser.nama}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5">
              Sebagai <strong className="text-sky-300 font-bold">{currentUser.role}</strong>, Anda memiliki otorisasi penuh untuk mengelola pendaftaran dan restock inventaris apotik.
            </p>
          </div>
          <div className="shrink-0 flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-slate-300 font-sans">
            <Calendar className="h-4.5 w-4.5 text-sky-400" />
            <div className="flex flex-col">
              <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Waktu Sistem (GMT+0)</span>
              <strong className="text-white mt-0.5">{formatDate("2026-06-02T12:53:18Z")}</strong>
            </div>
          </div>
        </div>

        {/* LOADING INDICATOR GRID OVERLAY */}
        {loading && (
          <div className="glass-emerald p-4 rounded-xl flex items-center space-x-3 text-emerald-200 font-semibold animate-pulse text-xs">
            <Activity className="h-4 w-4 text-emerald-400 animate-spin" />
            <span>Sinkronisasi data database farmasi apotik dengan server real-time...</span>
          </div>
        )}

        {/* TAB TARGET 1: DASHBOARD OUTLET */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in duration-200">
            
            {/* 1. Statistics Cards Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Stat Card: Total Obat */}
              <div className="glass p-4 rounded-xl transition hover:-translate-y-0.5 duration-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Jenis Obat</span>
                  <Pill className="h-5 w-5 text-sky-400" />
                </div>
                <p className="text-2xl font-black text-white leading-none mt-1">
                  {formatNumber(stats.totalObat)}
                </p>
                <span className="text-[10px] text-sky-300 font-semibold inline-block mt-2">
                  Terdaftar di gudang
                </span>
              </div>

              {/* Stat Card: Low Stock */}
              <div className="glass p-4 rounded-xl transition hover:-translate-y-0.5 duration-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Stok Menipis &lt; 5</span>
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-400 leading-none mt-1">
                  {formatNumber(stats.stokMenipis)}
                </p>
                <button 
                  onClick={() => handleFocusMedicine("")} 
                  className="text-[10px] text-sky-400 font-bold hover:underline cursor-pointer block mt-2 text-left"
                >
                  Segera pesan restock
                </button>
              </div>

              {/* Stat Card: Almost Expired */}
              <div className="glass p-4 rounded-xl transition hover:-translate-y-0.5 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400">Warning Exp &lt; 3 Bln</span>
                  <Calendar className="h-5 w-5 text-rose-400" />
                </div>
                <p className="text-2xl font-black text-rose-400 leading-none mt-1">
                  {formatNumber(stats.hampirExpired)}
                </p>
                <span className="text-[10px] text-slate-400 block mt-2">
                  Butuh audit pemusnahan
                </span>
              </div>

              {/* Stat Card: Total masuk */}
              <div className="glass p-4 rounded-xl transition hover:-translate-y-0.5 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Stok Masuk (Qty)</span>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white leading-none mt-1">
                  {formatNumber(stats.totalMasuk)}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-2">
                  Akumulasi inventori restock
                </span>
              </div>

              {/* Stat Card: Total Keluar */}
              <div className="glass p-4 rounded-xl transition hover:-translate-y-0.5 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Stok Keluar (Qty)</span>
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                </div>
                <p className="text-2xl font-black text-white leading-none mt-1">
                  {formatNumber(stats.totalKeluar)}
                </p>
                <span className="text-[10px] text-rose-400 font-semibold block mt-2">
                  Terpakai / Resep pasien
                </span>
              </div>

            </div>

            {/* 2. Push Notification Warning Banners (High-Contrast Alerts for Low stock & Expiring soon) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HeartPulse className="h-5 w-5 text-rose-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Pusat Alert & Pemberitahuan Real-Time
                </h3>
              </div>
              <AlertBannerList medicines={medicines} onFocusMedicine={handleFocusMedicine} />
            </div>

            {/* 3. Small Recent Activity Feed in Dashboard */}
            <div className="glass rounded-xl p-6 shadow-xl leading-relaxed">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Ulasan Log Transaksi Terbaru</h3>
                  <p className="text-xs text-slate-400">Menampilkan 3 aktivitas modifikasi stok obat terakhir</p>
                </div>
                <button
                  onClick={() => { setActiveTab("logs"); }}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                >
                  Lihat Semua Log →
                </button>
              </div>

              <div className="divide-y divide-white/5 font-sans">
                {transactions.slice(0, 3).map((tx) => {
                  const isEntry = tx.tipe === "Masuk";
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between text-xs hover:bg-white/5 rounded-lg p-2 transition">
                      <div className="flex items-center space-x-3">
                        <span className={`h-2.5 w-2.5 rounded-full inline-block ${isEntry ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <div>
                          <p className="font-bold text-slate-200">
                            {tx.namaObat} ({tx.kodeObat})
                          </p>
                          <span className="text-slate-400 block text-[10px] mt-0.5">
                            {tx.keterangan} • Petugas: {tx.petugas} • {formatDate(tx.tanggal, true)}
                          </span>
                        </div>
                      </div>
                      <span className={`font-bold py-1 px-2.5 rounded-lg text-[11px] ${isEntry ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                        {isEntry ? "+" : "-"}{tx.jumlah}
                      </span>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <p className="text-center text-slate-400 py-6">Belum ada pencatatan log transaksi.</p>
                )}
              </div>
            </div>

            {/* 4. Help block */}
            <div className="glass border-l-4 border-sky-400 p-4 rounded-xl flex items-start space-x-3 text-slate-200 text-xs">
              <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong>Pengingat Apoteker:</strong> Sesuai regulasi BPOM dan Kemenkes RI, pastikan obat golongan antibiotik (misal: Amoxicillin) disimpan pada rak kustom khusus yang kering, dan obat sirup sisa dianalisa secara berkala sebelum mendekati 1 bulan dari batas kedaluwarsa.
              </div>
            </div>

          </div>
        )}

        {/* TAB TARGET 2: ACTIVE STOCK MANAGEMENT VIEW */}
        {activeTab === "obat" && (
          <div className="space-y-4 animate-fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white">Daftar Inventaris Obat Aktif</h2>
              <p className="text-xs text-slate-400">Lakukan penambahan obat (CRUD) serta pencatatan log restock secara tak terbatas.</p>
            </div>

            <MedicineTable 
              medicines={medicines}
              currentUser={currentUser}
              onEdit={handleEditClick}
              onDelete={handleDeleteMedicine}
              onAddClick={handleAddClick}
              isLoading={loading}
              onRefresh={loadAllData}
              highlightedQuery={focusQuery}
            />
          </div>
        )}

        {/* TAB TARGET 3: TRANSACTION LOGS AUDIT TRAIL VIEW */}
        {activeTab === "logs" && (
          <div className="space-y-4 animate-fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white">Buku Jurnal & Audit Log Transaksi Obat</h2>
              <p className="text-xs text-slate-400">History perubahan stok terekam secara otomatis oleh backend sistem informasi saat terdapat restock atau penjualan obat.</p>
            </div>

            <TransactionLogs transactions={transactions} />
          </div>
        )}

        {/* TAB TARGET 4: CODE ARCHITECTURE & BOILERPLATE VIEW */}
        {activeTab === "architecture" && (
          <div className="space-y-4 animate-fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white">Dokumentasi Skema SQL & Blueprint Controller</h2>
              <p className="text-xs text-slate-400">Salin skema migrasi tabel RDBMS PostgreSQL/MySQL dan script controller Express server untuk keperluan deployment server Anda.</p>
            </div>

            <ArchitectureGuide />
          </div>
        )}

      </main>

      {/* 3. Medicine Details Form Modal Dialog (Add / Edit) */}
      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingMedicine={editingMed}
        currentUser={currentUser}
      />

      {/* 4. Footer credits bar */}
      <footer className="text-slate-400 text-xs text-center border-t border-white/5 py-6 mt-12 font-sans relative">
        <p className="font-semibold text-slate-300">Sistem Informasi Penyimpanan dan Stok Obat (SIPSO)</p>
        <p className="text-[10px] text-slate-500 mt-1">
          
        </p>
      </footer>

    </div>
  );
}
