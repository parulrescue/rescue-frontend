import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSessions, revokeSession } from "../api/auth";
import { Monitor, Clock, Wifi, X } from "lucide-react";

export default function Sessions() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
  });

  const sessions = data?.data?.data || [];

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Sessions</h2>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-50">
        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Monitor size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No active sessions</p>
          </div>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="px-6 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Monitor size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {s.device_info || "Unknown device"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Wifi size={12} /> {s.ip_address || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} /> Expires: {new Date(s.expires_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => revokeMutation.mutate(s.id)}
                disabled={revokeMutation.isPending}
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} /> Revoke
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
