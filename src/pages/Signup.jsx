import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as Yup from "yup";
import { signupRequestOtp, signupResendOtp, signupVerifyOtp } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { User, Mail, Lock, Eye, EyeOff, Phone, AtSign, KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";

const signupSchema = Yup.object({
  full_name: Yup.string().required("Full name is required").max(150),
  username: Yup.string()
    .required("Username is required")
    .matches(/^[a-z_]+$/, "Only lowercase letters & underscore allowed")
    .min(4, "Minimum 4 characters")
    .max(20, "Maximum 20 characters"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile_number: Yup.string()
    .required("Mobile number is required")
    .matches(/^\d+$/, "Only digits allowed")
    .min(10, "Minimum 10 digits")
    .max(13, "Maximum 13 digits"),
  password: Yup.string().required("Password is required").min(6, "Minimum 6 characters"),
});

const inputBase = "w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm";

export default function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState("details");
  const [form, setForm] = useState({ full_name: "", username: "", email: "", mobile_number: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(0);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState("");
  const inputsRef = useRef([]);

  const digitsOnly = (v) => v.replace(/\D/g, "");
  const usernameOnly = (v) => v.replace(/[^a-z_]/g, "");

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const startCooldown = () => setResendIn(60);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      await signupSchema.validate(form, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const errs = {};
        err.inner.forEach((x) => { errs[x.path] = x.message; });
        setFieldErrors(errs);
      }
      return;
    }
    setLoading(true);
    try {
      await signupRequestOtp(form);
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setInfo("We sent a 6-digit code to " + form.email);
      startCooldown();
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, value) => {
    const d = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const res = await signupVerifyOtp({ email: form.email, otp: code });
      const { user, token } = res.data.data;
      setAuth(user, token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || resending) return;
    setError("");
    setInfo("");
    setResending(true);
    try {
      await signupResendOtp({ email: form.email });
      setInfo("A new code has been sent to " + form.email);
      setOtp(["", "", "", "", "", ""]);
      startCooldown();
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-2xl shadow-lg shadow-amber-200 mb-4 mx-auto object-cover" />
          <h1 className="text-2xl font-bold text-slate-900">
            {step === "details" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-slate-500 mt-1">
            {step === "details" ? "Sign up to get started" : "Enter the 6-digit code we sent you"}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
          )}
          {info && step === "otp" && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm">{info}</div>
          )}

          {step === "details" ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputBase} placeholder="e.g. John Doe" />
                </div>
                {fieldErrors.full_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.full_name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: usernameOnly(e.target.value) })} maxLength={20} className={inputBase} placeholder="e.g. john_doe" />
                </div>
                {fieldErrors.username && <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputBase} placeholder="you@example.com" />
                </div>
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={form.mobile_number} onChange={(e) => setForm({ ...form, mobile_number: digitsOnly(e.target.value) })} maxLength={13} className={inputBase} placeholder="9876543210" />
                </div>
                {fieldErrors.mobile_number && <p className="text-xs text-red-500 mt-1">{fieldErrors.mobile_number}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputBase + " pr-10"} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-amber-200">
                {loading ? "Sending code..." : "Continue"}
              </button>

              <div className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Sign In</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100">
                  <ShieldCheck size={28} className="text-amber-600" />
                </div>
              </div>

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-amber-200">
                <span className="inline-flex items-center justify-center gap-2">
                  <KeyRound size={16} />
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </span>
              </button>

              <div className="text-center text-sm">
                <span className="text-slate-500">Didn't get the code? </span>
                {resendIn > 0 ? (
                  <span className="text-slate-400">Resend in {resendIn}s</span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resending} className="text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50">
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                )}
              </div>

              <div className="text-center">
                <button type="button" onClick={() => { setStep("details"); setError(""); setInfo(""); }} className="text-sm text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={16} /> Edit details
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
