import React, { useState, useRef } from "react";
import { Database, Download, Upload, ShieldCheck, AlertTriangle, FileJson, Clock } from "lucide-react";
import { SiteConfig, Article } from "../../types";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface BackupTabProps {
  config: SiteConfig;
  articles: Article[];
  onUpdateConfig: (config: SiteConfig) => void;
  onUpdateArticles: (articles: Article[]) => void;
}

export const BackupTab = ({ config, articles, onUpdateConfig, onUpdateArticles }: BackupTabProps) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      config,
      articles
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blueprint-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setStatus({ type: 'success', message: 'Data silo exported successfully.' });
    setTimeout(() => setStatus({ type: 'none', message: '' }), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error("Invalid structure: missing articles array.");
        }

        if (confirm(`CRITICAL: This will overwrite ${articles.length} current articles and your system config with ${data.articles.length} imported articles. Continue?`)) {
          if (data.config) onUpdateConfig(data.config);
          onUpdateArticles(data.articles);
          
          setStatus({ type: 'success', message: `Import successful: ${data.articles.length} nodes synchronized.` });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Import failed: Protocol mismatch or corrupted file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="space-y-8 animate-in slide-in-from-right duration-500 max-w-5xl mx-auto pb-20">
       <div className="space-y-1 py-4 border-b border-dim-border">
          <h3 className="text-3xl font-black italic tracking-tighter text-white">System & Data Silos</h3>
          <p className="text-[10px] uppercase font-black tracking-widest text-dim-muted opacity-60 italic">Managed backups, protocol health, and data portability.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export Module */}
          <div className="bg-dim-card border border-dim-border rounded-[32px] p-8 space-y-6 group">
             <div className="w-16 h-16 bg-twitter-blue/10 rounded-2xl flex items-center justify-center text-twitter-blue mb-4 group-hover:scale-110 transition-transform">
                <Download className="w-8 h-8" />
             </div>
             <div className="space-y-2">
                <h4 className="text-xl font-black italic text-white tracking-tight">Extract Full Archive</h4>
                <p className="text-xs text-dim-muted leading-relaxed">Generate a comprehensive snapshots of your Articles, Categories, and Theme configuration in a single structured JSON file.</p>
             </div>
             <button 
               onClick={exportData}
               className="w-full py-4 bg-white/5 hover:bg-twitter-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-dim-border hover:border-twitter-blue flex items-center justify-center gap-3"
             >
               <FileJson className="w-4 h-4" /> Start Extraction
             </button>
          </div>

          {/* Import Module */}
          <div className="bg-dim-card border border-dim-border rounded-[32px] p-8 space-y-6 group border-dashed">
             <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
             </div>
             <div className="space-y-2">
                <h4 className="text-xl font-black italic text-white tracking-tight">Restore / Migrate Silo</h4>
                <p className="text-xs text-dim-muted leading-relaxed">Overwrite current active environment with external data. Use with extreme caution as this process is destructive.</p>
             </div>
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               accept=".json"
               onChange={handleImport}
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full py-4 bg-amber-500/10 hover:bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-amber-500/20 flex items-center justify-center gap-3"
             >
               <ShieldCheck className="w-4 h-4" /> Inject Archive
             </button>
          </div>
       </div>

       {status.type !== 'none' && (
         <div className={cn(
           "p-4 rounded-2xl flex items-center gap-3 border animate-in zoom-in-95",
           status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
         )}>
           <AlertTriangle className="w-5 h-5 shrink-0" />
           <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
         </div>
       )}

       {/* System Status */}
       <div className="bg-dim-bg border border-dim-border rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-8">
             <h4 className="text-sm font-black uppercase tracking-[0.3em] text-dim-muted">Environment Statistics</h4>
             <Database className="w-5 h-5 text-twitter-blue" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-dim-muted tracking-widest">Total Articles</span>
                <p className="text-3xl font-black italic text-white">{articles.length}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-dim-muted tracking-widest">Storage Footprint</span>
                <p className="text-3xl font-black italic text-white">~{(JSON.stringify(articles).length / 1024 / 1024).toFixed(2)} MB</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-dim-muted tracking-widest">Active Silos</span>
                <p className="text-3xl font-black italic text-white">{config.categories?.length || 0}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-dim-muted tracking-widest">Health Sync</span>
                <p className="text-3xl font-black italic text-twitter-blue">100%</p>
             </div>
          </div>
       </div>

       <div className="p-8 border border-white/5 bg-white/5 rounded-[32px] flex items-start gap-4">
          <Clock className="w-5 h-5 text-twitter-blue mt-1 shrink-0" />
          <div className="space-y-1">
             <h5 className="text-xs font-black uppercase tracking-widest text-white">Automatic Recovery Protocol</h5>
             <p className="text-[10px] text-dim-muted leading-relaxed italic">The system automatically saves your current state to the cloud. Manual exports are recommended before making major architectural changes or mass-deleting articles.</p>
          </div>
       </div>
    </section>
  );
};
