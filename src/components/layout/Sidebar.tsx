import React, { useState } from "react";
import { 
  Home, 
  Settings, 
  LogIn, 
  LogOut, 
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SiteConfig, Category, User } from "../../types";
import { SmartIcon } from "../ui/SmartIcon";
import { cn } from "../../lib/utils";

interface SidebarProps {
  config: SiteConfig;
  selectedCat: string;
  onSelectCat: (id: string) => void;
  user: User;
  onLogin: () => void;
  onLogout: () => void;
  view: string;
  setView: (view: string) => void;
}

const CategoryNavItem = ({ cat, categories, selectedCat, onSelectCat, level = 0 }: { 
  cat: Category, 
  categories: Category[], 
  selectedCat: string, 
  onSelectCat: (id: string) => void,
  level?: number 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const subs = categories.filter(c => c.parentId === cat.id);
  const isActive = selectedCat === cat.id;

  return (
    <div className="space-y-1">
      <button 
        onClick={() => { onSelectCat(cat.id); setIsExpanded(!isExpanded); }}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-2xl transition-all shadow-sm group", 
          isActive ? "bg-twitter-blue/10 text-twitter-blue border border-twitter-blue/20" : "text-dim-muted hover:bg-white/5 hover:text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <div className="flex items-center gap-3">
          <div className="group-hover:scale-110 transition-transform">
            <SmartIcon icon={cat.icon || "📁"} className="w-5 h-5" />
          </div>
          <span className={cn("text-sm font-bold truncate max-w-[120px] sidebar-link", isActive && "text-twitter-blue")}>{cat.name}</span>
        </div>
        {subs.length > 0 && (
          <ChevronRight className={cn("w-3.5 h-3.5 opacity-50 transform transition-transform", isExpanded && "rotate-90")} />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && subs.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            {subs.map(sub => (
              <CategoryNavItem 
                key={sub.id} 
                cat={sub} 
                categories={categories} 
                selectedCat={selectedCat} 
                onSelectCat={onSelectCat} 
                level={level + 1} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar = ({ 
  config, 
  selectedCat, 
  onSelectCat, 
  user,
  onLogin,
  onLogout,
  view,
  setView
}: SidebarProps) => {
  const rootCategories = config?.categories.filter((c: Category) => !c.parentId) || [];

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

  return (
    <div className="w-72 h-full flex flex-col bg-dim-card overflow-hidden border-r border-dim-border shadow-2xl relative z-10 font-[inherit]">
      <div className="p-8 flex flex-col items-center border-b border-dim-border space-y-5 bg-gradient-to-b from-white/5 to-transparent">
        <div 
          className={cn(
            "overflow-hidden shadow-2xl relative group transition-all duration-500 flex items-center justify-center bg-twitter-blue",
            getFrameClass(config?.profile?.avatarFrame)
          )}
          style={{ 
            width: `${(config?.profile?.avatarScale || 128) / 1.5}px`, 
            height: `${(config?.profile?.avatarScale || 128) / 1.5}px`,
            padding: config?.profile?.avatarFrame === 'hexagon' ? '0' : '4px'
          }}
        >
           <div 
             className={cn(
               "w-full h-full overflow-hidden bg-dim-bg",
               getFrameClass(config?.profile?.avatarFrame),
               config?.profile?.avatarFrame === 'hexagon' && "scale-[0.98]"
             )}
           >
            <img 
              src={config?.profile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean"} 
              className={cn(
                "w-full h-full object-cover",
                config?.profile?.avatarFrame === 'diamond' && "-rotate-45 scale-[1.41]"
              )}
              style={{ objectPosition: `${config?.profile?.avatarPosX || 50}% ${config?.profile?.avatarPosY || 50}%` }}
              alt="Avatar"
              referrerPolicy="no-referrer"
            />
           </div>
           <div className="absolute inset-x-0 bottom-0 py-1 bg-twitter-blue/90 text-white text-[10px] font-black uppercase text-center opacity-0 group-hover:opacity-100 transition-opacity z-10">Online</div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black tracking-tight text-white profile-name">{config?.profile?.name || config?.siteName}</h2>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-dim-muted profile-handle">@{config?.profile?.handle || "visitor"}</span>
          </div>
        </div>
        <p className="text-[11px] text-dim-muted text-center leading-relaxed line-clamp-2 px-2 italic profile-bio">{config?.profile?.bio}</p>
        
        <div className="grid grid-cols-6 gap-2 w-full pt-2">
          {config?.socials?.map((s) => (
            <a 
              key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" 
              className="aspect-square bg-dim-bg border border-dim-border rounded-xl hover:bg-twitter-blue/20 hover:border-twitter-blue/40 transition-all group shadow-sm flex items-center justify-center shrink-0"
            >
              <SmartIcon icon={s.icon} className="w-4 h-4 text-dim-muted group-hover:text-twitter-blue group-hover:scale-110 transition-transform" />
            </a>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {user.isAuthenticated && (
          <div className="space-y-1">
             <p className="text-[10px] uppercase tracking-[0.3em] text-twitter-blue font-black mb-3 px-3">Terminal</p>
             <button 
                onClick={() => setView("admin")}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl transition-all shadow-sm", 
                  view === "admin" ? "bg-twitter-blue text-white font-bold" : "text-dim-muted hover:bg-white/5 hover:text-white"
                )}
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Administration</span>
             </button>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-twitter-blue font-black mb-3 px-3">Navigation</p>
          <button 
            onClick={() => { setView("feed"); onSelectCat(""); }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all shadow-sm", 
              view === "feed" && !selectedCat ? "bg-twitter-blue text-white font-bold" : "text-dim-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm">Main Feed</span>
          </button>
          <button 
            onClick={() => setView("files")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all shadow-sm", 
              view === "files" ? "bg-twitter-blue text-white font-bold" : "text-dim-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-sm">Shared Resources</span>
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-twitter-blue font-black mb-3 px-3">Exploration</p>
          {rootCategories.map((cat: Category) => (
            <CategoryNavItem 
              key={cat.id} 
              cat={cat} 
              categories={config.categories} 
              selectedCat={selectedCat} 
              onSelectCat={(id) => { setView("feed"); onSelectCat(id); }} 
            />
          ))}
        </div>
      </nav>

      <div className="p-6 border-t border-dim-border bg-gradient-to-t from-white/5 to-transparent">
        {user.isAuthenticated ? (
          <button onClick={onLogout} className="w-full py-3 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-[0.2em] rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        ) : (
          <button onClick={onLogin} className="w-full py-3 bg-dim-bg border border-dim-border text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all text-dim-muted hover:text-white flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Authenticate
          </button>
        )}
      </div>
    </div>
  );
};
