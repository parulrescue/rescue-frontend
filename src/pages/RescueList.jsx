import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRescues, getAnimals } from "../api/rescue";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, ClipboardList, ChevronLeft, ChevronRight, Search, Filter, X, Calendar } from "lucide-react";

const statusColors = {
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function RescueList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Applied filters (only sent to API on apply)
  const [appliedFilters, setAppliedFilters] = useState({});

  const { data: animalsData } = useQuery({
    queryKey: ["animals"],
    queryFn: getAnimals,
  });
  const animals = (animalsData?.data?.data || []).filter((a) => a.is_active !== false);

  const queryParams = {
    page,
    limit,
    ...appliedFilters,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["rescues", queryParams],
    queryFn: () => getRescues(queryParams),
    keepPreviousData: true,
  });

  const rescues = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const applyFilters = () => {
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (animalType) filters.animal_type = animalType;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    setAppliedFilters(filters);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setAnimalType("");
    setDateFrom("");
    setDateTo("");
    setAppliedFilters({});
    setPage(1);
  };

  const activeFilterCount = Object.keys(appliedFilters).length;

  const selectClass = "border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white";
  const inputClass = "border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">All Rescues</h2>
        <Link
          to="/rescues/new"
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
        >
          <PlusCircle size={18} /> New Rescue
        </Link>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Search by animal, provider, address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters || activeFilterCount > 0
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${selectClass} w-full`}>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Animal Type</label>
              <select value={animalType} onChange={(e) => setAnimalType(e.target.value)} className={`${selectClass} w-full`}>
                <option value="">All Animals</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} w-full pl-9`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} w-full pl-9`} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button onClick={applyFilters} className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-all">
              Apply Filters
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors">
                <X size={14} /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Active filters:</span>
          {appliedFilters.search && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Search: "{appliedFilters.search}"
              <button onClick={() => { setSearch(""); setAppliedFilters((f) => { const n = { ...f }; delete n.search; return n; }); }} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {appliedFilters.status && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Status: {appliedFilters.status.replace("_", " ")}
              <button onClick={() => { setStatus(""); setAppliedFilters((f) => { const n = { ...f }; delete n.status; return n; }); }} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {appliedFilters.animal_type && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Animal: {appliedFilters.animal_type}
              <button onClick={() => { setAnimalType(""); setAppliedFilters((f) => { const n = { ...f }; delete n.animal_type; return n; }); }} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(appliedFilters.date_from || appliedFilters.date_to) && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Date: {appliedFilters.date_from || "..."} — {appliedFilters.date_to || "..."}
              <button onClick={() => { setDateFrom(""); setDateTo(""); setAppliedFilters((f) => { const n = { ...f }; delete n.date_from; delete n.date_to; return n; }); }} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium ml-1">Clear all</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : rescues.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No rescues found</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-amber-600 hover:text-amber-700 font-medium mt-2">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Animal</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Info Provider</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">From / To</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rescues.map((r) => (
                    <tr key={r.id} onClick={() => navigate(`/rescues/${r.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                            <ClipboardList size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-900">#{r.id}</span>
                            <span className="text-sm text-slate-600 ml-1">{r.animal_type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status] || ""}`}>
                          {r.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{r.info_provider_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {r.from_address?.substring(0, 30)} → {r.to_address?.substring(0, 30)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-slate-400">
                  Page {pagination?.page} of {pagination?.total_pages} ({pagination?.total} total)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination?.has_prev}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination?.has_next}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
