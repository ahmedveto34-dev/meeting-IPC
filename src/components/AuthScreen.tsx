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
} from "lucide-react";
import { CenterSettings } from "../types";

interface AuthScreenProps {
  centerSettings: CenterSettings;
  onSuccessLogin: (remember: boolean) => void;
}

const CORRECT_PIN = "2008";

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
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8">
        
        {/* Top Center Branding */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <ShieldCheck className="w-9 h-9 text-blue-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-300 border border-blue-700/50 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>نظام مكافحة العدوى والزيارات الميدانية</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {centerSettings.centerName || "Waheed IPC"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {centerSettings.departmentTitle || "لجنة مكافحة العدوى والجودة"}
          </p>
        </div>

        {/* PIN Entry Box */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="text-center">
            <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>أدخل الرمز السري للدخول إلى النظام</span>
            </label>

            {/* PIN Dots / Display */}
            <div
              className={`flex items-center justify-center gap-3 py-3 px-4 bg-slate-900/80 border rounded-2xl transition-all ${
                error
                  ? "border-rose-500/80 bg-rose-950/30 ring-2 ring-rose-500/20"
                  : "border-slate-700 focus-within:border-blue-500"
              } ${shake ? "animate-bounce" : ""}`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                const char = pin[idx] || "";
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
                      isFilled
                        ? "bg-blue-600 text-white border border-blue-400 shadow-md scale-105"
                        : "bg-slate-800 text-slate-500 border border-slate-700/80"
                    }`}
                  >
                    {isFilled ? (showPin ? char : "●") : ""}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
                title={showPin ? "إخفاء الأرقام" : "إظهار الأرقام"}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-950/50 border border-rose-800/50 py-1.5 px-3 rounded-lg animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Touch / Click Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-white text-lg font-bold transition-all active:scale-95 flex items-center justify-center hover:border-blue-500/50 shadow-xs"
              >
                {num}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center justify-center"
            >
              مسح
            </button>

            {/* 0 */}
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-12 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-white text-lg font-bold transition-all active:scale-95 flex items-center justify-center hover:border-blue-500/50 shadow-xs"
            >
              0
            </button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-sm font-bold transition-all active:scale-95 flex items-center justify-center"
              title="حذف رقم"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-700/60">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-blue-600 bg-slate-700 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <span>تذكر تسجيل الدخول على هذا الجهاز</span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || pin.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? "جاري التحقق..." : "دخول إلى النظام"}</span>
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
          <p className="text-[11px] text-slate-400">
            الرمز السري المعتمد للنظام: <span className="font-mono font-bold text-blue-400 text-xs">2008</span>
          </p>
        </div>
      </div>
    </div>
  );
};
