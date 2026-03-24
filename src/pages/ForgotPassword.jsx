import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-2xl shadow-lg shadow-amber-200 mb-4 mx-auto object-cover" />
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
          <p className="text-slate-500 mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                <CheckCircle2 size={24} className="text-amber-600" />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl mb-5 text-sm">
                If an account exists with that email, a reset link has been sent. The link expires in 5 minutes.
              </div>
              <Link to="/login" className="text-amber-600 hover:text-amber-700 text-sm font-semibold">
                <span className="inline-flex items-center gap-1"><ArrowLeft size={16} /> Back to Login</span>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-amber-200"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-5 text-center">
                <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
