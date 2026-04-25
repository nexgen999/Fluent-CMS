import React, { useState } from "react";
import { 
  ChevronRight, 
  Settings, 
  Trash2, 
  PlusCircle, 
  Plus,
  GripVertical
} from "lucide-react";
import { SiteConfig, Category } from "../../types";
import { SmartIcon } from "../ui/SmartIcon";
import { cn } from "../../lib/utils";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from "motion/react";

interface CategoriesTabProps {
  config: SiteConfig;
  onUpdateConfig: (cfg: SiteConfig) => void;
  icons: { name: string, url: string }[];
}

const CategoryEditorRow = ({ 
  cat, 
  categories, 
  level = 0, 
  onUpdate, 
  onDelete, 
  onAddSub,
  availableIcons = [],
  onDragEnd
}: { 
  cat: Category, 
  categories: Category[], 
  level?: number, 
  onUpdate: (c: Category) => void, 
  onDelete: (id: string) => void,
  onAddSub: (parentId: string) => void,
  availableIcons?: {name: string, url: string}[],
  onDragEnd?: (event: any) => void
}) => {
  const children = categories.filter(c => c.parentId === cat.id);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [localCat, setLocalCat] = useState(cat);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Potential parents (any category that isn't this one or one of its descendants)
  const getDescendantIds = (parentId: string): string[] => {
    const direct = categories.filter(c => c.parentId === parentId);
    let ids = direct.map(d => d.id);
    for (const d of direct) {
      ids = [...ids, ...getDescendantIds(d.id)];
    }
    return ids;
  };

  const descendants = getDescendantIds(cat.id);
  const possibleParents = categories.filter(c => c.id !== cat.id && !descendants.includes(c.id));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="space-y-1.5">
      <div 
        className={cn(
          "group flex items-center justify-between p-2 px-3 bg-dim-card border border-dim-border rounded-xl transition-all hover:bg-white/5",
          isEditing && "ring-2 ring-twitter-blue border-transparent bg-dim-bg shadow-2xl"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button 
            onClick={handleToggleExpand}
            className={cn(
              "p-0.5 hover:bg-white/10 rounded transition-all", 
              children.length === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight className={cn("w-3 h-3 text-dim-muted transform transition-transform", isExpanded && "rotate-90")} />
          </button>
          
          {isEditing ? (
            <div className="flex-1 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200 py-1">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-0.5">
                     <label className="text-[8px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Icon Reference</label>
                     <input 
                       value={localCat.icon} 
                       onChange={e => setLocalCat({...localCat, icon: e.target.value})}
                       className="w-full bg-dim-bg border border-dim-border rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-twitter-blue text-white" 
                       placeholder="Emoji/URL"
                     />
                  </div>
                  <div className="space-y-0.5">
                     <label className="text-[8px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Color</label>
                     <div className="flex items-center gap-2 bg-dim-bg border border-dim-border rounded-lg p-1 px-2 h-[30px]">
                        <input 
                          type="color" 
                          value={localCat.color || "#1d9bf0"} 
                          onChange={e => setLocalCat({...localCat, color: e.target.value})}
                          className="w-5 h-5 rounded border-none bg-transparent cursor-pointer"
                        />
                        <span className="text-[8px] font-mono text-dim-muted uppercase">{localCat.color || "#1d9bf0"}</span>
                     </div>
                  </div>
                  <div className="space-y-0.5">
                     <label className="text-[8px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Parent Silo</label>
                     <select 
                       value={localCat.parentId || ""} 
                       onChange={e => setLocalCat({...localCat, parentId: e.target.value || null})}
                       className="w-full bg-dim-bg border border-dim-border rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-twitter-blue text-white appearance-none"
                     >
                       <option value="">Root Level</option>
                       {possibleParents.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                     </select>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-twitter-blue tracking-[0.2em] px-1">Label Name</label>
                  <input 
                    value={localCat.name} 
                    onChange={e => setLocalCat({...localCat, name: e.target.value})}
                    className="w-full bg-dim-bg border border-dim-border rounded-lg px-3 py-1.5 font-bold outline-none focus:border-twitter-blue text-white text-sm" 
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-dim-muted tracking-[0.2em] px-1">Visual Identifiers Archive</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-dim-bg rounded-lg border border-dim-border max-h-24 overflow-y-auto custom-scrollbar">
                    {availableIcons.length > 0 ? availableIcons.map(ic => (
                      <button 
                        key={ic.name} 
                        onClick={() => setLocalCat({...localCat, icon: ic.url})} 
                        className={cn(
                          "p-1.5 bg-dim-card hover:bg-twitter-blue/10 rounded-lg border transition-all",
                          localCat.icon === ic.url ? "border-twitter-blue shadow-lg scale-105" : "border-dim-border/50"
                        )}
                        title={ic.name}
                      >
                         <img src={ic.url} className="w-5 h-5 object-contain" alt={ic.name} referrerPolicy="no-referrer" />
                      </button>
                    )) : <p className="text-[8px] text-dim-muted italic p-2 uppercase tracking-widest opacity-50">No identified markers archived.</p>}
                  </div>
               </div>

               <div className="flex gap-2">
                  <button 
                    onClick={() => { onUpdate(localCat); setIsEditing(false); }}
                    className="flex-1 py-1.5 bg-twitter-blue text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => { setLocalCat(cat); setIsEditing(false); }}
                    className="px-3 py-1.5 bg-dim-bg text-dim-muted rounded-lg font-black text-[9px] uppercase tracking-widest hover:text-white transition-all border border-dim-border"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          ) : (
            <>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-dim-bg shrink-0 border-l-2"
                style={{ borderColor: cat.color || "#1d9bf0" }}
              >
                <SmartIcon icon={cat.icon || "📁"} className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white tracking-tight text-sm truncate">{cat.name}</span>
                <div className="flex items-center gap-1.5 text-[7px] leading-none uppercase font-black tracking-widest">
                   <span className="text-twitter-blue opacity-80">Lvl {level + 1}</span>
                   {children.length > 0 && (
                     <span className="text-dim-muted opacity-50">• {children.length} Nodes</span>
                   )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={cn("flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all", isEditing && "hidden")}>
          {level < 6 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddSub(cat.id); }} 
              className="p-1.5 text-twitter-blue hover:bg-twitter-blue/10 rounded-md transition-all"
              title="Add Sub"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className="p-1.5 text-dim-muted hover:text-white hover:bg-white/5 rounded-md transition-all"
            title="Configure"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); if(confirm("Erase this silo and all children?")) onDelete(cat.id); }}
            className="p-1.5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="ml-4 pl-4 border-l border-dim-border/20 space-y-1.5 mt-1.5"
          >
             <DndContext 
               sensors={sensors} 
               collisionDetection={closestCenter} 
               onDragEnd={onDragEnd}
             >
                <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {children.map(child => (
                    <SortableCategoryWrapper 
                      key={child.id} 
                      id={child.id}
                      cat={child} 
                      categories={categories} 
                      level={level + 1} 
                      onUpdate={onUpdate} 
                      onDelete={onDelete} 
                      onAddSub={onAddSub}
                      availableIcons={availableIcons}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                </SortableContext>
             </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SortableCategoryWrapper = ({ id, cat, categories, onUpdate, onDelete, onAddSub, availableIcons, level, onDragEnd }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({id});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sort">
      <div {...attributes} {...listeners} className="absolute left-[-22px] top-3 p-0.5 cursor-grab opacity-0 group-hover/sort:opacity-100 transition-opacity text-twitter-blue/40 hover:text-twitter-blue">
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      <CategoryEditorRow 
        cat={cat} 
        categories={categories} 
        onUpdate={onUpdate} 
        onDelete={onDelete} 
        onAddSub={onAddSub}
        availableIcons={availableIcons}
        level={level}
        onDragEnd={onDragEnd}
      />
    </div>
  );
};


export const CategoriesTab = ({ config, onUpdateConfig, icons }: CategoriesTabProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      onUpdateConfig(newConfig);
    } catch (e) {
      console.error("Save config failed", e);
      alert("Network error: Failed to save changes.");
    }
  };

  const recursiveDeleteCategory = (cats: Category[], idToDelete: string): Category[] => {
    const children = cats.filter(c => c.parentId === idToDelete);
    let newCats = cats.filter(c => c.id !== idToDelete);
    for (const child of children) {
      newCats = recursiveDeleteCategory(newCats, child.id);
    }
    return newCats;
  };

  const handleDeleteSub = (id: string) => {
    const currentCats = Array.isArray(config.categories) ? config.categories : [];
    const nc = { 
      ...config, 
      categories: recursiveDeleteCategory(currentCats, id) 
    };
    saveConfig(nc);
  };

  const addCategory = (parentId: string | null = null) => {
    const id = `cat_${Math.random().toString(36).substr(2, 9)}`;
    const newCat: Category = {
      id,
      name: parentId ? "New Sub-Category" : "New Root Category",
      icon: parentId ? "🍱" : "📁",
      parentId: parentId,
      color: "#1d9bf0"
    };
    
    // Create categories array if it somehow doesn't exist
    const currentCats = Array.isArray(config.categories) ? config.categories : [];
    const updatedCats = [...currentCats, newCat];
    
    saveConfig({ ...config, categories: updatedCats });
  };

  function handleDragEnd(event: any) {
    const {active, over} = event;
    if (active && over && active.id !== over.id) {
      const currentCats = Array.isArray(config.categories) ? config.categories : [];
      const oldIndex = currentCats.findIndex(c => c.id === active.id);
      const newIndex = currentCats.findIndex(c => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCats = arrayMove(currentCats, oldIndex, newIndex);
        saveConfig({...config, categories: newCats});
      }
    }
  }

  const rootCategories = Array.isArray(config.categories) ? config.categories.filter(c => !c.parentId) : [];

  return (
    <section className="space-y-6 animate-in slide-in-from-right duration-500">
       <div className="flex items-center justify-between border-b border-dim-border pb-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black italic tracking-tighter text-white">Catégories</h3>
            <p className="text-dim-muted text-[10px] uppercase font-black tracking-widest opacity-60">Manage content hierarchy and navigation silos.</p>
          </div>
          <button 
            onClick={() => addCategory(null)}
            className="px-6 py-2.5 bg-twitter-blue hover:bg-twitter-blue/80 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            Add Root Category
          </button>
       </div>

       <div className="space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
             <SortableContext items={rootCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
               {rootCategories.map(c => (
                 <SortableCategoryWrapper 
                   key={c.id} 
                   id={c.id}
                   cat={c}
                   categories={config.categories}
                   onUpdate={(updated: Category) => {
                     const currentCats = Array.isArray(config.categories) ? config.categories : [];
                     const nc = { ...config, categories: currentCats.map(item => item.id === updated.id ? updated : item) };
                     saveConfig(nc);
                   }}
                   onDelete={handleDeleteSub}
                   onAddSub={addCategory}
                   availableIcons={icons}
                   level={0}
                   onDragEnd={handleDragEnd}
                 />
               ))}
             </SortableContext>
          </DndContext>
          {rootCategories.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-dim-border rounded-[40px]">
              <p className="text-dim-muted font-black uppercase tracking-[0.3em] text-xs opacity-20">Structure Vacuum Detected</p>
            </div>
          )}
       </div>
    </section>
  );
};
