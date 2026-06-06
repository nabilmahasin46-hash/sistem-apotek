import React, { useState } from "react";
import { Lock, User as UserIcon, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff } from "lucide-react";
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

  // Helper logins to ease testing for the user
  const handleQuickLogin = (roleUser: string, rolePass: string) => {
    setUsername(roleUser);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow Effects inside card */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative text-center">
          {/* Logo K3 / Kesehatan Gotu */}
          <div className="mx-auto select-none flex items-center justify-center mb-4">
            <div className="relative p-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <svg className="h-16 w-16 text-emerald-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 11-toothed official K3 gear-like circle */}
                <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="4.5" strokeDasharray="16 5" className="origin-center" style={{ animation: 'spin 25s linear infinite' }} />
                <circle cx="50" cy="50" r="28" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                {/* Clean medical safety green cross */}
                <path d="M50 38V62M38 50H62" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
              {/* Absolute center pulse */}
              <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping pointer-events-none -z-10" />
            </div>
          </div>

          <h2 id="login-heading" className="text-center text-xl font-black tracking-tight text-white leading-snug">
            SIPSO <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-xs align-middle ml-1 font-bold">K3 & Medis</span>
          </h2>
          <p className="mt-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sistem Informasi Penyimpanan & Stok Obat
          </p>
          <div className="h-[2px] w-12 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto mt-2.5 rounded-full" />
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition duration-150 cursor-pointer"
                  title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 focus:outline-none transition duration-150 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            >
              {loading ? "Menghubungkan..." : "Masuk ke Sistem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
