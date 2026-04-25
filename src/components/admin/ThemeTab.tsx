import React from "react";
import { Palette } from "lucide-react";
import { SiteConfig } from "../../types";
import { THEME_PRESETS } from "../../constants";
import { cn } from "../../lib/utils";

interface ThemeTabProps {
  config: SiteConfig;
  onUpdateConfig: (cfg: SiteConfig) => void;
}

export const ThemeTab = ({ config, onUpdateConfig }: ThemeTabProps) => {
  const saveConfig = async (newConfig: SiteConfig) => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig)
    });
    onUpdateConfig(newConfig);
  };

  const handleApplyPreset = (preset: keyof typeof THEME_PRESETS) => {
    saveConfig({ ...config, theme: preset, customColors: THEME_PRESETS[preset] as any });
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <h3 className="text-3xl font-black italic tracking-tighter text-white">Visual Identity</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.keys(THEME_PRESETS).map(key => (
          <button 
            key={key} 
            onClick={() => handleApplyPreset(key as any)}
            className={cn(
              "p-8 rounded-[32px] border-2 transition-all bg-dim-card text-center space-y-4 group",
              config.theme === key ? "border-twitter-blue ring-4 ring-twitter-blue/10" : "border-dim-border hover:border-twitter-blue/40"
            )}
          >
            <div className="text-4xl group-hover:scale-125 transition-transform">{key === "LIGHT" ? "☀️" : key === "DIM" ? "🌙" : key === "DARK" ? "⬛" : "🎨"}</div>
            <div className="font-black text-sm uppercase tracking-widest">{key}</div>
          </button>
        ))}
      </div>

      <div className="p-10 rounded-[40px] border border-dim-border bg-dim-card space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-twitter-blue/10 text-twitter-blue rounded-2xl flex items-center justify-center"><Palette className="w-6 h-6" /></div>
           <div>
             <h4 className="font-black text-lg tracking-tight">Chromatic Customizer</h4>
             <p className="text-xs text-dim-muted">Precision control over your CMS interface colors.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {Object.entries(config.customColors || THEME_PRESETS.DIM).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-dim-bg rounded-2xl border border-dim-border">
              <span className="text-xs font-bold text-dim-muted uppercase tracking-widest">{key} Channel</span>
              <div className="flex items-center gap-3">
                 <span className="text-xs font-mono opacity-50 uppercase">{value}</span>
                 <input 
                   type="color" value={value} 
                   onChange={(e) => {
                     saveConfig({ ...config, theme: "CUSTOM" as any, customColors: { ...(config.customColors || THEME_PRESETS.DIM), [key]: e.target.value } });
                   }}
                   className="w-10 h-10 rounded-full border-2 border-white/10 bg-transparent cursor-pointer hover:scale-110 transition-transform"
                 />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
