import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { Lock, ArrowLeft, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0 || success) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, success]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <p className="text-red-600 mb-4 font-medium">Invalid reset link. No token provided.</p>
          <Link to="/forgot-password" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-2xl shadow-lg shadow-amber-200 mb-4 mx-auto object-cover" />
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          {!success && timeLeft > 0 && (
            <div className={`text-center mb-5 text-sm font-semibold ${timeLeft < 60 ? "text-red-600" : "text-slate-500"}`}>
              Link expires in {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          )}

          {timeLeft <= 0 && !success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <p className="text-red-600 mb-4 font-medium">This reset link has expired.</p>
              <Link to="/forgot-password" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">Request a new link</Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                <CheckCircle2 size={24} className="text-amber-600" />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl mb-5 text-sm">
                Password reset successfully!
              </div>
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold text-sm inline-flex items-center gap-1">
                <ArrowLeft size={16} /> Go to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                      placeholder="Min. 8 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                      placeholder="Confirm your password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-amber-200"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
