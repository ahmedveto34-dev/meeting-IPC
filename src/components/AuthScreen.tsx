import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Building2,
  CheckCircle2,
  Delete,
  RotateCcw,
} from "lucide-react";
import { CenterSettings } from "../types";

interface AuthScreenProps {
  centerSettings: CenterSettings;
  onSuccessLogin: (remember: boolean) => void;
}

const CORRECT_PIN = "2008";

// Beautiful custom styling and rich colors for each number key
const NUMBER_KEYS_CONFIG: Record<
  string,
  {
    bg: string;
    border: string;
    shadow: string;
    hover: string;
    active: string;
    textColor: string;
  }
> = {
  "1": {
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    border: "border-rose-400/50",
    shadow: "shadow-md shadow-rose-500/30",
    hover: "hover:from-rose-400 hover:to-pink-500 hover:shadow-rose-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "2": {
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    border: "border-amber-400/50",
    shadow: "shadow-md shadow-amber-500/30",
    hover: "hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "3": {
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    border: "border-emerald-400/50",
    shadow: "shadow-md shadow-emerald-500/30",
    hover: "hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "4": {
    bg: "bg-gradient-to-br from-sky-500 to-cyan-600",
    border: "border-sky-400/50",
    shadow: "shadow-md shadow-sky-500/30",
    hover: "hover:from-sky-400 hover:to-cyan-500 hover:shadow-sky-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "5": {
    bg: "bg-gradient-to-br from-blue-600 to-indigo-600",
    border: "border-blue-400/50",
    shadow: "shadow-md shadow-blue-500/30",
    hover: "hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "6": {
    bg: "bg-gradient-to-br from-purple-500 to-violet-600",
    border: "border-purple-400/50",
    shadow: "shadow-md shadow-purple-500/30",
    hover: "hover:from-purple-400 hover:to-violet-500 hover:shadow-purple-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "7": {
    bg: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    border: "border-fuchsia-400/50",
    shadow: "shadow-md shadow-fuchsia-500/30",
    hover: "hover:from-fuchsia-400 hover:to-pink-500 hover:shadow-fuchsia-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "8": {
    bg: "bg-gradient-to-br from-teal-500 to-emerald-600",
    border: "border-teal-400/50",
    shadow: "shadow-md shadow-teal-500/30",
    hover: "hover:from-teal-400 hover:to-emerald-500 hover:shadow-teal-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "9": {
    bg: "bg-gradient-to-br from-orange-500 to-amber-600",
    border: "border-orange-400/50",
    shadow: "shadow-md shadow-orange-500/30",
    hover: "hover:from-orange-400 hover:to-amber-500 hover:shadow-orange-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
  "0": {
    bg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    border: "border-indigo-400/50",
    shadow: "shadow-md shadow-indigo-500/30",
    hover: "hover:from-indigo-400 hover:to-blue-500 hover:shadow-indigo-500/50 hover:scale-105",
    active: "active:scale-95",
    textColor: "text-white",
  },
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  centerSettings,
  onSuccessLogin,
}) => {
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    setError(null);
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPin("");
  };

  const verifyPin = (enteredPin: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (enteredPin === CORRECT_PIN) {
        setError(null);
        onSuccessLogin(rememberMe);
      } else {
        setError("الرمز السري غير صحيح! يرجى إعادة المحاولة.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin("");
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length === 0) {
      setError("يرجى إدخال الرمز السري");
      return;
    }
    verifyPin(pin);
  };

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, rememberMe]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0c192c] via-[#122543] to-[#0f213d] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-sky-500 selection:text-white font-['Alexandria','Cairo',sans-serif] relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Soft Muted Blue Accent & Ambient Light Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      {/* Main Glassmorphism Card in Soft Muted Blue */}
      <div className="relative w-full max-w-md bg-[#132544]/80 border border-sky-400/20 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-sky-950/60 p-6 sm:p-9 z-10 space-y-6">
        
        {/* Top Center Branding */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-sky-500/25 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1d36]/90 rounded-[22px] backdrop-blur-sm flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-10 h-10 stroke-[2.2]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.2 rounded-full text-xs font-bold bg-sky-900/40 text-sky-200 border border-sky-400/30 mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>نظام مكافحة العدوى والزيارات الميدانية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {centerSettings.centerName || "Waheed IPC"}
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/70 mt-1 font-medium">
            {centerSettings.departmentTitle || "لجنة مكافحة العدوى والجودة"}
          </p>
        </div>

        {/* PIN Entry Box */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="text-center">
            <label className="block text-xs font-bold text-sky-200/90 mb-3 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>أدخل الرمز السري للدخول إلى النظام</span>
            </label>

            {/* PIN Dots / Display */}
            <div
              className={`flex items-center justify-center gap-3 py-3.5 px-4 bg-[#0a162a]/90 border rounded-2xl transition-all shadow-inner ${
                error
                  ? "border-rose-500/80 bg-rose-950/40 ring-2 ring-rose-500/20"
                  : "border-sky-500/30 focus-within:border-sky-400"
              } ${shake ? "animate-bounce" : ""}`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                const char = pin[idx] || "";
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-all ${
                      isFilled
                        ? "bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 text-white border border-sky-300 shadow-lg shadow-sky-500/35 scale-105"
                        : "bg-[#10203a] text-slate-500 border border-sky-900/50"
                    }`}
                  >
                    {isFilled ? (showPin ? char : "●") : ""}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-2 rounded-xl text-sky-300 hover:text-white hover:bg-sky-800/40 transition-colors ml-1 cursor-pointer"
                title={showPin ? "إخفاء الأرقام" : "إظهار الأرقام"}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-rose-300 font-bold bg-rose-950/60 border border-rose-800/60 py-2 px-3 rounded-xl animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Touch / Click Numeric Keypad with Beautiful Distinct Vibrant Colors */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[300px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => {
              const cfg = NUMBER_KEYS_CONFIG[num];
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className={`h-13 rounded-2xl ${cfg.bg} ${cfg.textColor} ${cfg.shadow} ${cfg.hover} ${cfg.active} border ${cfg.border} text-2xl font-black transition-all flex items-center justify-center cursor-pointer select-none`}
                >
                  {num}
                </button>
              );
            })}

            {/* Clear Button (مسح) */}
            <button
              type="button"
              onClick={handleClear}
              className="h-13 rounded-2xl bg-[#0e1d35] hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-sky-800/40 hover:border-rose-500/50 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-black/20 cursor-pointer"
              title="مسح الكل"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مسح</span>
            </button>

            {/* 0 Button */}
            {(() => {
              const cfg = NUMBER_KEYS_CONFIG["0"];
              return (
                <button
                  type="button"
                  onClick={() => handleKeyPress("0")}
                  className={`h-13 rounded-2xl ${cfg.bg} ${cfg.textColor} ${cfg.shadow} ${cfg.hover} ${cfg.active} border ${cfg.border} text-2xl font-black transition-all flex items-center justify-center cursor-pointer select-none`}
                >
                  0
                </button>
              );
            })()}

            {/* Backspace Button (حذف رقم) */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-[#0e1d35] hover:bg-amber-950/50 text-slate-300 hover:text-amber-300 border border-sky-800/40 hover:border-amber-500/50 text-sm font-black transition-all active:scale-95 flex items-center justify-center shadow-md shadow-black/20 cursor-pointer"
              title="حذف آخر رقم"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-sky-900/40">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-sky-200/80 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-sky-700 text-sky-500 bg-[#0d1d36] focus:ring-sky-400"
              />
              <span>تذكر تسجيل الدخول على هذا الجهاز</span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || pin.length === 0}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-sky-600/30 active:scale-98 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? "جاري التحقق..." : "دخول إلى النظام"}</span>
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-sky-900/40 text-center">
          <p className="text-xs text-sky-200/70">
            الرمز السري المعتمد للنظام:{" "}
            <span className="font-mono font-black text-sky-300 text-sm px-2.5 py-0.5 rounded-lg bg-sky-950/80 border border-sky-700/60 ml-1 shadow-inner">
              2008
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

