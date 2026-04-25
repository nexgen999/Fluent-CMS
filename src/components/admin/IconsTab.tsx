import React, { useState } from "react";
import { 
  Trash2, 
  Plus, 
  Search, 
  Upload,
  Zap
} from "lucide-react";
import { cn } from "../../lib/utils";

interface IconsTabProps {
  icons: { name: string, url: string }[];
  onRefreshIcons: () => void;
}

export const IconsTab = ({ icons, onRefreshIcons }: IconsTabProps) => {
  const [scraperUrl, setScraperUrl] = useState("");
  const [scraperName, setScraperName] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleScrapeIcon = async () => {
    if (!scraperUrl) return;
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scraperUrl, name: scraperName })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshIcons();
        setScraperUrl("");
        setScraperName("");
        alert("Extraction successful! Icon added to archive.");
      } else {
        alert("Extraction failed: " + data.error);
      }
    } catch (e) {
      alert("Error reaching engine. Check your connection.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleDeleteIcon = async (name: string) => {
    if(confirm("Destroy this icon permanently?")) {
      try {
        await fetch(`/api/media/icones/${name}`, { method: "DELETE" });
        onRefreshIcons();
      } catch (e) {
        alert("Failed to delete icon.");
      }
    }
  };

  const filteredIcons = icons.filter(ic => 
    ic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-dim-border pb-8 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-twitter-blue/20 rounded-2xl text-twitter-blue">
                <Zap className="w-8 h-8" />
             </div>
             <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase">Icon Archive</h3>
          </div>
          <p className="text-dim-muted text-sm italic ml-14">Centralized control for all visual identifiers across categories and link silos.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim-muted" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search in archive..."
            className="w-full bg-dim-card border border-dim-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-twitter-blue transition-all font-bold text-sm text-white"
          />
        </div>
      </div>

      {/* Scraper Card */}
      <div className="bg-dim-card p-10 rounded-[40px] border border-dim-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Upload className="w-32 h-32 text-twitter-blue" />
        </div>
        
        <div className="relative z-10 space-y-8">
           <div className="space-y-2">
              <h4 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-twitter-blue" />
                Forge New Asset (Icon Engine)
              </h4>
              <p className="text-[11px] text-dim-muted uppercase font-bold tracking-tighter">Paste raw PNG links from the inter-nexus to materialize them in your archive.</p>
           </div>
           
           <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                 <input 
                  value={scraperUrl} 
                  onChange={e => setScraperUrl(e.target.value)} 
                  placeholder="https://raw.githubusercontent.com/...icon.png" 
                  className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 outline-none focus:border-twitter-blue transition-all text-sm text-white font-mono"
                 />
              </div>
              <div className="lg:w-72">
                 <input 
                  value={scraperName} 
                  onChange={e => setScraperName(e.target.value)} 
                  placeholder="Identifier Name" 
                  className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 outline-none focus:border-twitter-blue transition-all text-sm text-white font-bold"
                 />
              </div>
              <button 
               onClick={handleScrapeIcon}
               disabled={isScraping || !scraperUrl}
               className={cn(
                 "px-10 py-4 bg-twitter-blue rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-white shadow-xl shadow-twitter-blue/20",
                 (isScraping || !scraperUrl) && "opacity-50 grayscale cursor-not-allowed scale-100"
               )}
              >
                 {isScraping ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Materializing...
                   </>
                 ) : "Acquire Identifier"}
              </button>
           </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array.isArray(filteredIcons) && filteredIcons.map(ic => (
          <div key={ic.name} className="flex flex-col items-center gap-4 group">
            <div className="w-full aspect-square bg-dim-card border border-dim-border rounded-[32px] flex items-center justify-center p-6 group-hover:border-twitter-blue/50 transition-all relative overflow-hidden shadow-sm">
               <img src={ic.url} className="max-w-full max-h-full object-contain drop-shadow-xl" alt={ic.name} referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-dim-bg/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm">
                  <button 
                    onClick={() => handleDeleteIcon(ic.name)}
                    className="p-3 bg-red-500 rounded-2xl text-white hover:scale-110 active:scale-90 transition-all shadow-lg"
                  >
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
            <div className="text-center px-2 w-full">
              <span className="block text-[10px] font-black uppercase text-white truncate tracking-tighter">{ic.name.split('.')[0]}</span>
              <span className="block text-[8px] text-dim-muted font-bold uppercase">PNG Stream</span>
            </div>
          </div>
        ))}

        {filteredIcons.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 opacity-20">
             <div className="p-8 bg-dim-card inline-block rounded-full border border-dim-border">
                <Search className="w-12 h-12 text-white" />
             </div>
             <p className="text-xl font-black uppercase tracking-widest text-white">No Identifiers Found</p>
          </div>
        )}
      </div>
    </section>
  );
};
