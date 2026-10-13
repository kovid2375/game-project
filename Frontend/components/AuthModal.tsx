"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  KeyRound,
  Shield,
  ArrowLeft,
  Key,
} from "lucide-react";
import { useRegister } from "@/lib/hooks/useRegister";
import { useVerifyEmail } from "@/lib/hooks/useVerifyEmail";
import { useLogin } from "@/lib/hooks/useLogin";
import { useOtpLogin } from "@/lib/hooks/useOtpLogin";
import { usePasswordReset } from "@/lib/hooks/usePasswordReset";

export type AuthModalMode =
  | "register"
  | "verify-registration"
  | "login-password"
  | "login-otp-request"
  | "login-otp-verify"
  | "password-reset-request"
  | "password-reset-confirm";

interface AuthModalProps {
  isOpen: boolean;
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  mode: initialMode,
  onClose,
  onSwitchMode,
  onSuccess,
}: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<AuthModalMode>(
    initialMode === "login" ? "login-password" : "register"
  );
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Sync mode with prop changes when opened
  useEffect(() => {
    if (initialMode === "login") {
      setCurrentMode("login-password");
    } else {
      setCurrentMode("register");
    }
  }, [initialMode, isOpen]);

  const triggerSuccess = (title: string, description: string) => {
    setToastMessage({ title, description });
    setTimeout(() => {
      setToastMessage(null);
      handleResetAll();
      onSuccess();
      onClose();
    }, 1800);
  };

  // 1. Password Login Hook
  const loginHook = useLogin((data) => {
    triggerSuccess("Welcome Detective", "Credentials verified. Accessing HQ...");
  });

  // 2. OTP Login Hook
  const otpLoginHook = useOtpLogin((data) => {
    triggerSuccess("Logged In", "OTP verified successfully. Accessing HQ...");
  });

  // 3. Register Hook
  const registerHook = useRegister((data) => {
    const emailToVerify = registerHook.formData.email.trim();
    setRegisteredEmail(emailToVerify);
    setCurrentMode("verify-registration");
  });

  // 4. Registration Email Verification Hook
  const verifyEmailHook = useVerifyEmail(registeredEmail, () => {
    triggerSuccess("Verified", "Detective identity confirmed. Redirecting...");
  });

  // 5. Password Reset Hook
  const passwordResetHook = usePasswordReset(() => {
    setToastMessage({
      title: "Password Reset Complete",
      description: "Password updated successfully. Please log in.",
    });
    setTimeout(() => {
      setToastMessage(null);
      handleResetAll();
      setCurrentMode("login-password");
    }, 2000);
  });

  if (!isOpen) return null;

  const handleResetAll = () => {
    registerHook.reset();
    verifyEmailHook.reset();
    loginHook.reset();
    otpLoginHook.reset();
    passwordResetHook.reset();
    setRegisteredEmail("");
  };

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  const switchToLoginPassword = () => {
    loginHook.setError(null);
    setCurrentMode("login-password");
  };

  const switchToLoginOtp = () => {
    otpLoginHook.setError(null);
    otpLoginHook.setStep("request");
    setCurrentMode("login-otp-request");
  };

  const switchToRegister = () => {
    handleResetAll();
    setCurrentMode("register");
    onSwitchMode("register");
  };

  const switchToPasswordReset = () => {
    handleResetAll();
    // Pre-fill email if entered in login form
    if (loginHook.email) {
      passwordResetHook.setEmail(loginHook.email);
    }
    setCurrentMode("password-reset-request");
  };

  return (
    <>
      {/* Toast Notification for Success actions */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-[#0d121b] border border-emerald-500/70 text-emerald-200 px-5 py-3.5 rounded-xl shadow-[0_10px_35px_rgba(16,185,129,0.35)] animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{toastMessage.title}</h4>
            <p className="text-xs text-emerald-300/80">{toastMessage.description}</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
        {/* Main Card */}
        <div className="relative w-full max-w-[390px] my-auto bg-[#090b0e] border border-zinc-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden text-zinc-100">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white transition-colors backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Detective Background Image Banner with Brand */}
          <div className="relative w-full h-44 sm:h-48 overflow-hidden">
            <Image
              src="/hero-bg.jpg"
              alt="Detective case file board"
              fill
              priority
              className="object-cover object-[center_28%] brightness-90 contrast-125"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#090b0e]" />

            {/* CASEFILE Logo */}
            <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center text-center z-10 px-4">
              <div className="flex items-baseline font-takeashot tracking-wider text-4xl sm:text-[44px] leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                  CASE
                </span>
                <span className="text-[#e50914] drop-shadow-[0_0_15px_rgba(229,9,20,0.6)]">
                  FILE
                </span>
              </div>
              <p className="font-sans font-bold text-[9px] sm:text-[10px] tracking-[0.22em] text-zinc-300 uppercase mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                REAL CASES. SHARP MINDS.
              </p>
            </div>
          </div>

          {/* Modal Form Body */}
          <div className="px-5 sm:px-6 pt-3 pb-6">

            {/* ========================================================================= */}
            {/* 1. PASSWORD LOGIN VIEW */}
            {/* ========================================================================= */}
            {currentMode === "login-password" && (
              <div>
                <p className="text-center text-xs sm:text-[13px] font-medium text-zinc-300 mb-4">
                  Solve. Analyse. Uncover the truth.
                </p>

                {/* Sub-tab navigation */}
                <div className="flex items-center bg-[#13171e] rounded-xl p-1 mb-4 border border-zinc-800">
                  <button
                    type="button"
                    onClick={switchToLoginPassword}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#1a202c] text-white shadow-sm border-b-2 border-[#e50914] transition-all"
                  >
                    Password Login
                  </button>
                  <button
                    type="button"
                    onClick={switchToLoginOtp}
                    className="flex-1 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
                  >
                    Login with OTP
                  </button>
                </div>

                {loginHook.error && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{loginHook.error}</span>
                  </div>
                )}

                <form onSubmit={loginHook.submit} className="space-y-3">
                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <input
                      type="email"
                      required
                      value={loginHook.email}
                      onChange={(e) => loginHook.setEmail(e.target.value)}
                      placeholder="detective@example.com"
                      disabled={loginHook.isLoading}
                      className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Lock className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <input
                      type={loginHook.showPassword ? "text" : "password"}
                      required
                      value={loginHook.password}
                      onChange={(e) => loginHook.setPassword(e.target.value)}
                      placeholder="Password"
                      disabled={loginHook.isLoading}
                      className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => loginHook.setShowPassword(!loginHook.showPassword)}
                      className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none transition-colors"
                    >
                      {loginHook.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={loginHook.rememberMe}
                          onChange={(e) => loginHook.setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                            loginHook.rememberMe
                              ? "bg-[#e50914] border-[#e50914]"
                              : "bg-[#13171e] border-zinc-700 hover:border-zinc-500"
                          }`}
                        >
                          {loginHook.rememberMe && (
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                      <span className="text-zinc-400 text-[11px] sm:text-xs">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={switchToPasswordReset}
                      className="text-[#e50914] hover:underline text-[11px] sm:text-xs font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginHook.isLoading}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {loginHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-[#090b0e] px-2 text-zinc-500">OR CONTINUE WITH</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={switchToLoginOtp}
                  className="w-full py-2.5 text-xs font-medium text-zinc-300 bg-[#13171e] hover:bg-[#1a202c] border border-zinc-800 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Login with OTP</span>
                </button>

                <div className="mt-4 text-center text-xs text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-[#e50914] hover:text-red-400 font-medium ml-1 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. OTP LOGIN REQUEST VIEW */}
            {/* ========================================================================= */}
            {currentMode === "login-otp-request" && (
              <div>
                <div className="text-center mb-5">
                  <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                    Login with a verification code
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    We&apos;ll send a 6-digit code to your email.
                  </p>
                </div>

                {otpLoginHook.error && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{otpLoginHook.error}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    await otpLoginHook.requestOtp(e);
                    if (!otpLoginHook.error) {
                      setCurrentMode("login-otp-verify");
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <input
                      type="email"
                      required
                      value={otpLoginHook.email}
                      onChange={(e) => otpLoginHook.setEmail(e.target.value)}
                      placeholder="detective@example.com"
                      disabled={otpLoginHook.isLoading}
                      className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoginHook.isLoading}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {otpLoginHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-[#090b0e] px-2 text-zinc-500">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={switchToLoginPassword}
                  className="w-full py-2.5 text-xs font-medium text-zinc-300 bg-[#13171e] hover:bg-[#1a202c] border border-zinc-800 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Login with Password</span>
                </button>

                <div className="mt-4 text-center text-xs text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-[#e50914] hover:text-red-400 font-medium ml-1 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. OTP LOGIN VERIFICATION VIEW */}
            {/* ========================================================================= */}
            {currentMode === "login-otp-verify" && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                    Enter verification code
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    We&apos;ve sent a 6-digit code to
                  </p>
                  <p className="text-xs font-mono font-medium text-zinc-200 mt-0.5 truncate max-w-[280px] mx-auto">
                    {otpLoginHook.email}
                  </p>
                </div>

                {otpLoginHook.error && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{otpLoginHook.error}</span>
                  </div>
                )}

                <form onSubmit={otpLoginHook.verifyOtp} className="space-y-4">
                  <div className="flex justify-between gap-1.5 sm:gap-2 my-2">
                    {otpLoginHook.digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpLoginHook.inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => otpLoginHook.handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => otpLoginHook.handleKeyDown(index, e)}
                        disabled={otpLoginHook.isLoading}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border bg-[#13171e] text-white transition-all focus:outline-none ${
                          digit
                            ? "border-red-500 shadow-[0_0_12px_rgba(229,9,20,0.35)]"
                            : "border-zinc-800 focus:border-zinc-500"
                        }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-zinc-400">
                      Didn&apos;t receive the code?{" "}
                      {otpLoginHook.canResend ? (
                        <button
                          type="button"
                          onClick={otpLoginHook.resendOtp}
                          disabled={otpLoginHook.isLoading}
                          className="text-[#e50914] hover:underline font-semibold"
                        >
                          Resend Code
                        </button>
                      ) : (
                        <span className="text-[#e50914] font-mono">
                          Resend in 00:{otpLoginHook.countdown.toString().padStart(2, "0")}
                        </span>
                      )}
                    </p>

                    <div>
                      <button
                        type="button"
                        onClick={() => setCurrentMode("login-otp-request")}
                        className="inline-flex items-center gap-1 text-xs text-[#e50914] hover:text-red-400 font-medium transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Change email</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoginHook.isLoading || otpLoginHook.code.length !== 6}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {otpLoginHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Log In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-[#090b0e] px-2 text-zinc-500">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={switchToLoginPassword}
                  className="w-full py-2.5 text-xs font-medium text-zinc-300 bg-[#13171e] hover:bg-[#1a202c] border border-zinc-800 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Login with Password</span>
                </button>

                <div className="mt-4 text-center text-xs text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-[#e50914] hover:text-red-400 font-medium ml-1 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. PASSWORD RESET REQUEST VIEW */}
            {/* ========================================================================= */}
            {currentMode === "password-reset-request" && (
              <div>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-950/60 border border-red-800/60 text-[#e50914] mb-2">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                    Reset Investigator Passkey
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter your bureau email to receive a recovery code.
                  </p>
                </div>

                {passwordResetHook.error && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{passwordResetHook.error}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    await passwordResetHook.requestResetCode(e);
                    if (!passwordResetHook.error) {
                      setCurrentMode("password-reset-confirm");
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <input
                      type="email"
                      required
                      value={passwordResetHook.email}
                      onChange={(e) => passwordResetHook.setEmail(e.target.value)}
                      placeholder="detective@example.com"
                      disabled={passwordResetHook.isLoading}
                      className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordResetHook.isLoading}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {passwordResetHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Recovery Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-zinc-400">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={switchToLoginPassword}
                    className="text-[#e50914] hover:text-red-400 font-medium ml-1 transition-colors"
                  >
                    Back to Log in
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. PASSWORD RESET CONFIRM VIEW */}
            {/* ========================================================================= */}
            {currentMode === "password-reset-confirm" && (
              <div>
                <div className="text-center mb-3">
                  <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                    Enter Recovery Code &amp; New Passkey
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Code dispatched to:
                  </p>
                  <p className="text-xs font-mono font-medium text-red-400 mt-0.5 truncate max-w-[280px] mx-auto">
                    {passwordResetHook.email}
                  </p>
                </div>

                {passwordResetHook.error && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{passwordResetHook.error}</span>
                  </div>
                )}

                <form onSubmit={passwordResetHook.confirmReset} className="space-y-2.5">
                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-between gap-1.5 sm:gap-2 my-2">
                    {passwordResetHook.digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          passwordResetHook.inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => passwordResetHook.handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => passwordResetHook.handleKeyDown(index, e)}
                        disabled={passwordResetHook.isLoading}
                        className={`w-11 h-12 sm:w-12 sm:h-13 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border bg-[#13171e] text-white transition-all focus:outline-none ${
                          digit
                            ? "border-red-500 shadow-[0_0_12px_rgba(229,9,20,0.35)]"
                            : "border-zinc-800 focus:border-zinc-500"
                        }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {/* Resend Code / Change Email */}
                  <div className="flex items-center justify-between text-xs px-1 text-zinc-400 pb-1">
                    <button
                      type="button"
                      onClick={() => setCurrentMode("password-reset-request")}
                      className="inline-flex items-center gap-1 text-[#e50914] hover:text-red-400 transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Change email</span>
                    </button>

                    {passwordResetHook.canResend ? (
                      <button
                        type="button"
                        onClick={passwordResetHook.resendResetCode}
                        disabled={passwordResetHook.isLoading}
                        className="text-[#e50914] hover:underline font-semibold"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <span className="font-mono text-[11px] text-[#e50914]">
                        Resend in 00:{passwordResetHook.countdown.toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Lock className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <input
                      type={passwordResetHook.showPassword ? "text" : "password"}
                      required
                      value={passwordResetHook.newPassword}
                      onChange={(e) => passwordResetHook.setNewPassword(e.target.value)}
                      placeholder="New password (min 12 chars)"
                      disabled={passwordResetHook.isLoading}
                      className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => passwordResetHook.setShowPassword(!passwordResetHook.showPassword)}
                      className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none transition-colors"
                    >
                      {passwordResetHook.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Lock className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <input
                      type={passwordResetHook.showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordResetHook.confirmPassword}
                      onChange={(e) => passwordResetHook.setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={passwordResetHook.isLoading}
                      className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => passwordResetHook.setShowConfirmPassword(!passwordResetHook.showConfirmPassword)}
                      className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none transition-colors"
                    >
                      {passwordResetHook.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={passwordResetHook.isLoading || passwordResetHook.code.length !== 6}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-3 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {passwordResetHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Passkey...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password &amp; Log In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-3 text-center text-xs text-zinc-400">
                  <button
                    type="button"
                    onClick={switchToLoginPassword}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel and return to Login
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. REGISTRATION VIEW */}
            {/* ========================================================================= */}
            {currentMode === "register" && (
              <div>
                <div className="text-center mb-5">
                  <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                    Create your investigator profile
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Join CASEFILE and start solving real cases.
                  </p>
                </div>

                {registerHook.error && (
                  <div className="mb-3.5 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{registerHook.error}</span>
                  </div>
                )}

                <form onSubmit={registerHook.submit} className="space-y-2.5">
                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <User className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] text-zinc-400 leading-tight">
                        Your name
                      </span>
                      <input
                        type="text"
                        required
                        value={registerHook.formData.name}
                        onChange={(e) => registerHook.updateField("name", e.target.value)}
                        placeholder="Alex Carter"
                        disabled={registerHook.isLoading}
                        className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] text-zinc-400 leading-tight">
                        Email address
                      </span>
                      <input
                        type="email"
                        required
                        value={registerHook.formData.email}
                        onChange={(e) => registerHook.updateField("email", e.target.value)}
                        placeholder="detective@example.com"
                        disabled={registerHook.isLoading}
                        className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Lock className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] text-zinc-400 leading-tight">
                        Password
                      </span>
                      <input
                        type={registerHook.showPassword ? "text" : "password"}
                        required
                        value={registerHook.formData.password}
                        onChange={(e) => registerHook.updateField("password", e.target.value)}
                        placeholder="••••••••••••"
                        disabled={registerHook.isLoading}
                        className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none tracking-wider"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => registerHook.setShowPassword(!registerHook.showPassword)}
                      className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none transition-colors"
                    >
                      {registerHook.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative flex items-center bg-[#13171e] border border-zinc-800/90 focus-within:border-zinc-600 rounded-xl px-3.5 py-2 transition-all">
                    <Lock className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] text-zinc-400 leading-tight">
                        Confirm password
                      </span>
                      <input
                        type={registerHook.showConfirmPassword ? "text" : "password"}
                        required
                        value={registerHook.formData.confirmPassword}
                        onChange={(e) => registerHook.updateField("confirmPassword", e.target.value)}
                        placeholder="••••••••••••"
                        disabled={registerHook.isLoading}
                        className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none tracking-wider"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => registerHook.setShowConfirmPassword(!registerHook.showConfirmPassword)}
                      className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none transition-colors"
                    >
                      {registerHook.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="pt-1.5 pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={registerHook.formData.agreeToTerms}
                          onChange={(e) => registerHook.updateField("agreeToTerms", e.target.checked)}
                          disabled={registerHook.isLoading}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                            registerHook.formData.agreeToTerms
                              ? "bg-[#e50914] border-[#e50914]"
                              : "bg-[#13171e] border-zinc-700 group-hover:border-zinc-500"
                          }`}
                        >
                          {registerHook.formData.agreeToTerms && (
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] sm:text-xs text-zinc-400 leading-tight">
                        I agree to the{" "}
                        <span className="text-[#e50914] hover:underline cursor-pointer">
                          Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="text-[#e50914] hover:underline cursor-pointer">
                          Privacy Policy
                        </span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={registerHook.isLoading}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-3.5 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {registerHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-zinc-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={switchToLoginPassword}
                    className="text-[#e50914] hover:text-red-400 font-medium ml-1 transition-colors"
                  >
                    Log in
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. REGISTRATION VERIFY VIEW */}
            {/* ========================================================================= */}
            {currentMode === "verify-registration" && (
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-950/60 border border-red-800/60 text-[#e50914] mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                    Verify Detective Credentials
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter the 6-digit code dispatched to:
                  </p>
                  <p className="text-xs font-mono font-medium text-red-400 mt-0.5 truncate max-w-[280px] mx-auto">
                    {registeredEmail}
                  </p>
                </div>

                {verifyEmailHook.error && (
                  <div className="mb-3.5 flex items-start gap-2 rounded-lg bg-red-950/70 border border-red-800/70 px-3 py-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-tight">{verifyEmailHook.error}</span>
                  </div>
                )}

                <form onSubmit={verifyEmailHook.submit} className="space-y-4">
                  <div className="flex justify-between gap-1.5 sm:gap-2 my-2">
                    {verifyEmailHook.digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          verifyEmailHook.inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => verifyEmailHook.handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => verifyEmailHook.handleKeyDown(index, e)}
                        disabled={verifyEmailHook.isLoading}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border bg-[#13171e] text-white transition-all focus:outline-none ${
                          digit
                            ? "border-red-500 shadow-[0_0_12px_rgba(229,9,20,0.35)]"
                            : "border-zinc-800 focus:border-zinc-500"
                        }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={verifyEmailHook.isLoading || verifyEmailHook.code.length !== 6}
                    className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#e50914] hover:bg-[#d00812] active:bg-[#b80710] rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-red-950/40 disabled:opacity-50"
                  >
                    {verifyEmailHook.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Enter HQ</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-zinc-400">
                  Didn&apos;t get the code?{" "}
                  <button
                    type="button"
                    onClick={() => setCurrentMode("register")}
                    className="text-[#e50914] hover:text-red-400 font-medium ml-1 transition-colors"
                  >
                    Re-enter email
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
