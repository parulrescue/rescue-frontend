import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { getAnimals, createRescue, getToAddresses } from "../api/rescue";
import { searchUsers, lookupUsers } from "../api/user";
import { Upload, X, ChevronDown, Search, Check, Play, MapPin } from "lucide-react";

const rescueSchema = Yup.object({
  animalType: Yup.string().required("Animal type is required"),
  infoName: Yup.string().required("Info provider name is required"),
  infoNumber: Yup.string()
    .required("Info provider number is required")
    .matches(/^\d+$/, "Only digits allowed")
    .min(10, "Minimum 10 digits")
    .max(13, "Maximum 13 digits"),
  fromAddress: Yup.string().required("From address is required"),
  fromPincode: Yup.string().matches(/^\d*$/, "Only digits allowed").max(6, "Maximum 6 digits"),
  toAddress: Yup.string().required("To address is required"),
  toPincode: Yup.string().matches(/^\d*$/, "Only digits allowed").max(6, "Maximum 6 digits"),
});

/* ── Searchable Select (single-select, must pick from list) ───────── */
function AnimalSelect({ animals, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = animals.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (a) => {
    onChange(a.name);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-all ${
          open ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200"
        }`}
      >
        {value ? (
          <span className="text-slate-900 font-medium">{value}</span>
        ) : (
          <span className="text-slate-400">Select animal type...</span>
        )}
        <div className="flex items-center gap-1">
          {value && (
            <button type="button" onClick={handleClear} className="p-0.5 text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-auto">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-3 text-sm text-slate-400 text-center">No animals found</li>
            ) : (
              filtered.map((a) => (
                <li
                  key={a.id}
                  onClick={() => handleSelect(a)}
                  className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                    value === a.name ? "bg-amber-50 text-amber-700" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {a.name}
                  {value === a.name && <Check size={16} className="text-amber-600" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Input with user-lookup dropdown (for name/number) ────────────── */
function LookupInput({ value, onChange, onSelectUser, placeholder }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = async (e) => {
    const v = e.target.value;
    onChange(v);
    if (v.length >= 3) {
      try {
        const res = await lookupUsers(v);
        const data = res.data?.data || [];
        setResults(data);
        setOpen(data.length > 0);
      } catch { setResults([]); setOpen(false); }
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (user) => {
    onSelectUser(user);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        required
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-auto">
          {results.map((u) => (
            <li
              key={u.id}
              onClick={() => handleSelect(u)}
              className="px-3.5 py-2.5 hover:bg-amber-50 cursor-pointer text-sm transition-colors flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-700 font-medium flex-shrink-0">
                {u.full_name?.[0]}
              </div>
              <span className="font-medium">{u.full_name}</span>
              <span className="text-slate-400 text-xs ml-auto">{u.mobile_number}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Person Search (multi-select) ─────────────────────────────────── */
function PersonSearch({ selectedPersons, setSelectedPersons }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); setOpen(false); return; }
    try {
      const res = await searchUsers(q);
      const data = (res.data?.data || []).filter((u) => !selectedPersons.find((s) => s.id === u.id));
      setResults(data);
      setOpen(data.length > 0);
    } catch { setResults([]); setOpen(false); }
  };

  const handleSelect = (u) => {
    setSelectedPersons((prev) => [...prev, u]);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div>
      <div ref={ref} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search by name or number..."
          className="w-full pl-10 pr-3.5 border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
        />
        {open && results.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-auto">
            {results.map((u) => (
              <li key={u.id} onClick={() => handleSelect(u)} className="px-3.5 py-2.5 hover:bg-amber-50 cursor-pointer text-sm transition-colors flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-700 font-medium">{u.full_name?.[0]}</div>
                <span className="font-medium">{u.full_name}</span>
                <span className="text-slate-400 text-xs">{u.mobile_number}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedPersons.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedPersons.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-sm px-3 py-1.5 rounded-full font-medium">
              {p.full_name}
              <button type="button" onClick={() => setSelectedPersons((prev) => prev.filter((x) => x.id !== p.id))} className="text-amber-400 hover:text-red-500 ml-0.5">&times;</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */
export default function RescueCreate() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const digitsOnly = (v) => v.replace(/\D/g, "");

  const [animalType, setAnimalType] = useState("");
  const [animalDesc, setAnimalDesc] = useState("");
  const [infoName, setInfoName] = useState("");
  const [infoNumber, setInfoNumber] = useState("");
  const [infoUserId, setInfoUserId] = useState(null);
  const [fromAddress, setFromAddress] = useState("");
  const [fromPincode, setFromPincode] = useState("");
  const [fromArea, setFromArea] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [toPincode, setToPincode] = useState("");
  const [toArea, setToArea] = useState("");
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [images, setImages] = useState([]);

  const { data: animalsData } = useQuery({
    queryKey: ["animals"],
    queryFn: getAnimals,
  });
  const animals = (animalsData?.data?.data || []).filter((a) => a.is_active !== false);

  const { data: toAddressesData } = useQuery({
    queryKey: ["to-addresses"],
    queryFn: getToAddresses,
  });
  const toAddresses = toAddressesData?.data?.data || [];

  const selectToAddress = (addr) => {
    setToAddress(addr.address);
    setToPincode(addr.pincode || "");
    setToArea(addr.area || "");
  };

  const selectInfoProvider = (user) => {
    setInfoName(user.full_name);
    setInfoNumber(user.mobile_number);
    setInfoUserId(user.id);
  };

  const handleFiles = (fileList) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    const newFiles = Array.from(fileList).filter((f) => {
      if (!allowedTypes.includes(f.type)) return false;
      if (f.type.startsWith("video/") && f.size > 100 * 1024 * 1024) return false;
      if (f.type.startsWith("image/") && f.size > 5 * 1024 * 1024) return false;
      return true;
    });
    setImages((prev) => [...prev, ...newFiles].slice(0, 10));
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const handleDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

  const mutation = useMutation({
    mutationFn: createRescue,
    onSuccess: (res) => navigate(`/rescues/${res.data.data.id}`),
    onError: (err) => setError(err.response?.data?.error?.message || "Failed to create rescue"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (images.length === 0) { setError("At least 1 image or video is required"); return; }
    setError("");
    try {
      await rescueSchema.validate({ animalType, infoName, infoNumber, fromAddress, fromPincode, toAddress, toPincode }, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const errs = {};
        err.inner.forEach((e) => { errs[e.path] = e.message; });
        setFieldErrors(errs);
      }
      return;
    }

    const fd = new FormData();
    fd.append("animal_type", animalType);
    if (animalDesc) fd.append("animal_description", animalDesc);
    fd.append("info_provider_name", infoName);
    fd.append("info_provider_number", infoNumber);
    if (infoUserId) fd.append("info_provider_user_id", infoUserId);
    fd.append("from_address", fromAddress);
    if (fromPincode) fd.append("from_pincode", fromPincode);
    if (fromArea) fd.append("from_area", fromArea);
    fd.append("to_address", toAddress);
    if (toPincode) fd.append("to_pincode", toPincode);
    if (toArea) fd.append("to_area", toArea);
    if (selectedPersons.length) fd.append("rescue_person_ids", JSON.stringify(selectedPersons.map((p) => p.id)));
    images.forEach((img) => fd.append("images", img));
    mutation.mutate(fd);
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Rescue</h2>

      {error && <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        {/* Animal Type — searchable dropdown, select only */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Animal Type *</label>
          <AnimalSelect animals={animals} value={animalType} onChange={setAnimalType} />
          {fieldErrors.animalType && <p className="text-xs text-red-500 mt-1">{fieldErrors.animalType}</p>}
        </div>

        {/* Animal Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description <span className="text-slate-400 text-xs font-normal">({animalDesc.length}/1000)</span>
          </label>
          <textarea value={animalDesc} onChange={(e) => setAnimalDesc(e.target.value.slice(0, 1000))} rows={3} className={inputClass} />
        </div>

        {/* Images & Videos */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Images & Videos * <span className="text-slate-400 text-xs font-normal">(min 1, max 10 — images 5MB, videos 100MB)</span></label>
          <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 transition-colors" onClick={() => document.getElementById("file-input").click()}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
              <Upload size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Drag & drop files or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP, MP4, WebM, MOV</p>
            <input id="file-input" type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {images.map((file, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  {file.type.startsWith("video/") ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Play size={16} className="text-white/70" />
                      <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[9px] px-1 rounded">Video</span>
                    </div>
                  ) : (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rescue Persons */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rescue Persons</label>
          <PersonSearch selectedPersons={selectedPersons} setSelectedPersons={setSelectedPersons} />
        </div>

        {/* Info Provider — with searchable dropdown for quick select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Info Provider Name *</label>
            <LookupInput value={infoName} onChange={(v) => { setInfoName(v); setInfoUserId(null); }} onSelectUser={selectInfoProvider} placeholder="Type name to search..." />
            {fieldErrors.infoName && <p className="text-xs text-red-500 mt-1">{fieldErrors.infoName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Info Provider Number *</label>
            <LookupInput value={infoNumber} onChange={(v) => { setInfoNumber(digitsOnly(v)); setInfoUserId(null); }} onSelectUser={selectInfoProvider} placeholder="Type number to search..." />
            {fieldErrors.infoNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.infoNumber}</p>}
          </div>
        </div>

        {/* From Address */}
        <fieldset className="border border-slate-200 rounded-2xl p-5">
          <legend className="text-sm font-semibold text-slate-700 px-2">From Address</legend>
          <div className="space-y-3">
            <textarea value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="Full address *" rows={2} className={inputClass} />
            {fieldErrors.fromAddress && <p className="text-xs text-red-500 mt-1">{fieldErrors.fromAddress}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input value={fromPincode} onChange={(e) => setFromPincode(digitsOnly(e.target.value))} placeholder="Pincode" maxLength={6} className={inputClass} />
                {fieldErrors.fromPincode && <p className="text-xs text-red-500 mt-1">{fieldErrors.fromPincode}</p>}
              </div>
              <input value={fromArea} onChange={(e) => setFromArea(e.target.value)} placeholder="Area" className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* To Address */}
        <fieldset className="border border-slate-200 rounded-2xl p-5">
          <legend className="text-sm font-semibold text-slate-700 px-2">To Address</legend>
          <div className="space-y-3">
            {toAddresses.length > 0 && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1"><MapPin size={12} /> Quick select from saved addresses</label>
                <div className="flex flex-wrap gap-2">
                  {toAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectToAddress(addr)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${toAddress === addr.address ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"}`}
                    >
                      {addr.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <textarea value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Full address *" rows={2} className={inputClass} />
            {fieldErrors.toAddress && <p className="text-xs text-red-500 mt-1">{fieldErrors.toAddress}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input value={toPincode} onChange={(e) => setToPincode(digitsOnly(e.target.value))} placeholder="Pincode" maxLength={6} className={inputClass} />
                {fieldErrors.toPincode && <p className="text-xs text-red-500 mt-1">{fieldErrors.toPincode}</p>}
              </div>
              <input value={toArea} onChange={(e) => setToArea(e.target.value)} placeholder="Area" className={inputClass} />
            </div>
          </div>
        </fieldset>

        <button type="submit" disabled={mutation.isPending} className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-200">
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Creating...
            </span>
          ) : "Create Rescue"}
        </button>
      </form>
    </div>
  );
}
