import React, { useState } from "react";
import { Lock, User as UserIcon, ShieldAlert, KeyRound, ArrowRight, Eye,EyeOff } from "lucide-react";
import { User } from "../types";

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Silakan isi username dan password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.message || "Gagal masuk. Periksa kembali username dan password Anda.");
      }
    } catch (err) {
      setError("Koneksi gagal. Pastikan server backend Anda aktif.");
    } finally {
      setLoading(false);
    }
  };

  // Helper logins to ease testing for the user - DISABLED
  // const handleQuickLogin = (roleUser: string, rolePass: string) => {
  //   setUsername(roleUser);
  //   setPassword(rolePass);
  //   setError(null);
  // };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow Effects inside card */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-sky-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 id="login-heading" className="mt-6 text-center text-2xl font-extrabold tracking-tight text-white leading-tight">
            Sistem Informasi Stok Obat
          </h2>
          <p className="mt-2 text-center text-xs text-slate-400">
            Silakan masukkan hak akses apotek untuk mengelola inventaris
          </p>
        </div>

        {error && (
          <div id="login-error" className="glass-red p-4 rounded-xl flex items-start space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <span className="text-xs text-red-200 font-medium">{error}</span>
          </div>
        )}

        <form id="login-form" className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="username-input"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 block w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-white placeholder-slate-500 sm:text-sm focus:bg-white/10 transition duration-150"
                  placeholder="Masukkan username (e.g. apoteker)"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-11 block w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-white placeholder-slate-500 sm:text-sm focus:bg-white/10 transition duration-150"
                  placeholder="Kata Sandi Akun"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-300 to-violet-300 hover:from-sky-200 hover:to-violet-200 focus:outline-none transition duration-150 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Menghubungkan..." : "Masuk ke Sistem"}
            </button>
          </div>
        </form>

        {/* Demo Quick Logins Helper - DISABLED
        <div className="mt-8 pt-6 border-t border-white/10 relative">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Akses Demo Penguji (Sekali Klik):
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin("apoteker", "apoteker123")}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-white/5 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:border-sky-400/40 transition duration-150 text-left cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-bold text-white text-xs">Apoteker</span>
                <span className="text-[10px] text-slate-400">Tambah, Edit, Hapus, & Buku Jurnal</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleQuickLogin("gudang", "gudang123")}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-white/5 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition duration-150 text-left cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-bold text-white text-xs">Petugas Gudang</span>
                <span className="text-[10px] text-slate-400">Akses Restock Cepat, Edit Stok (Bukan Hapus)</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleQuickLogin("admin", "admin123")}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-white/5 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:border-violet-400/40 transition duration-150 text-left cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-bold text-white text-xs">Admin Sistem</span>
                <span className="text-[10px] text-slate-400">Akses Penuh Seluruh Database & Audit Log</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}
