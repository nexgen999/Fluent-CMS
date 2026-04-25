import React, { useState, useMemo } from "react";
import { Search, Calendar, ChevronDown, Trash2, Edit3, Type } from "lucide-react";
import { Article, SiteConfig, Category } from "../../types";
import { format, parseISO } from "date-fns";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface ArticlesTabProps {
  config: SiteConfig;
  articles: Article[];
  onEdit: (article: Article) => void;
  onRefresh: () => void;
}

export const ArticlesTab = ({ config, articles, onEdit, onRefresh }: ArticlesTabProps) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'chronological' | 'list'>('chronological');
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  const categories = config.categories || [];

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                           a.id.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === "all" || a.category === selectedCategory;
      return matchesSearch && matchesCat;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [articles, search, selectedCategory]);

  const groupedArticles = useMemo(() => {
    const groups: { [key: string]: Article[] } = {};
    filteredArticles.forEach(a => {
      const dateObj = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date);
      const key = format(dateObj, 'yyyy-MM');
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }, [filteredArticles]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Destroy this manuscript permanently?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFullArticle = async (id: string) => {
    const res = await fetch(`/api/articles/${id}`);
    const full = await res.json();
    onEdit(full);
  };

  const ArticleRow = ({ article }: { article: Article }) => {
    const dateObj = typeof article.date === 'string' ? parseISO(article.date) : new Date(article.date);
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="group flex items-center justify-between p-3 px-6 bg-dim-bg hover:bg-twitter-blue/5 border-b border-dim-border/30 transition-all"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-dim-card flex-shrink-0 flex items-center justify-center border border-dim-border text-[8px] font-bold uppercase tracking-widest text-dim-muted">
             {format(dateObj, 'dd')}
          </div>
          <div className="flex flex-col min-w-0">
             <span className="font-bold text-white text-sm truncate group-hover:text-twitter-blue transition-colors">{article.title}</span>
             <div className="flex items-center gap-2">
                <span className="text-[8px] text-dim-muted uppercase font-black tracking-widest truncate max-w-[200px]">ID: {article.id}</span>
                <span className="text-[8px] text-twitter-blue font-black uppercase tracking-widest bg-twitter-blue/5 px-2 py-0.5 rounded border border-twitter-blue/10">
                  {categories.find(c => c.id === article.category)?.name || "Default"}
                </span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => fetchFullArticle(article.id)}
            className="p-2 text-dim-muted hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteArticle(article.id)}
            className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="space-y-6 animate-in slide-in-from-right duration-500 max-w-5xl mx-auto">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dim-border pb-6">
          <div className="space-y-1">
            <h3 className="text-3xl font-black italic tracking-tighter text-white">Articles Architecture</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-dim-muted opacity-60">High-Performance Narrative Archive</p>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim-muted" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Scan Nodes..."
                  className="bg-dim-bg border border-dim-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-twitter-blue w-60"
                />
             </div>
             <select 
               value={selectedCategory}
               onChange={e => setSelectedCategory(e.target.value)}
               className="bg-dim-bg border border-dim-border rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-twitter-blue appearance-none"
             >
                <option value="all">Global Stream</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
       </div>

       <div className="bg-dim-card rounded-[32px] border border-dim-border overflow-hidden shadow-2xl">
          <div className="p-4 px-8 border-b border-dim-border flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-8">
                <button 
                  onClick={() => setViewMode('chronological')}
                  className={cn("text-[9px] font-black uppercase tracking-[0.2em] transition-all", viewMode === 'chronological' ? "text-twitter-blue" : "text-dim-muted hover:text-white")}
                >
                  Chronological Mapping
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("text-[9px] font-black uppercase tracking-[0.2em] transition-all", viewMode === 'list' ? "text-twitter-blue" : "text-dim-muted hover:text-white")}
                >
                  Dense Infrastructure
                </button>
             </div>
             <div className="flex items-center gap-2 text-[9px] font-mono text-dim-muted uppercase bg-dim-bg px-3 py-1 rounded-full border border-dim-border">
                <Type className="w-3 h-3" />
                {filteredArticles.length} Active Nodes
             </div>
          </div>

          <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
             {viewMode === 'chronological' ? (
                Object.entries(groupedArticles).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, monthArticles]) => {
                  const isExpanded = expandedMonths.includes(monthKey);
                  const dateObj = parseISO(monthKey + "-01");
                  const monthLabel = format(dateObj, 'MMMM yyyy');
                  
                  return (
                    <div key={monthKey} className="border-b border-dim-border/20 last:border-0 border-l-2 border-l-transparent hover:border-l-twitter-blue transition-all">
                       <button 
                         onClick={() => toggleMonth(monthKey)}
                         className="w-full flex items-center justify-between p-4 px-10 hover:bg-white/[0.02] transition-all group"
                       >
                          <div className="flex items-center gap-5">
                             <Calendar className="w-3.5 h-3.5 text-twitter-blue opacity-40 group-hover:opacity-100 transition-opacity" />
                             <span className="text-sm font-black italic text-white uppercase tracking-tight">{monthLabel}</span>
                             <span className="text-[9px] text-dim-muted font-black opacity-30 group-hover:opacity-60 transition-opacity">— {monthArticles.length} Entries Synchronized</span>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-dim-muted transition-transform duration-300", isExpanded ? "rotate-0" : "-rotate-90")} />
                       </button>
                       <AnimatePresence initial={false}>
                          {(isExpanded || search) && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden bg-black/10"
                            >
                               {monthArticles.map(a => <ArticleRow key={a.id} article={a} />)}
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                  );
                })
             ) : (
                <div className="divide-y divide-dim-border/20">
                  {filteredArticles.map(a => <ArticleRow key={a.id} article={a} />)}
                </div>
             )}

             {filteredArticles.length === 0 && (
               <div className="py-24 text-center space-y-6">
                  <div className="w-16 h-16 bg-dim-bg border border-dim-border rounded-3xl flex items-center justify-center mx-auto opacity-10">
                     <Search className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-dim-muted">Null Stream Pattern Detected</p>
                    <p className="text-[9px] text-dim-muted/50">Adjust search parameters or category filter.</p>
                  </div>
               </div>
             )}
          </div>
       </div>
    </section>
  );
};
