import React, { useState } from "react";
import { Plus, ChevronDown, Check, Type, Move, User, Hash, FileText } from "lucide-react";
import { SiteConfig, TypographySetting } from "../../types";
import { cn } from "../../lib/utils";
import { FONTS } from "../../constants";

interface ProfileTabProps {
  config: SiteConfig;
  onUpdateConfig: (cfg: SiteConfig) => void;
}

export const ProfileTab = ({ config, onUpdateConfig }: ProfileTabProps) => {
  const [activeFontMenu, setActiveFontMenu] = useState<string | null>(null);

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      onUpdateConfig(newConfig);
    } catch (e) {
      console.error("Failed to sync identity profile", e);
    }
  };

  const uploadAvatar = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/upload/pictures`, { method: "POST", body: formData });
    if (res.ok) {
        const data = await res.json();
        if (data.url) {
            const newCfg = { ...config, profile: { ...config.profile, avatarUrl: data.url } };
            saveConfig(newCfg);
        }
    }
  };

  const updateProfileTypo = (segment: keyof SiteConfig['typography'], values: Partial<TypographySetting>) => {
    const updatedTypography = {
      ...config.typography,
      [segment]: {
        ...(config.typography?.[segment] || { family: "Inter", size: "14px" }),
        ...values
      }
    };
    const newCfg = { ...config, typography: updatedTypography };
    onUpdateConfig(newCfg);
    saveConfig(newCfg);
  };

  const getFrameClass = (frame: any) => {
    switch(frame) {
      case 'none': return '';
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-2xl';
      case 'squircle': return 'rounded-[35%]';
      case 'diamond': return 'rotate-45';
      case 'hexagon': return 'mask-hexagon border-0';
      default: return 'rounded-full';
    }
  };

  const FontSelector = ({ id, setting }: { id: keyof SiteConfig['typography'], setting: TypographySetting }) => (
    <div className="relative">
      <button 
        onClick={() => setActiveFontMenu(activeFontMenu === id ? null : id)}
        className="w-full bg-dim-bg border border-dim-border rounded-xl px-3 py-2 flex items-center justify-between hover:border-twitter-blue transition-all"
      >
        <span className="font-bold text-white text-[10px]" style={{ fontFamily: setting.family }}>{setting.family}</span>
        <ChevronDown className={cn("w-3 h-3 text-dim-muted transition-transform", activeFontMenu === id && "rotate-180")} />
      </button>

      {activeFontMenu === id && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setActiveFontMenu(null)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-dim-card border border-dim-border rounded-xl shadow-2xl overflow-hidden py-1 z-[101] max-h-40 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1">
            {FONTS.map(f => (
              <button 
                key={f}
                onClick={() => {
                  updateProfileTypo(id, { family: f });
                  setActiveFontMenu(null);
                }}
                style={{ fontFamily: f }}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between group",
                  setting.family === f ? "text-twitter-blue bg-twitter-blue/10" : "text-white"
                )}
              >
                <span className="text-[10px] font-medium">{f}</span>
                {setting.family === f && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       <div className="space-y-2">
         <h3 className="text-3xl font-black italic tracking-tighter text-white">Identity Management</h3>
         <p className="text-[11px] uppercase font-black tracking-widest text-dim-muted opacity-60">Architect your digital presence.</p>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-dim-card p-10 rounded-[40px] border border-dim-border space-y-10 flex flex-col items-center">
             <div className="relative group">
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-out bg-twitter-blue border-white/0",
                    getFrameClass(config.profile?.avatarFrame)
                  )}
                  style={{ 
                    width: `${config.profile?.avatarScale || 128}px`, 
                    height: `${config.profile?.avatarScale || 128}px`,
                    padding: config.profile?.avatarFrame === 'hexagon' ? '0' : '4px'
                  }}
                >
                   <div 
                    className={cn(
                      "w-full h-full overflow-hidden bg-dim-bg",
                      getFrameClass(config.profile?.avatarFrame),
                      config.profile?.avatarFrame === 'hexagon' && "scale-[0.98]"
                    )}
                   >
                    <img 
                      src={config.profile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean"} 
                      className={cn(
                        "w-full h-full object-cover",
                        config.profile?.avatarFrame === 'diamond' && "-rotate-45 scale-[1.41]"
                      )}
                      style={{ 
                        objectPosition: `${config.profile?.avatarPosX || 50}% ${config.profile?.avatarPosY || 50}%` 
                      }}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                   </div>
                </div>
                <label className={cn(
                  "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10",
                   getFrameClass(config.profile?.avatarFrame)
                )}>
                   <Plus className={cn("w-8 h-8 text-white", config.profile?.avatarFrame === 'diamond' && "-rotate-45")} />
                   <input type="file" className="hidden" onChange={uploadAvatar} />
                </label>
             </div>

             <div className="w-full space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <label className="text-[9px] font-black uppercase text-twitter-blue tracking-[0.2em] flex items-center gap-2">
                        <Move className="w-3 h-3" /> Avatar Magnitude
                      </label>
                      <span className="text-[10px] font-mono text-dim-muted italic">{config.profile?.avatarScale || 128}px</span>
                   </div>
                   <input 
                     type="range" min="64" max="256" step="1" 
                     value={config.profile?.avatarScale || 128}
                     onChange={e => onUpdateConfig({...config, profile: {...config.profile, avatarScale: parseInt(e.target.value)}})}
                     onMouseUp={() => saveConfig(config)}
                     className="w-full h-1.5 bg-dim-bg rounded-full accent-twitter-blue cursor-pointer"
                   />

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="flex items-center justify-between px-1">
                            <label className="text-[8px] font-black uppercase text-dim-muted tracking-widest">X Align</label>
                            <span className="text-[8px] font-mono text-dim-muted">{config.profile?.avatarPosX || 50}%</span>
                         </div>
                         <input 
                           type="range" min="0" max="100" step="1" 
                           value={config.profile?.avatarPosX || 50}
                           onChange={e => onUpdateConfig({...config, profile: {...config.profile, avatarPosX: parseInt(e.target.value)}})}
                           onMouseUp={() => saveConfig(config)}
                           className="w-full h-1 bg-dim-bg rounded-full accent-twitter-blue cursor-pointer"
                         />
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between px-1">
                            <label className="text-[8px] font-black uppercase text-dim-muted tracking-widest">Y Align</label>
                            <span className="text-[8px] font-mono text-dim-muted">{config.profile?.avatarPosY || 50}%</span>
                         </div>
                         <input 
                           type="range" min="0" max="100" step="1" 
                           value={config.profile?.avatarPosY || 50}
                           onChange={e => onUpdateConfig({...config, profile: {...config.profile, avatarPosY: parseInt(e.target.value)}})}
                           onMouseUp={() => saveConfig(config)}
                           className="w-full h-1 bg-dim-bg rounded-full accent-twitter-blue cursor-pointer"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Structural Frame</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['circle', 'square', 'squircle', 'diamond', 'hexagon', 'none'].map((f: any) => (
                        <button 
                          key={f}
                          onClick={() => {
                            const newCfg = {...config, profile: {...config.profile, avatarFrame: f}};
                            onUpdateConfig(newCfg);
                            saveConfig(newCfg);
                          }}
                          className={cn(
                            "py-2 text-[8px] font-black uppercase tracking-tighter rounded-xl border transition-all",
                            (config.profile?.avatarFrame === f || (!config.profile?.avatarFrame && f === 'circle'))
                              ? "bg-twitter-blue border-twitter-blue text-white shadow-lg" 
                              : "bg-dim-bg border-dim-border text-dim-muted hover:text-white"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
             <div className="bg-dim-card p-10 rounded-[40px] border border-dim-border space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue flex items-center gap-2">
                           <User className="w-3 h-3" /> Display Alias
                        </label>
                      </div>
                      <input 
                        value={config.profile?.name} 
                        onChange={e => onUpdateConfig({...config, profile: {...config.profile, name: e.target.value}})}
                        onBlur={() => saveConfig(config)}
                        className="w-full bg-dim-bg border border-dim-border rounded-xl p-4 focus:border-twitter-blue outline-none font-bold text-white" 
                        style={{ 
                          fontFamily: config.typography?.profileName?.family,
                          fontSize: config.typography?.profileName?.size 
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                         <FontSelector id="profileName" setting={config.typography?.profileName || { family: "Inter", size: "14px" }} />
                         <div className="flex items-center gap-2 bg-dim-bg border border-dim-border rounded-xl px-2 py-1">
                            <label className="text-[8px] uppercase font-black text-dim-muted">Size</label>
                            <input 
                               type="number" 
                               value={parseInt(config.typography?.profileName?.size || "18")}
                               onChange={e => updateProfileTypo("profileName", { size: `${e.target.value}px` })}
                               className="w-full bg-transparent border-none text-[10px] font-bold text-white outline-none"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue flex items-center gap-2">
                           <Hash className="w-3 h-3" /> Protocol Handle
                        </label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-muted font-bold font-mono text-sm">@</span>
                        <input 
                          value={config.profile?.handle} 
                          onChange={e => onUpdateConfig({...config, profile: {...config.profile, handle: e.target.value}})}
                          onBlur={() => saveConfig(config)}
                          className="w-full bg-dim-bg border border-dim-border rounded-xl p-4 pl-10 focus:border-twitter-blue outline-none font-bold text-white" 
                          style={{ 
                            fontFamily: config.typography?.profileHandle?.family,
                            fontSize: config.typography?.profileHandle?.size 
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         <FontSelector id="profileHandle" setting={config.typography?.profileHandle || { family: "Inter", size: "12px" }} />
                         <div className="flex items-center gap-2 bg-dim-bg border border-dim-border rounded-xl px-2 py-1">
                            <label className="text-[8px] uppercase font-black text-dim-muted">Size</label>
                            <input 
                               type="number" 
                               value={parseInt(config.typography?.profileHandle?.size || "14")}
                               onChange={e => updateProfileTypo("profileHandle", { size: `${e.target.value}px` })}
                               className="w-full bg-transparent border-none text-[10px] font-bold text-white outline-none"
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue px-1 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Biological Blueprint / Bio
                   </label>
                   <textarea 
                     value={config.profile?.bio} 
                     onChange={e => onUpdateConfig({...config, profile: {...config.profile, bio: e.target.value}})}
                     onBlur={() => saveConfig(config)}
                     className="w-full h-32 bg-dim-bg border border-dim-border rounded-2xl p-4 focus:border-twitter-blue outline-none resize-none leading-relaxed text-white" 
                     placeholder="Define your existence..."
                     style={{ 
                       fontFamily: config.typography?.profileBio?.family,
                       fontSize: config.typography?.profileBio?.size 
                     }}
                   />
                   <div className="grid grid-cols-2 gap-2">
                      <FontSelector id="profileBio" setting={config.typography?.profileBio || { family: "Inter", size: "14px" }} />
                      <div className="flex items-center gap-2 bg-dim-bg border border-dim-border rounded-xl px-2 py-1">
                         <label className="text-[8px] uppercase font-black text-dim-muted">Size</label>
                         <input 
                            type="number" 
                            value={parseInt(config.typography?.profileBio?.size || "14")}
                            onChange={e => updateProfileTypo("profileBio", { size: `${e.target.value}px` })}
                            className="w-full bg-transparent border-none text-[10px] font-bold text-white outline-none"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};

