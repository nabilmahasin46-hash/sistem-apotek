import React, { useState } from "react";
import { FolderTree, Database, Code, Check, Copy } from "lucide-react";
import { folderStructureTree, sqlMigrationSchema, controllerBoilerplate } from "../utils/helpers";

export default function ArchitectureGuide() {
  const [activeTab, setActiveTab] = useState<"folder" | "sql" | "controller">("folder");
  const [copied, setCopied] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentContent = 
    activeTab === "folder" ? folderStructureTree :
    activeTab === "sql" ? sqlMigrationSchema :
    controllerBoilerplate;

  return (
    <div id="architecture-container" className="glass rounded-2xl shadow-2xl overflow-hidden font-sans border border-white/10">
      
      {/* Intro Panel */}
      <div className="bg-gradient-to-r from-sky-950/40 to-slate-950/40 text-white p-6 md:p-8 border-b border-white/10">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
          Panduan Arsitektur & Boilerplate Kode
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
          Dokumentasi ini dirancang khusus untuk memandu implementasi sistem informasi stok obat farmasi (Apotek) menggunakan arsitektur relasional SQL dan controller Express-Node.js.
        </p>
      </div>

      {/* Docs Toolbar */}
      <div className="bg-slate-950/20 px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex space-x-2">
          
          {/* Tab 1: Tree */}
          <button
            onClick={() => setActiveTab("folder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === "folder" 
                ? "bg-white/10 text-white border border-white/10 shadow-sm" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <FolderTree className="h-4.5 w-4.5 text-sky-400" />
            <span>Struktur Folder</span>
          </button>

          {/* Tab 2: SQL */}
          <button
            onClick={() => setActiveTab("sql")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === "sql" 
                ? "bg-white/10 text-white border border-white/10 shadow-sm" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Database className="h-4.5 w-4.5 text-sky-400" />
            <span>Skema Migrasi SQL</span>
          </button>

          {/* Tab 3: Controller */}
          <button
            onClick={() => setActiveTab("controller")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === "controller" 
                ? "bg-white/10 text-white border border-white/10 shadow-sm" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Code className="h-4.5 w-4.5 text-sky-400" />
            <span>Controller Stok Obat</span>
          </button>

        </div>

        {/* Copy Button */}
        <button
          onClick={() => handleCopy(currentContent)}
          className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer shadow-lg shadow-sky-500/10"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-slate-950" />
              <span>Salin Berhasil</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-950" />
              <span>Salin Boilerplate</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Viewer */}
      <div className="p-4 bg-slate-950/40 text-slate-105 overflow-x-auto min-h-[400px]">
        
        {/* Helper Context Banner */}
        {activeTab === "folder" && (
          <div className="mb-4 bg-white/5 border-l-4 border-sky-400 p-3.5 rounded-xl text-xs text-slate-300 font-medium">
            <span className="font-extrabold text-sky-400">Deskripsi Arsitektur:</span> Proyek ini mengimplementasikan pemisahan layer yang bersih (Separation of Concerns). Client React bertindak sebagai visual Presentation view, sedangkan Express Node.js mengontrol penyimpanan data (Data-access, Validation, dan Action logs) pada database, mencegah inkonsistensi stok obat.
          </div>
        )}

        {activeTab === "sql" && (
          <div className="mb-4 bg-white/5 border-l-4 border-emerald-450 p-3.5 rounded-xl text-xs text-slate-300 font-medium">
            <span className="font-extrabold text-emerald-400">Hubungan Relasional (Foreign Key):</span> Skema ini mendukung integrasi referensi langsung di mana setiap penghapusan record obat pada tabel <code>obat</code> secara otomatis akan menghapus history logs yang berkorelasi lewat klausul <code>ON DELETE CASCADE</code>, mencegah penimbunan data yatim piatu.
          </div>
        )}

        {activeTab === "controller" && (
          <div className="mb-4 bg-white/5 border-l-4 border-amber-450 p-3.5 rounded-xl text-xs text-slate-300 font-medium">
            <span className="font-extrabold text-amber-400">Keamanan Transaksi SQL (ACID Rollbacks):</span> Kode controller ini dipersenjatai dengan database transaction pool. Jika penulisan histori log transaksi gagal, operasi modifikasi stok obat utama akan otomatis dibatalkan secara keseluruhan (rollback) demi menjamin data stok selalu akurat.
          </div>
        )}

        <pre className="font-mono text-xs leading-relaxed text-emerald-300 p-2 select-all focus:outline-none">
          <code>{currentContent}</code>
        </pre>
      </div>
    </div>
  );
}
