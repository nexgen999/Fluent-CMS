import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Palette, 
  Type, 
  ListOrdered, 
  FileEdit, 
  ImageIcon, 
  FolderOpen, 
  Settings, 
  Globe,
  Zap,
  Database,
  ShieldAlert
} from "lucide-react";
import { SiteConfig, Article } from "../types";
import { cn } from "../lib/utils";
import FileManager from "./FileManager";

// Modular Tabs
import { ProfileTab } from "./admin/ProfileTab";
import { SocialsTab } from "./admin/SocialsTab";
import { ThemeTab } from "./admin/ThemeTab";
import { FontsTab } from "./admin/FontsTab";
import { CategoriesTab } from "./admin/CategoriesTab";
import { ArticlesTab } from "./admin/ArticlesTab";
import { BackupTab } from "./admin/BackupTab";
import { GalleryTab } from "./admin/GalleryTab";
import { SecurityTab } from "./admin/SecurityTab";
import { IconsTab } from "./admin/IconsTab";
import { ArticleEditor } from "./editor/ArticleEditor";

interface AdminPanelProps {
  config: SiteConfig;
  articles: Article[];
  onUpdateConfig: (cfg: SiteConfig) => void;
  onUpdateArticles: () => void;
  gallery: {name: string, url: string}[];
  onRefreshGallery: () => void;
  icons: {name: string, url: string}[];
  onRefreshIcons: () => void;
  files: {name: string, url: string, size: number}[];
}

export default function AdminPanel({ 
  config, 
  articles, 
  onUpdateConfig, 
  onUpdateArticles, 
  gallery, 
  onRefreshGallery, 
  icons, 
  onRefreshIcons,
  files
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const handleSaveArticle = async (article: Article) => {
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article)
    });
    if (res.ok) {
      setEditingArticle(null);
      onUpdateArticles();
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
        setEditingArticle(null);
        onUpdateArticles();
        alert("Story disintegrated.");
    }
  };

  const tabs = [
    { id: "profile", label: "Identity & Profile", icon: UserIcon },
    { id: "articles", label: "Articles", icon: FileEdit },
    { id: "socials", label: "Connect & Socials", icon: Globe },
    { id: "theme", label: "Theme & Aesthetic", icon: Palette },
    { id: "fonts", label: "Typography", icon: Type },
    { id: "categories", label: "Catégories", icon: ListOrdered },
    { id: "gallery", label: "Media Assets", icon: ImageIcon },
    { id: "backup", label: "System & Backups", icon: Database },
    { id: "security", label: "Security & Access", icon: ShieldAlert },
    { id: "icons", label: "Visual Identifiers", icon: Zap },
    { id: "files", label: "Public Storage", icon: FolderOpen },
  ];

  return (
    <div className="flex h-full bg-dim-bg overflow-hidden relative">
      {/* Sidebar - Admin Sidebar */}
      <div className="w-72 border-r border-dim-border flex flex-col bg-dim-card overflow-hidden">
        <div className="p-6 border-b border-dim-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-twitter-blue" />
            Control Center
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold group",
                activeTab === tab.id ? "bg-twitter-blue text-white shadow-lg" : "text-dim-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-dim-muted group-hover:text-white")} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-dim-bg">
        <div className="max-w-5xl mx-auto p-12 space-y-16">
          {activeTab === "profile" && <ProfileTab config={config} onUpdateConfig={onUpdateConfig} />}
          {activeTab === "socials" && <SocialsTab config={config} onUpdateConfig={onUpdateConfig} icons={icons} />}
          {activeTab === "theme" && <ThemeTab config={config} onUpdateConfig={onUpdateConfig} />}
          {activeTab === "fonts" && <FontsTab config={config} onUpdateConfig={onUpdateConfig} />}
          {activeTab === "categories" && <CategoriesTab config={config} onUpdateConfig={onUpdateConfig} icons={icons} />}
          {activeTab === "articles" && <ArticlesTab config={config} articles={articles} onEdit={setEditingArticle} onRefresh={onUpdateArticles} />}
          {activeTab === "backup" && <BackupTab config={config} articles={articles} onUpdateConfig={onUpdateConfig} onUpdateArticles={(arts) => { onUpdateArticles(); }} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "gallery" && <GalleryTab gallery={gallery} onRefresh={onRefreshGallery} />}
          {activeTab === "icons" && <IconsTab icons={icons} onRefreshIcons={onRefreshIcons} />}
          {activeTab === "files" && (
             <section className="space-y-8 h-[calc(100vh-160px)] flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black italic tracking-tighter text-white">Centralized Repository</h3>
                </div>
                <div className="flex-1 rounded-[40px] border border-dim-border overflow-hidden shadow-2xl bg-dim-card">
                   <FileManager isAdmin={true} />
                </div>
             </section>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingArticle && (
        <ArticleEditor 
          article={editingArticle} 
          config={config} 
          gallery={gallery} 
          files={files}
          onClose={() => setEditingArticle(null)}
          onSave={handleSaveArticle}
          onDelete={handleDeleteArticle}
          onRefreshGallery={onRefreshGallery}
        />
      )}
    </div>
  );
}
