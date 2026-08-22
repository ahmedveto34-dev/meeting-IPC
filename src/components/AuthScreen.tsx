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
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white font-['Alexandria','Cairo',sans-serif] relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Accent Gradients & Glowing Ambient Light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900/80 border border-slate-700/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-9 z-10 space-y-6">
        
        {/* Top Center Branding */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/25 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-[22px] backdrop-blur-sm flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-10 h-10 stroke-[2.2]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.2 rounded-full text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-700/50 mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>نظام مكافحة العدوى والزيارات الميدانية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {centerSettings.centerName || "Waheed IPC"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            {centerSettings.departmentTitle || "لجنة مكافحة العدوى والجودة"}
          </p>
        </div>

        {/* PIN Entry Box */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="text-center">
            <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>أدخل الرمز السري للدخول إلى النظام</span>
            </label>

            {/* PIN Dots / Display */}
            <div
              className={`flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-950/80 border rounded-2xl transition-all shadow-inner ${
                error
                  ? "border-rose-500/80 bg-rose-950/30 ring-2 ring-rose-500/20"
                  : "border-slate-800 focus-within:border-blue-500"
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
                        ? "bg-gradient-to-tr from-blue-600 to-sky-500 text-white border border-sky-400 shadow-md shadow-blue-500/30 scale-105"
                        : "bg-slate-900/90 text-slate-600 border border-slate-800"
                    }`}
                  >
                    {isFilled ? (showPin ? char : "●") : ""}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors ml-1 cursor-pointer"
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

          {/* Touch / Click Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[290px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-13 rounded-2xl bg-slate-800/70 hover:bg-slate-700/90 active:bg-blue-600 border border-slate-700/70 hover:border-sky-500/50 text-white text-xl font-black transition-all active:scale-95 flex items-center justify-center shadow-xs cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-13 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              مسح
            </button>

            {/* 0 */}
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-13 rounded-2xl bg-slate-800/70 hover:bg-slate-700/90 active:bg-blue-600 border border-slate-700/70 hover:border-sky-500/50 text-white text-xl font-black transition-all active:scale-95 flex items-center justify-center shadow-xs cursor-pointer"
            >
              0
            </button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-sm font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="حذف رقم"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-600 text-blue-600 bg-slate-800 focus:ring-blue-500"
              />
              <span>تذكر تسجيل الدخول على هذا الجهاز</span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || pin.length === 0}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white font-black text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/30 active:scale-98 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? "جاري التحقق..." : "دخول إلى النظام"}</span>
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            الرمز السري المعتمد للنظام: <span className="font-mono font-black text-sky-400 text-sm px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 ml-1">2008</span>
          </p>
        </div>
      </div>
    </div>
  );
};
