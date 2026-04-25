import React from "react";
import { Plus, Copy, Trash2 } from "lucide-react";

interface GalleryTabProps {
  gallery: { name: string, url: string }[];
  onRefresh: () => void;
}

export const GalleryTab = ({ gallery, onRefresh }: GalleryTabProps) => {
  const uploadFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/upload/pictures`, { method: "POST", body: formData });
    if (res.ok) {
        onRefresh();
    }
  };

  const deleteAsset = async (name: string) => {
    if (!confirm("Destroy this asset permanently?")) return;
    await fetch(`/api/media/pictures/${name}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black italic tracking-tighter text-white">Cinematic Vault</h3>
        <label className="px-6 py-3 bg-twitter-blue rounded-full font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xl hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Import Asset
          <input type="file" accept="image/*" className="hidden" onChange={uploadFile} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.isArray(gallery) && gallery.map(img => (
          <div key={img.name} className="aspect-square rounded-[24px] bg-dim-card border border-dim-border overflow-hidden relative group">
            <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={img.name} referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
               <button 
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${img.url}`); alert("Media link copied to clipboard"); }} 
                className="w-full py-2 bg-white/10 hover:bg-white/30 rounded-xl text-white text-xs font-bold backdrop-blur-md flex items-center justify-center gap-2"
                >
                  <Copy className="w-3 h-3" /> Copy URL
                </button>
               <button 
                 onClick={() => deleteAsset(img.name)}
                 className="w-full py-2 bg-red-500/60 hover:bg-red-500 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Disintegrate
                </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
