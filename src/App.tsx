import { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SiteConfig, Article, User } from "./types";
import AdminPanel from "./components/AdminPanel";
import FileManager from "./components/FileManager";
import { Sidebar } from "./components/layout/Sidebar";
import { ArticleCard } from "./components/feed/ArticleCard";
import { ArticleComposer } from "./components/editor/ArticleComposer";

export default function App() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState(() => localStorage.getItem("cms_view") || "feed");
  const [selectedCat, setSelectedCat] = useState("");

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem("cms_user");
    return saved ? JSON.parse(saved) : { username: "", isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem("cms_view", view);
  }, [view]);

  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gallery, setGallery] = useState<{name: string, url: string}[]>([]);
  const [icons, setIcons] = useState<{name: string, url: string}[]>([]);
  const [files, setFiles] = useState<{name: string, url: string, size: number}[]>([]);

  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        console.error(`Invalid JSON from ${url}:`, text.substring(0, 100));
        throw new Error(`Invalid JSON from ${url}`);
      }
    } catch (e) {
      console.error(`Fetch error for ${url}:`, e);
      throw e;
    }
  };

  const fetchIcons = async () => {
    try {
      const data = await safeFetch("/api/icons");
      setIcons(data);
    } catch (e) {}
  };

  const fetchGallery = async () => {
    try {
      const data = await safeFetch("/api/gallery");
      setGallery(data);
    } catch (e) {}
  };

  const fetchFiles = async () => {
    try {
      const data = await safeFetch("/api/files");
      setFiles(data);
    } catch (e) {}
  };

  const fetchData = async () => {
    try {
      const [cfg, art] = await Promise.all([
        safeFetch("/api/config"),
        safeFetch("/api/articles")
      ]);
      
      // Migration / Default Typography
      if (!cfg.typography) {
        cfg.typography = {
          global: { family: cfg.font || "Inter", size: cfg.fontSize || "16px", weight: "400", color: "" },
          menu: { family: cfg.font || "Inter", size: "14px", weight: "700", color: "" },
          articleTitle: { family: cfg.font || "Inter", size: "24px", weight: "900", color: "" },
          articleBody: { family: cfg.font || "Inter", size: "18px", weight: "400", color: "" },
          profileName: { family: cfg.font || "Inter", size: "20px", weight: "900", color: "" },
          profileHandle: { family: cfg.font || "Inter", size: "12px", weight: "400", color: "" },
          profileBio: { family: cfg.font || "Inter", size: "12px", weight: "400", color: "" },
        };
      } else {
        if (!cfg.typography.profileName) cfg.typography.profileName = { family: cfg.font || "Inter", size: "20px", weight: "900", color: "" };
        if (!cfg.typography.profileHandle) cfg.typography.profileHandle = { family: cfg.font || "Inter", size: "12px", weight: "400", color: "" };
        if (!cfg.typography.profileBio) cfg.typography.profileBio = { family: cfg.font || "Inter", size: "12px", weight: "400", color: "" };
      }
      
      setConfig(cfg);
      setArticles(art);
      if (user.isAuthenticated) {
        fetchIcons();
        fetchGallery();
        fetchFiles();
      }
    } catch (e) {
      console.error("Failed to fetch initial state", e);
    }
  };

  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    localStorage.setItem("cms_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (config?.theme) {
      document.documentElement.className = config.theme.toLowerCase();
      if (config.theme === "CUSTOM" && config.customColors) {
        document.documentElement.classList.add("custom-theme");
        Object.entries(config.customColors).forEach(([key, val]) => {
          document.documentElement.style.setProperty(`--custom-${key}`, val);
        });
      } else {
        document.documentElement.classList.remove("custom-theme");
      }
      
      const fontId = "dynamic-google-fonts";
      let link = document.getElementById(fontId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }

      // Collect all font families used
      const fonts = new Set<string>();
      if (config.font) fonts.add(config.font);
      if (config.typography) {
        Object.values(config.typography).forEach((t: any) => {
          if (t?.family) fonts.add(t.family);
        });
      }

      if (fonts.size > 0) {
        const families = Array.from(fonts).map(f => `${f.replace(/\s+/g, "+")}:wght@400;500;600;700;800;900`).join("&family=");
        link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
      }

      // Apply Base
      document.documentElement.style.fontFamily = `'${config.font || (config.typography?.global?.family) || "Inter"}', sans-serif`;
      document.documentElement.style.fontSize = config.fontSize || config.typography?.global?.size || "16px";

      // Apply Granular Variables
      if (config.typography) {
        Object.entries(config.typography).forEach(([key, val]: [string, any]) => {
          if (val.family) document.documentElement.style.setProperty(`--font-${key}`, `'${val.family}', sans-serif`);
          if (val.size) document.documentElement.style.setProperty(`--size-${key}`, val.size.includes('px') ? val.size : `${val.size}px`);
          if (val.color) document.documentElement.style.setProperty(`--color-${key}`, val.color);
          if (val.weight) document.documentElement.style.setProperty(`--weight-${key}`, val.weight);
        });
      }
    }
  }, [config]);

  // Handle Navigation State Persistence for Admin
  useEffect(() => {
    const handlePopState = () => {
      // Logic to prevent complete unmount if we want to stay in admin
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePost = async (data: any) => {
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) fetchData();
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value })
    });
    const data = await res.json();
    if (data.success) { 
      setUser({ username: "admin", isAuthenticated: true }); 
      setShowLogin(false); 
    } else {
      alert("Login Failed");
    }
  };

  const filtered = articles.filter(a => {
    if (selectedCat && a.category !== selectedCat && a.parentCategoryId !== selectedCat) return false;
    return true;
  });

  if (!config) return <div className="h-screen bg-dim-bg flex items-center justify-center animate-pulse text-white">Initializing CMS...</div>;

  return (
    <div className="h-screen bg-dim-bg flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar 
          config={config} 
          user={user} 
          view={view} 
          setView={setView} 
          selectedCat={selectedCat} 
          onSelectCat={setSelectedCat} 
          onLogin={() => setShowLogin(true)} 
          onLogout={() => setUser({username:"", isAuthenticated: false})} 
        />
      </div>

      {/* Main Surface */}
      <main className="flex-1 min-w-0 flex h-full bg-dim-bg relative overflow-hidden">
         {/* Mobile Header */}
         <header className="lg:hidden flex items-center justify-between p-4 border-b border-dim-border bg-dim-bg/80 backdrop-blur-md sticky top-0 z-20 w-full">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-white"><Menu className="w-6 h-6" /></button>
            <h1 className="font-bold truncate max-w-[200px] text-white">{config.siteName}</h1>
            <div className="w-8 h-8 rounded-full bg-twitter-blue" />
         </header>

         <div className="flex-1 flex flex-col h-full overflow-hidden">
            {view === "feed" && (
              <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
                <div className="w-full max-w-4xl mx-auto">
                  {user.isAuthenticated && (
                    <div className="p-6 md:p-10 pb-0">
                      <ArticleComposer 
                        config={config} 
                        onPost={handlePost} 
                        gallery={gallery} 
                        files={files}
                        onRefreshGallery={fetchGallery} 
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-10 space-y-4">
                    {filtered.length > 0 ? filtered.map(a => <ArticleCard key={a.id} article={a} config={config} />) : 
                      <div className="p-20 text-center opacity-20 text-white">
                        <Search className="w-20 h-20 mx-auto mb-4" />
                        <p className="text-xl">No articles found</p>
                      </div>
                    }
                  </div>
                  <footer className="p-12 text-center border-t border-dim-border/10 text-[10px] text-dim-muted tracking-widest uppercase">
                    {config.footerText}
                  </footer>
                </div>
              </div>
            )}

            {view === "admin" && (
              <div className="flex-1 h-full overflow-hidden">
                <AdminPanel 
            config={config} 
            articles={articles} 
            onUpdateConfig={setConfig} 
            onUpdateArticles={fetchData} 
            gallery={gallery}
            onRefreshGallery={fetchGallery}
            icons={icons}
            onRefreshIcons={fetchIcons}
            files={files}
          />
              </div>
            )}

            {view === "files" && (
              <div className="flex-1 overflow-y-auto h-full">
                <div className="max-w-6xl mx-auto p-6">
                   <FileManager isAdmin={user.isAuthenticated} />
                </div>
              </div>
            )}
         </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="absolute left-0 top-0 bottom-0 w-80 bg-dim-bg shadow-2xl overflow-hidden">
               <Sidebar config={config} user={user} view={view} setView={setView} selectedCat={selectedCat} onSelectCat={setSelectedCat} onLogin={() => setShowLogin(true)} onLogout={() => setUser({username:"", isAuthenticated: false})} />
            </motion.div>
          </div>
        )}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleLogin} className="bg-dim-card p-8 rounded-[40px] border border-dim-border w-full max-w-sm shadow-2xl space-y-6"
            >
              <h2 className="text-2xl font-black text-center text-white">ADMIN ACCESS</h2>
              <input name="username" placeholder="Username" className="w-full bg-dim-bg rounded-2xl p-4 focus:ring-1 focus:ring-twitter-blue outline-none text-white" required />
              <input name="password" type="password" placeholder="Password" className="w-full bg-dim-bg rounded-2xl p-4 focus:ring-1 focus:ring-twitter-blue outline-none text-white" required />
              <button className="w-full py-4 bg-twitter-blue rounded-full font-black text-sm uppercase tracking-widest shadow-xl text-white">Auth Verify</button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-dim-muted text-xs font-bold uppercase tracking-tighter">Cancel Connection</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
