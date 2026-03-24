import { useState } from "react";
import * as Yup from "yup";
import { useAuthStore } from "../store/authStore";
import { updateProfile, uploadAvatar } from "../api/user";
import { changePassword } from "../api/auth";
import { Camera, User, Lock, Eye, EyeOff } from "lucide-react";

const profileSchema = Yup.object({
  full_name: Yup.string().required("Full name is required").max(150),
  mobile_number: Yup.string()
    .required("Mobile number is required")
    .matches(/^\d+$/, "Only digits allowed")
    .min(10, "Minimum 10 digits")
    .max(13, "Maximum 13 digits"),
});

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [tab, setTab] = useState("profile");

  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [mobile, setMobile] = useState(user?.mobile_number || "");
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const digitsOnly = (v) => v.replace(/\D/g, "");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setFieldErrors({});
    try {
      await profileSchema.validate({ full_name: fullName, mobile_number: mobile }, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const errs = {};
        err.inner.forEach((e) => { errs[e.path] = e.message; });
        setFieldErrors(errs);
      }
      return;
    }
    setProfileLoading(true);
    try {
      const res = await updateProfile({ full_name: fullName, mobile_number: mobile });
      updateUser(res.data?.data || { full_name: fullName, mobile_number: mobile });
      setProfileMsg({ type: "success", text: "Profile updated" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.error?.message || "Update failed" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileMsg({ type: "error", text: "Only JPEG, PNG, WebP allowed" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Max 5MB" });
      return;
    }
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await uploadAvatar(fd);
      updateUser({ profile_pic: res.data?.data?.profile_pic });
      setProfileMsg({ type: "success", text: "Avatar updated" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.error?.message || "Upload failed" });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
      setPwMsg({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.error?.message || "Change failed" });
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h2>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {tab === "profile" && (
            <>
              {profileMsg.text && (
                <div className={`mb-5 p-3.5 rounded-xl text-sm ${profileMsg.type === "success" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {profileMsg.text}
                </div>
              )}

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-amber-100 overflow-hidden flex items-center justify-center text-amber-700 text-2xl font-bold border-2 border-white shadow-sm relative">
                  {user?.profile_pic ? (
                    <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 cursor-pointer font-medium">
                  <Camera size={16} />
                  Change avatar
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                  {fieldErrors.full_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.full_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(digitsOnly(e.target.value))}
                    maxLength={13}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                  {fieldErrors.mobile_number && <p className="text-xs text-red-500 mt-1">{fieldErrors.mobile_number}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input type="email" value={user?.email || ""} disabled className="w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Username</label>
                  <input type="text" value={user?.username || ""} disabled className="w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500" />
                </div>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-200"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </>
          )}

          {tab === "password" && (
            <>
              {pwMsg.text && (
                <div className={`mb-5 p-3.5 rounded-xl text-sm ${pwMsg.type === "success" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-200"
                >
                  {pwLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
