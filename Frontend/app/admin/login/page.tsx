"use client";

import { useRouter } from "next/navigation";
import { useAdminLogin } from "@/lib/hooks/useAdminLogin";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    submit,
  } = useAdminLogin(() => {
    router.push("/admin");
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Shield size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-neutral-900">
            CASEFILE
          </span>
          <span className="text-xs uppercase font-bold text-red-600 tracking-widest">
            Admin Management Console
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-neutral-900 mb-1">Admin Sign In</h1>
            <p className="text-xs text-neutral-500">
              Enter your credentials to access the administrative control center
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@casefile.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3 shadow-md shadow-red-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying Credentials…
                </>
              ) : (
                "Authenticate & Enter"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6 font-mono">
          Strictly for authorized Casefile administrators
        </p>
      </div>
    </div>
  );
}
