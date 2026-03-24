import { useState, useRef, useEffect } from "react";

export default function SearchSelect({ options, value, onChange, onSearch, placeholder, renderOption, displayValue }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    onSearch?.(e.target.value);
  };

  const handleSelect = (option) => {
    onChange(option);
    setQuery(displayValue ? displayValue(option) : option.name || option.label || "");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
      />
      {open && options.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((opt, i) => (
            <li
              key={opt.id || i}
              onClick={() => handleSelect(opt)}
              className="px-3.5 py-2.5 hover:bg-amber-50 cursor-pointer text-sm transition-colors"
            >
              {renderOption ? renderOption(opt) : opt.name || opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
