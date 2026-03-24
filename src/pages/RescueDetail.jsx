import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRescue } from "../api/rescue";
import { ArrowLeft, MapPin, User, Image, Video, Users, Clock, Play } from "lucide-react";

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function RescueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["rescue", id],
    queryFn: () => getRescue(id),
  });

  const rawRescue = data?.data?.data;

  // Normalize images: Sequelize raw+nest can return a single object instead of array
  const rescue = rawRescue ? {
    ...rawRescue,
    images: Array.isArray(rawRescue.images) ? rawRescue.images : rawRescue.images?.id ? [rawRescue.images] : [],
    persons: Array.isArray(rawRescue.persons) ? rawRescue.persons : rawRescue.persons?.id ? [rawRescue.persons] : [],
  } : null;

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load rescue</div>;
  if (!rescue) return <div className="text-center py-12 text-slate-500">Rescue not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1.5">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Rescue #{rescue.id}</h1>
          <span className={`text-sm px-3.5 py-1.5 rounded-full font-medium border ${statusColors[rescue.status] || ""}`}>
            {rescue.status?.replace("_", " ")}
          </span>
        </div>

        {/* Animal Info */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Animal</h2>
          <p className="text-slate-900 font-semibold text-lg">{rescue.animal_type}</p>
          {rescue.animal_description && <p className="text-sm text-slate-600 mt-1">{rescue.animal_description}</p>}
        </section>

        {/* Images */}
        {rescue.images?.filter((m) => m.media_type !== "video").length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Image size={14} /> Images
            </h2>
            <div className="flex flex-wrap gap-3">
              {rescue.images.filter((m) => m.media_type !== "video").map((img, i) => (
                <a key={i} href={img.image_url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {rescue.images?.filter((m) => m.media_type === "video").length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Video size={14} /> Videos
            </h2>
            <div className="flex flex-wrap gap-4">
              {rescue.images.filter((m) => m.media_type === "video").map((vid, i) => (
                <div key={i} className="relative w-48 rounded-xl overflow-hidden border border-slate-200 bg-black">
                  <video src={vid.image_url} controls className="w-full h-36 object-contain" preload="metadata" />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Play size={10} /> Video
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Info Provider */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User size={14} /> Info Provider
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-500 text-xs">Name</span>
              <p className="text-slate-900 font-medium mt-0.5">{rescue.info_provider_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-500 text-xs">Number</span>
              <p className="text-slate-900 font-medium mt-0.5">{rescue.info_provider_number}</p>
            </div>
          </div>
        </section>

        {/* Rescue Persons */}
        {rescue.persons?.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={14} /> Rescue Persons
            </h2>
            <div className="flex flex-wrap gap-2">
              {rescue.persons.map((p) => (
                <span key={p.id || p.user_id} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  {p.user?.full_name || p.full_name || `User #${p.user_id}`}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} /> From Address
            </h2>
            <p className="text-sm text-slate-900 font-medium">{rescue.from_address}</p>
            {rescue.from_pincode && <p className="text-xs text-slate-500 mt-1.5">Pincode: {rescue.from_pincode}</p>}
            {rescue.from_area && <p className="text-xs text-slate-500">Area: {rescue.from_area}</p>}
          </section>
          <section className="border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} /> To Address
            </h2>
            <p className="text-sm text-slate-900 font-medium">{rescue.to_address}</p>
            {rescue.to_pincode && <p className="text-xs text-slate-500 mt-1.5">Pincode: {rescue.to_pincode}</p>}
            {rescue.to_area && <p className="text-xs text-slate-500">Area: {rescue.to_area}</p>}
          </section>
        </div>

        {/* Meta */}
        <section className="border-t border-slate-100 pt-4 text-xs text-slate-400 flex items-center justify-between">
          <span className="inline-flex items-center gap-1"><Clock size={12} /> Created: {new Date(rescue.createdAt).toLocaleString()}</span>
          {rescue.updatedAt && <span>Updated: {new Date(rescue.updatedAt).toLocaleString()}</span>}
        </section>
      </div>
    </div>
  );
}
