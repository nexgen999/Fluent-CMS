import React, { useState } from "react";
import { 
  Globe, 
  Trash2, 
  GripVertical, 
  Plus, 
  Link as LinkIcon,
  ExternalLink,
  Search
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { SiteConfig, SocialNetwork } from "../../types";
import { SmartIcon } from "../ui/SmartIcon";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../lib/utils";

interface SocialsTabProps {
  config: SiteConfig;
  onUpdateConfig: (cfg: SiteConfig) => void;
  icons: { name: string, url: string }[];
}

const SortableSocialItem = ({ 
  social, 
  onUpdate, 
  onDelete, 
  icons 
}: { 
  social: SocialNetwork, 
  onUpdate: (val: Partial<SocialNetwork>, save?: boolean) => void, 
  onDelete: () => void,
  icons: { name: string, url: string }[]
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: social.id });

  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : (isIconMenuOpen ? 150 : 1),
    opacity: isDragging ? 0.3 : 1
  };

  const filteredIcons = Object.keys(LucideIcons)
    .filter(k => typeof (LucideIcons as any)[k] === 'function' && k !== 'createLucideIcon')
    .filter(k => k.toLowerCase().includes(iconSearch.toLowerCase()))
    .slice(0, 40);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group relative bg-dim-card/40 border border-dim-border rounded-2xl p-3 transition-all",
        !isDragging && "hover:border-twitter-blue/40 hover:bg-dim-card shadow-lg shadow-black/20"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Sort Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 opacity-30 hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
        
        {/* Icon & Picker */}
        <div className="relative">
          <button 
            onClick={() => setIsIconMenuOpen(!isIconMenuOpen)}
            className="w-10 h-10 bg-dim-bg border border-dim-border rounded-xl flex items-center justify-center text-twitter-blue group/icon relative overflow-hidden transition-all hover:border-twitter-blue"
          >
            <SmartIcon icon={social.icon} className="w-5 h-5 flex-shrink-0" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </button>

          {isIconMenuOpen && (
            <>
              <div className="fixed inset-0 z-[140]" onClick={() => setIsIconMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-3 w-72 bg-dim-card border border-dim-border rounded-2xl shadow-2xl z-[150] p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                <div className="flex items-center gap-2 px-3 py-2 bg-dim-bg rounded-lg border border-dim-border mb-3">
                  <Search className="w-3 h-3 text-dim-muted" />
                  <input 
                    autoFocus
                    placeholder="Search library..." 
                    className="bg-transparent text-[10px] text-white outline-none w-full font-bold"
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  {icons.length > 0 && !iconSearch && (
                    <div className="space-y-2">
                       <p className="text-[8px] font-black uppercase tracking-widest text-twitter-blue opacity-80 px-1 border-b border-dim-border pb-1">Identity Assets</p>
                       <div className="grid grid-cols-5 gap-2">
                          {icons.map(ic => (
                            <button 
                              key={ic.url}
                              onClick={() => {
                                onUpdate({ icon: ic.url }, true);
                                setIsIconMenuOpen(false);
                              }}
                              className={cn(
                                "aspect-square bg-dim-bg border border-dim-border rounded-lg overflow-hidden hover:border-twitter-blue transition-all p-1",
                                social.icon === ic.url && "border-twitter-blue bg-twitter-blue/10"
                              )}
                            >
                               <img src={ic.url} className="w-full h-full object-contain" />
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="space-y-2">
                     <p className="text-[8px] font-black uppercase tracking-widest text-dim-muted px-1 border-b border-dim-border pb-1">Lucide Library</p>
                     <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {filteredIcons.map(icon => (
                          <button 
                            key={icon}
                            onClick={() => {
                              onUpdate({ icon }, true);
                              setIsIconMenuOpen(false);
                            }}
                            className={cn(
                              "aspect-square flex items-center justify-center rounded-lg transition-all",
                              social.icon === icon ? "bg-twitter-blue text-white" : "hover:bg-white/5 text-dim-muted hover:text-white"
                            )}
                          >
                            <SmartIcon icon={icon} className="w-4 h-4" />
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Inputs - Single Line Alignment */}
        <div className="flex-1 flex flex-col md:flex-row items-center gap-3">
          <div className="flex-none w-full md:w-1/3">
            <input 
              value={social.name} 
              onChange={e => onUpdate({ name: e.target.value })}
              onBlur={() => onUpdate({}, true)}
              placeholder="Label"
              className="w-full bg-dim-bg/50 border border-dim-border rounded-lg px-3 py-2 text-[13px] font-black uppercase tracking-widest text-white outline-none focus:border-twitter-blue/60 transition-all placeholder:text-dim-muted/30" 
            />
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">
               <LinkIcon className="w-3 h-3 text-white" />
            </div>
            <input 
              value={social.url} 
              onChange={e => onUpdate({ url: e.target.value })}
              onBlur={() => onUpdate({}, true)}
              placeholder="Coordinates (URL)"
              className="w-full bg-dim-bg/50 border border-dim-border rounded-lg pl-8 pr-3 py-2 text-[13px] font-mono text-dim-muted outline-none focus:border-twitter-blue/60 transition-all focus:text-white" 
            />
          </div>
        </div>

        {/* Delete */}
        <div className="shrink-0 flex items-center gap-1">
           <button 
            onClick={() => onDelete()}
            className="p-2 text-dim-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export const SocialsTab = ({ config, onUpdateConfig, icons }: SocialsTabProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      onUpdateConfig(newConfig);
    } catch (e) {
      console.error("Failed to sync socials", e);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = config.socials.findIndex(s => s.id === active.id);
      const newIndex = config.socials.findIndex(s => s.id === over.id);
      
      const newSocials = arrayMove([...config.socials], oldIndex, newIndex);
      const newConfig = { ...config, socials: newSocials };
      onUpdateConfig(newConfig);
      saveConfig(newConfig);
    }
  };

  const addSocial = () => {
    const id = Date.now().toString();
    const newSocials = [...config.socials, { id, name: "New Social", url: "https://", icon: "Link" }];
    const newConfig = { ...config, socials: newSocials };
    onUpdateConfig(newConfig);
    saveConfig(newConfig);
  };

  const removeSocial = (id: string) => {
    const newSocials = config.socials.filter(s => s.id !== id);
    const newConfig = { ...config, socials: newSocials };
    onUpdateConfig(newConfig);
    saveConfig(newConfig);
  };

  const updateSocialItem = (id: string, updates: Partial<SocialNetwork>, shouldSave: boolean = false) => {
    const newSocials = config.socials.map(s => s.id === id ? { ...s, ...updates } : s);
    const newConfig = { ...config, socials: newSocials };
    onUpdateConfig(newConfig);
    if (shouldSave) {
      saveConfig(newConfig);
    }
  };

  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-dim-border/50">
          <div className="space-y-2 text-left">
            <h3 className="text-4xl font-black italic tracking-tighter text-white">Digital Nodes</h3>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-dim-muted opacity-60">Architect your connectivity matrix.</p>
          </div>
          
          <button 
            onClick={addSocial}
            className="flex items-center gap-3 px-8 py-4 bg-twitter-blue hover:bg-twitter-blue-hover text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-twitter-blue/20 group active:scale-95"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Integrate Channel
          </button>
       </div>

       <div className="space-y-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={config.socials.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {config.socials.map((s) => (
                  <SortableSocialItem 
                    key={s.id}
                    social={s}
                    icons={icons}
                    onUpdate={(updates, save) => updateSocialItem(s.id, updates, save)}
                    onDelete={() => removeSocial(s.id)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}>
              {activeId ? (
                <div className="bg-dim-card border-2 border-twitter-blue rounded-[28px] p-6 shadow-2xl scale-105 rotate-2">
                  <div className="flex items-center gap-6">
                    <GripVertical className="w-5 h-5 text-twitter-blue" />
                    <div className="w-14 h-14 bg-dim-bg border border-dim-border rounded-2xl flex items-center justify-center text-twitter-blue">
                      <SmartIcon icon={config.socials.find(s => s.id === activeId)?.icon} className="w-7 h-7" />
                    </div>
                    <div className="flex-1 font-black text-white uppercase tracking-widest italic text-left">
                      {config.socials.find(s => s.id === activeId)?.name}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {config.socials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-dim-border rounded-[40px] text-center space-y-4 opacity-50">
               <div className="w-20 h-20 bg-dim-card border border-dim-border rounded-3xl flex items-center justify-center">
                  <Globe className="w-10 h-10 text-dim-muted" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-sm font-black text-white uppercase">Void Detected</h4>
                 <p className="text-xs text-dim-muted italic">No social intersections have been mapped yet.</p>
               </div>
            </div>
          )}
       </div>

       <div className="bg-dim-card/30 border border-dim-border/40 rounded-[32px] p-8 flex items-start gap-5">
          <div className="w-10 h-10 bg-twitter-blue/10 rounded-2xl flex items-center justify-center shrink-0 border border-twitter-blue/20">
             <LinkIcon className="w-5 h-5 text-twitter-blue" />
          </div>
          <div className="space-y-2 text-left">
             <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Canonical Sequencing</h5>
             <p className="text-[10px] text-dim-muted leading-relaxed italic opacity-80">
                The order defined here determines the hierarchy in the global navigation shell. Use the drag handles to establish primary connectivity points.
             </p>
          </div>
       </div>
    </section>
  );
};

