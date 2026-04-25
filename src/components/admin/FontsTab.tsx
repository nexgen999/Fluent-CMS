import React, { useState } from "react";
import { Type, Check, ChevronDown, Monitor, Layout, FileText, Type as TypeIcon, Palette } from "lucide-react";
import { SiteConfig, TypographySetting } from "../../types";
import { FONTS } from "../../constants";
import { cn } from "../../lib/utils";

interface FontsTabProps {
  config: SiteConfig;
  onUpdateConfig: (cfg: SiteConfig) => void;
}

export const FontsTab = ({ config, onUpdateConfig }: FontsTabProps) => {
  const saveConfig = async (newConfig: SiteConfig) => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig)
    });
    onUpdateConfig(newConfig);
  };

  const updateSegment = (segment: keyof SiteConfig['typography'], values: Partial<TypographySetting>) => {
    const updatedTypography = {
      ...config.typography,
      [segment]: {
        ...(config.typography?.[segment] || { family: "Inter", size: "16px" }),
        ...values
      }
    };
    saveConfig({ ...config, typography: updatedTypography });
  };

  const TypographyCard = ({ 
    title, 
    id, 
    icon: Icon,
    description 
  }: { 
    title: string, 
    id: keyof SiteConfig['typography'], 
    icon: any,
    description: string 
  }) => {
    const setting = config.typography?.[id] || { family: "Inter", size: "16px" };
    const [showFonts, setShowFonts] = useState(false);

    return (
      <div className="bg-dim-card border border-dim-border rounded-[32px] p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-3">
              <Icon className="w-5 h-5 text-twitter-blue" /> {title}
            </h4>
            <p className="text-[10px] uppercase font-bold tracking-widest text-dim-muted opacity-60">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Font Family Selection */}
          <div className="md:col-span-1 space-y-2 relative">
            <label className="text-[9px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Family Selection</label>
            <button 
              onClick={() => setShowFonts(!showFonts)}
              className="w-full bg-dim-bg border border-dim-border rounded-xl px-4 py-3 flex items-center justify-between hover:border-twitter-blue transition-all"
            >
              <span className="font-bold text-white text-sm" style={{ fontFamily: setting.family }}>{setting.family}</span>
              <ChevronDown className={cn("w-4 h-4 text-dim-muted transition-transform", showFonts && "rotate-180")} />
            </button>

            {showFonts && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setShowFonts(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-dim-card border border-dim-border rounded-2xl shadow-2xl overflow-hidden py-2 z-[101] max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                  {FONTS.map(f => (
                    <button 
                      key={f}
                      onClick={() => {
                        updateSegment(id, { family: f });
                        setShowFonts(false);
                      }}
                      style={{ fontFamily: f }}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between group",
                        setting.family === f ? "text-twitter-blue bg-twitter-blue/10" : "text-white"
                      )}
                    >
                      <span className="text-sm font-medium">{f}</span>
                      {setting.family === f && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Size Scaling */}
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black uppercase text-twitter-blue tracking-[0.2em]">Size Magnitude</label>
              <span className="text-[10px] font-mono text-dim-muted">{setting.size || "16px"}</span>
            </div>
            <div className="flex items-center gap-4 bg-dim-bg border border-dim-border rounded-xl px-4 py-3">
              <input 
                type="range" min="8" max="72" step="1" 
                value={parseInt(setting.size || "16")}
                onChange={(e) => updateSegment(id, { size: `${e.target.value}px` })}
                className="flex-1 h-1.5 bg-dim-border rounded-full accent-twitter-blue cursor-pointer"
              />
            </div>
          </div>

          {/* Style & Weight */}
          <div className="md:col-span-1 space-y-2">
             <label className="text-[9px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Identity & Weight</label>
             <div className="grid grid-cols-2 gap-2">
                <select 
                  value={setting.weight || "400"}
                  onChange={e => updateSegment(id, { weight: e.target.value })}
                  className="bg-dim-bg border border-dim-border rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-twitter-blue appearance-none transition-all"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
                <div className="bg-dim-bg border border-dim-border rounded-xl p-1 flex items-center justify-center">
                   <input 
                    type="color" 
                    value={setting.color || "#ffffff"} 
                    onChange={e => updateSegment(id, { color: e.target.value })}
                    className="w-10 h-8 rounded border-none bg-transparent cursor-pointer"
                   />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-8 animate-in slide-in-from-right duration-500 max-w-5xl mx-auto pb-20">
       <div className="space-y-1 py-4 border-b border-dim-border">
          <h3 className="text-3xl font-black italic tracking-tighter text-white">Visual Taxonomy & Fonts</h3>
          <p className="text-[10px] uppercase font-black tracking-widest text-dim-muted opacity-60 italic">Define the granular aesthetics of your narrative platform.</p>
       </div>

       <div className="grid grid-cols-1 gap-8">
          <TypographyCard 
            title="Silo & System Base" 
            id="global" 
            icon={Monitor} 
            description="Universal font injects across non-specific elements"
          />
          <TypographyCard 
            title="Control & Navigation" 
            id="menu" 
            icon={Layout} 
            description="Typography for sidebars, tabs, and action arrays"
          />
          <TypographyCard 
            title="Narrative Pillars" 
            id="articleTitle" 
            icon={TypeIcon} 
            description="Heading styling for core article titles and headers"
          />
          <TypographyCard 
            title="The Content Stream" 
            id="articleBody" 
            icon={FileText} 
            description="Precision reading experience for post bodies and stories"
          />
       </div>

       <div className="bg-twitter-blue/5 border border-twitter-blue/20 rounded-[32px] p-8 text-center space-y-4">
          <Type className="w-10 h-10 text-twitter-blue mx-auto opacity-40" />
          <div className="space-y-1">
             <h4 className="text-sm font-black uppercase tracking-widest text-white">Advanced Style Persistence</h4>
             <p className="text-[10px] text-dim-muted leading-relaxed px-6 italic">Any modification here is instantly pushed to the system registry. Google Fonts are dynamically fetched based on your family selection.</p>
          </div>
       </div>
    </section>
  );
};
