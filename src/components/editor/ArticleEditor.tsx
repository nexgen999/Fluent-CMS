import React, { useState, useRef, useEffect } from "react";
import { X, Save, Trash2, Layout, Eye, Smile, Image as ImageIcon, File as FileIcon, Link as LinkIcon, Search, ChevronDown, Youtube, MonitorPlay, Hash, Upload, HardDrive, Code, Copy, Music } from "lucide-react";
import { SiteConfig, Article } from "../../types";
import { EmojiProvider, EmojiAsset, ALL_EMOJIS, EMOJI_CATEGORIES, getEmojiUrl } from "./emojis/EmojiBundles";
import { LinkPreview } from "../ui/LinkPreview";
import FileManager from "../FileManager";

interface ArticleEditorProps {
  article: Article;
  config: SiteConfig;
  gallery: { name: string, url: string }[];
  files: { name: string, url: string, size: number }[];
  onClose: () => void;
  onSave: (article: Article) => void;
  onDelete: (id: string) => void;
  onRefreshGallery?: () => void;
}

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
  favicon?: string;
}

export const ArticleEditor = ({ 
    article, 
    config, 
    gallery, 
    files, 
    onClose, 
    onSave, 
    onDelete, 
    onRefreshGallery 
}: ArticleEditorProps) => {
  const [editingArticle, setEditingArticle] = useState<Article>(article);
  const [activeTab, setActiveTab] = useState<"content" | "meta" | "preview">("content");
  const [showGallery, setShowGallery] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [icons, setIcons] = useState<{name: string, url: string}[]>([]);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showFilesMenu, setShowFilesMenu] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlFile, setUrlFile] = useState({ name: "", url: "" });
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [activeEmojiCategory, setActiveEmojiCategory] = useState("smileys");
  const [activeEmojiProvider, setActiveEmojiProvider] = useState<EmojiProvider>('google');
  const [tags, setTags] = useState<string[]>(article.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
  const [linkMetadata, setLinkMetadata] = useState<LinkMetadata | null>(null);
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("bash");
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [showMusicInput, setShowMusicInput] = useState(false);
  const [musicService, setMusicService] = useState<"spotify" | "soundcloud" | "deezer" | "youtube">("spotify");
  const [musicUrl, setMusicUrl] = useState("");
  
  const resourceMenuRef = useRef<HTMLDivElement>(null);
  const musicMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setShowImageMenu(false);
      }
      if (resourceMenuRef.current && !resourceMenuRef.current.contains(event.target as Node)) {
        setShowFilesMenu(false);
      }
      if (musicMenuRef.current && !musicMenuRef.current.contains(event.target as Node)) {
        setShowMusicMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMusicInsert = () => {
    if (!musicUrl.trim()) return;

    let iframeUrl = "";
    let height = 352;

    if (musicService === "spotify") {
      // https://open.spotify.com/track/4cOdzh0s2UDuR97pPueB3M?si=...
      // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM3M?si=...
      const idMatch = musicUrl.match(/\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/);
      if (idMatch) {
         iframeUrl = `https://open.spotify.com/embed/${idMatch[1]}/${idMatch[2]}?utm_source=generator`;
      }
    } else if (musicService === "soundcloud") {
      iframeUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(musicUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
      height = 166;
    } else if (musicService === "deezer") {
      // Improved regex to handle /fr/ and other locales
      const idMatch = musicUrl.match(/\/(track|playlist|album)\/([0-9]+)/);
      if (idMatch) {
        // Using the modern widget URL
        iframeUrl = `https://widget.deezer.com/widget/dark/${idMatch[1]}/${idMatch[2]}`;
        height = 350;
      }
    } else if (musicService === "youtube") {
      // music.youtube.com/watch?v=ID
      const vMatch = musicUrl.match(/[?&]v=([^&]+)/);
      if (vMatch) {
        iframeUrl = `https://www.youtube.com/embed/${vMatch[1]}`;
      }
    }

    if (iframeUrl) {
      const html = `<div class="music-embed-wrapper" style="margin: 1.5rem 0;"><iframe src="${iframeUrl}" width="100%" height="${height}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: #000;"></iframe></div><br/>`;
      insertHtmlAtCursor(html);
    }

    setMusicUrl("");
    setShowMusicInput(false);
  };

  const fetchIcons = async () => {
    try {
      const res = await fetch('/api/icons');
      const data = await res.json();
      setIcons(data);
      setShowIcons(true);
      setShowImageMenu(false);
    } catch (e) {
      console.error("Failed to fetch icons", e);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch('/api/upload/pictures?folder=articles', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        insertImage(data.url);
        onRefreshGallery?.();
      }
    } catch (e) {
      console.error("Upload failed", e);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      setShowImageMenu(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Link detection logic
  useEffect(() => {
    const detectLink = async () => {
      if (!editorRef.current) return;
      const text = editorRef.current.innerText;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = text.match(urlRegex);
      
      if (matches && matches.length > 0) {
        const lastUrl = matches[matches.length - 1];
        if (!linkMetadata || linkMetadata.url !== lastUrl) {
          setIsFetchingLink(true);
          try {
            const res = await fetch(`/api/link-preview?url=${encodeURIComponent(lastUrl)}`);
            const data = await res.json();
            if (data.title || data.description) {
              setLinkMetadata(data);
            }
          } catch (e) {
            console.error("Failed to fetch link preview", e);
          } finally {
            setIsFetchingLink(false);
          }
        }
      } else {
        setLinkMetadata(null);
      }
    };

    const observer = new MutationObserver(detectLink);
    if (editorRef.current) {
      observer.observe(editorRef.current, { childList: true, characterData: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [linkMetadata]);

  const handleSave = () => {
    const htmlContent = editorRef.current?.innerHTML || editingArticle.content;
    onSave({
      ...editingArticle,
      content: htmlContent,
      tags: tags
    });
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
        editorRef.current.innerHTML += html;
        return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement("div");
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    let lastNode;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const insertImage = (url: string) => {
    insertHtmlAtCursor(`<img src="${url}" class="article-image" alt="" style="max-width: 100%; height: auto; border-radius: 16px; margin: 12px 0;" />\n`);
    setShowGallery(false);
  };

  const insertFile = (file: any) => {
    insertHtmlAtCursor(`<a href="${file.url}" target="_blank" class="shared-resource-link" style="display: block; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); text-decoration: none; color: #1d9bf0;">🔗 ${file.name}</a>\n`);
    setShowFiles(false);
  };

  const insertEmoji = (emoji: EmojiAsset) => {
    const emojiUrl = getEmojiUrl(emoji.unicode, activeEmojiProvider);
    insertHtmlAtCursor(`<img src="${emojiUrl}" alt="${emoji.shortcode}" class="inline-emoji" style="width: 24px; height: 24px; vertical-align: middle; display: inline-block; margin: 0 2px;" data-emoji-unicode="${emoji.unicode}" />`);
  };

  const handleYoutubeInsert = () => {
    let videoId = "";
    if (youtubeUrl.includes("v=")) {
      videoId = youtubeUrl.split("v=")[1].split("&")[0];
    } else if (youtubeUrl.includes("youtu.be/")) {
      videoId = youtubeUrl.split("youtu.be/")[1].split("?")[0];
    }
    
    if (videoId) {
      const html = `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); margin: 2rem 0; box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);">
          <iframe src="https://www.youtube.com/embed/${videoId}" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>
      `;
      insertHtmlAtCursor(html);
      setYoutubeUrl("");
      setShowYoutubeInput(false);
    }
  };

  const handleEmbedInsert = () => {
    if (!embedCode.trim()) return;
    
    let finalHtml = embedCode;
    const isUrl = embedCode.startsWith("http") && !embedCode.includes("<");

    if (isUrl) {
      finalHtml = `
        <div style="display: flex; justify-content: center; width: 100%; margin: 2.5rem 0;">
          <iframe 
            src="${embedCode.trim()}" 
            frameborder="0" 
            marginwidth="0" 
            marginheight="0" 
            scrolling="NO" 
            width="720" 
            height="480" 
            allowfullscreen 
            style="max-width: 100%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);"
          ></iframe>
        </div>
      `;
    } else if (embedCode.includes("<iframe")) {
      finalHtml = `
        <div style="display: flex; justify-content: center; width: 100%; margin: 2.5rem 0;">
          ${embedCode}
        </div>
      `;
    }

    insertHtmlAtCursor(finalHtml);
    setEmbedCode("");
    setShowEmbedInput(false);
  };

  const handleCodeInsert = () => {
    if (!codeContent.trim()) return;
    
    const escapedCode = codeContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const html = `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">${codeLanguage}</span>
          <button class="copy-code-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
            Copy
          </button>
        </div>
        <pre><code class="language-${codeLanguage}">${escapedCode}</code></pre>
      </div><br/>
    `;
    
    insertHtmlAtCursor(html);
    setCodeContent("");
    setShowCodeInput(false);
  };

  const filteredEmojis = emojiSearch 
    ? ALL_EMOJIS.filter(e => e.name.toLowerCase().includes(emojiSearch.toLowerCase()) || e.shortcode.includes(emojiSearch.toLowerCase()))
    : ALL_EMOJIS.filter(e => e.category === activeEmojiCategory);

  const providers: { id: EmojiProvider, label: string }[] = [
    { id: 'apple', label: 'Apple' },
    { id: 'google', label: 'Google' },
    { id: 'microsoft', label: 'Fluent' },
    { id: 'twitter', label: 'Twitter' },
    { id: 'facebook', label: 'Facebook' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-dim-bg">
      {/* Header */}
      <header className="h-20 border-b border-dim-border flex items-center justify-between px-8 bg-dim-card/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-dim-muted" /></button>
          <div className="h-8 w-[1px] bg-dim-border" />
          <h2 className="text-xl font-black uppercase tracking-widest text-white truncate max-w-md">
            {article.id ? `Editing Module` : "Create Module"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-dim-bg p-1 rounded-xl border border-dim-border">
              {["content", "meta", "preview"].map((tab: any) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-black" : "text-dim-muted hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
           </div>

           <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-twitter-blue text-white rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-twitter-blue/20"
           >
             <Save className="w-4 h-4" /> Save
           </button>
           
           {article.id && (
             <button 
              onClick={() => onDelete(article.id)}
              className="p-3 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
             >
               <Trash2 className="w-5 h-5" />
             </button>
           )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden flex">
         <div className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8">
               
               {activeTab === "content" && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <input 
                      value={editingArticle.title}
                      onChange={e => setEditingArticle({...editingArticle, title: e.target.value})}
                      placeholder="Module Title..."
                      className="w-full bg-transparent text-4xl md:text-6xl font-black focus:outline-none placeholder:text-dim-muted/10 tracking-tighter text-white"
                    />

                    <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-dim-border/30">
                       <div className="relative" ref={imageMenuRef}>
                         <button 
                          onClick={() => setShowImageMenu(!showImageMenu)} 
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showImageMenu ? 'bg-twitter-blue/20 border-twitter-blue text-twitter-blue' : 'bg-white/5 hover:bg-white/10 border-dim-border text-twitter-blue'}`}
                         >
                           <ImageIcon className="w-3.5 h-3.5" /> Image
                         </button>

                         {showImageMenu && (
                           <div className="absolute top-full left-0 mt-2 w-56 bg-dim-card border border-dim-border rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
                             <button 
                               onClick={() => { setShowGallery(true); setShowImageMenu(false); }}
                               className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white"
                             >
                               <ImageIcon className="w-4 h-4 text-twitter-blue" /> Archive Assets
                             </button>
                             <button 
                               onClick={fetchIcons}
                               className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white"
                             >
                               <HardDrive className="w-4 h-4 text-emerald-500" /> Platform Icons
                             </button>
                             <button 
                               onClick={() => fileInputRef.current?.click()}
                               className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white"
                             >
                               <Upload className="w-4 h-4 text-amber-500" /> Upload from PC
                             </button>
                             <input 
                               type="file" 
                               ref={fileInputRef} 
                               className="hidden" 
                               accept="image/*" 
                               onChange={onFileChange}
                             />
                           </div>
                         )}
                       </div>

                       <button onClick={() => setShowEmoji(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-dim-border rounded-xl text-[9px] font-black uppercase tracking-widest text-twitter-blue transition-all">
                         <Smile className="w-3.5 h-3.5" /> Emoji
                       </button>
                       <div className="relative" ref={resourceMenuRef}>
                         <button 
                           onClick={() => setShowFilesMenu(!showFilesMenu)} 
                           className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showFilesMenu ? 'bg-twitter-blue/20 border-twitter-blue text-twitter-blue' : 'bg-white/5 hover:bg-white/10 border-dim-border text-twitter-blue'}`}
                         >
                           <FileIcon className="w-3.5 h-3.5" /> Resource
                         </button>

                         {showFilesMenu && (
                           <div className="absolute top-full left-0 mt-2 w-56 bg-dim-card border border-dim-border rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
                             <button 
                               onClick={() => { setShowFiles(true); setShowFilesMenu(false); }}
                               className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white"
                             >
                               <HardDrive className="w-4 h-4 text-twitter-blue" /> From Explorer
                             </button>
                             <button 
                               onClick={() => { setShowUrlInput(true); setShowFilesMenu(false); }}
                               className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white"
                             >
                               <LinkIcon className="w-4 h-4 text-emerald-500" /> From Direct URL
                             </button>
                           </div>
                         )}
                       </div>
                       <button onClick={() => setShowYoutubeInput(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-dim-border rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 transition-all">
                         <Youtube className="w-3.5 h-3.5" /> YouTube
                       </button>
                       <button onClick={() => setShowEmbedInput(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-dim-border rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-500 transition-all">
                         <MonitorPlay className="w-3.5 h-3.5" /> Embed
                       </button>
                       <button onClick={() => setShowTagModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-dim-border rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-500 transition-all">
                         <Hash className="w-3.5 h-3.5" /> Tags ({tags.length})
                       </button>
                       <button onClick={() => setShowCodeInput(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-dim-border rounded-xl text-[9px] font-black uppercase tracking-widest text-dim-muted transition-all">
                         <Code className="w-3.5 h-3.5" /> Code
                       </button>
                    </div>

                    <div className="relative editor-visual-surface">
                      <div
                        ref={editorRef}
                        contentEditable
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        data-placeholder="Construct the narrative..."
                        className="w-full bg-transparent text-lg text-dim-muted min-h-[400px] focus:outline-none data-placeholder-styled leading-relaxed"
                      />
                      {linkMetadata && (
                        <div className="mt-4 relative group/preview">
                          <LinkPreview metadata={linkMetadata} />
                          <button 
                            onClick={() => setLinkMetadata(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-all z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {isFetchingLink && (
                        <div className="mt-4 p-6 border border-dim-border rounded-[20px] animate-pulse bg-white/5 flex items-center gap-4">
                          <div className="w-20 h-20 bg-white/10 rounded-xl" />
                          <div className="space-y-3 flex-1">
                            <div className="h-4 bg-white/10 rounded w-1/4" />
                            <div className="h-6 bg-white/10 rounded w-3/4" />
                            <div className="h-3 bg-white/10 rounded w-1/2" />
                          </div>
                        </div>
                      )}
                      <style>{`
                        .editor-visual-surface [contentEditable]:empty:before {
                          content: attr(data-placeholder);
                          color: rgba(255,255,255,0.1);
                          pointer-events: none;
                          display: block;
                        }
                        .inline-emoji {
                          width: 1.25em;
                          height: 1.25em;
                          vertical-align: -0.25em;
                          display: inline-block;
                          margin: 0 0.1em;
                        }
                      `}</style>
                    </div>
                 </div>
               )}

               {activeTab === "meta" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-8">
                       <h3 className="text-sm font-black uppercase tracking-widest text-twitter-blue">Categorization</h3>
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted px-2">Primary Silo</label>
                          <select 
                            value={editingArticle.category}
                            onChange={e => setEditingArticle({...editingArticle, category: e.target.value})}
                            className="w-full bg-dim-card border border-dim-border rounded-2xl p-4 text-sm focus:border-twitter-blue outline-none transition-colors text-white"
                          >
                             {config.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-sm font-black uppercase tracking-widest text-twitter-blue">Metadata & Tags</h3>
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted px-2">Knowledge Tags</label>
                          <button 
                            onClick={() => setShowTagModal(true)}
                            className="w-full bg-dim-card border border-dim-border rounded-2xl p-6 text-sm hover:border-amber-500 transition-colors text-white text-left flex items-center justify-between group"
                          >
                            <div className="flex flex-wrap gap-2">
                               {tags.map(t => (
                                 <span key={t} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 border border-dim-border">
                                   <Hash className="w-2.5 h-2.5 text-amber-500" /> {t}
                                 </span>
                               ))}
                               {tags.length === 0 && <span className="text-dim-muted italic">Click to manage tags...</span>}
                            </div>
                            <Hash className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                          </button>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === "preview" && (
                 <div className="bg-dim-card border border-dim-border rounded-[40px] p-6 md:p-12 animate-in fade-in zoom-in-95 duration-300">
                   <h1 className="text-4xl font-black mb-8 text-white">{editingArticle.title}</h1>
                   <div className="ck-content leading-relaxed" dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || editingArticle.content }} />
                 </div>
               )}

            </div>
         </div>
      </div>

      {/* Icon Picker Modal */}
      {showIcons && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowIcons(false)}>
           <div className="bg-dim-card w-full max-w-4xl max-h-[80vh] rounded-[40px] border border-dim-border flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-dim-border flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><HardDrive className="text-emerald-500" /> Platform Icons</h3>
                 <button onClick={() => setShowIcons(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {Array.isArray(icons) && icons.map(icon => (
                   <div key={icon.url} onClick={() => { insertImage(icon.url); setShowIcons(false); }} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 border border-dim-border group relative transition-all p-4 bg-white/5">
                     <img src={icon.url} className="w-full h-full object-contain" alt="" />
                     <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase">Insert</div>
                   </div>
                 ))}
                 {icons.length === 0 && <p className="col-span-full py-20 text-center text-dim-muted italic">No icons available.</p>}
              </div>
           </div>
        </div>
      )}

      {/* Shared Modals */}
      {showGallery && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setShowGallery(false)}>
           <div className="bg-dim-card w-full max-w-4xl max-h-[80vh] rounded-[40px] border border-dim-border flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-dim-border flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><ImageIcon className="text-twitter-blue" /> Archive Assets</h3>
                 <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {Array.isArray(gallery) && gallery.map(img => (
                   <div key={img.url} className="group relative aspect-square bg-dim-bg border border-dim-border rounded-2xl overflow-hidden cursor-pointer hover:border-twitter-blue transition-all" onClick={() => insertImage(img.url)}>
                     <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 bg-twitter-blue/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase">Insert</div>
                   </div>
                 ))}
                 {gallery.length === 0 && <p className="col-span-full py-20 text-center text-dim-muted italic">No assets available.</p>}
              </div>
           </div>
        </div>
      )}

      {/* File Picker Modal - Full Explorer */}
      {showFiles && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setShowFiles(false)}>
           <div className="bg-dim-card w-full max-w-5xl h-[80vh] rounded-[40px] border border-dim-border flex flex-col overflow-hidden shadow-2xl focus-none" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-dim-border flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><FileIcon className="text-twitter-blue" /> Centralized Repository Inquiry</h3>
                 <button onClick={() => setShowFiles(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                 <FileManager isAdmin={true} onSelectFile={(url) => {
                    const name = url.split('/').pop() || "Resource";
                    insertFile({ name, url });
                    setShowFiles(false);
                 }} />
              </div>
           </div>
        </div>
      )}

      {/* URL File Input Modal */}
      {showUrlInput && (
        <div className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowUrlInput(false)}>
           <div className="bg-dim-card w-full max-w-lg rounded-[40px] border border-dim-border p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><LinkIcon className="text-emerald-500" /> Direct Link Injection</h3>
                <button onClick={() => setShowUrlInput(false)} className="p-2 hover:bg-white/5 rounded-full text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted mb-2 px-2">Resource Name</label>
                  <input 
                    autoFocus
                    value={urlFile.name}
                    onChange={e => setUrlFile({...urlFile, name: e.target.value})}
                    placeholder="e.g. Project Documentation"
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted mb-2 px-2">Source URL</label>
                  <input 
                    value={urlFile.url}
                    onChange={e => setUrlFile({...urlFile, url: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (urlFile.name && urlFile.url) {
                    insertFile(urlFile);
                    setUrlFile({ name: "", url: "" });
                    setShowUrlInput(false);
                  }
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Assemble Resource
              </button>
           </div>
        </div>
      )}

      {/* Emoji Modal */}
      {showEmoji && (
        <div className="fixed inset-0 z-[205] bg-black/40 flex items-center justify-center backdrop-blur-sm" onClick={() => setShowEmoji(false)}>
           <div className="w-full max-w-lg bg-dim-card border border-dim-border rounded-[40px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh] m-4" onClick={e => e.stopPropagation()}>
              {/* Header with Search */}
              <div className="p-6 border-b border-dim-border space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white">Emoji Universe</h3>
                  <button onClick={() => setShowEmoji(false)} className="p-1 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-dim-muted" /></button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim-muted" />
                  <input 
                    autoFocus
                    value={emojiSearch}
                    onChange={e => setEmojiSearch(e.target.value)}
                    placeholder="Search all emojis..."
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-twitter-blue outline-none transition-all"
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div className="bg-dim-bg border-b border-dim-border flex items-center p-1 overflow-x-auto no-scrollbar">
                {providers.map(p => (
                  <button 
                  key={p.id}
                  onClick={() => setActiveEmojiProvider(p.id)}
                  className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest shrink-0 transition-all rounded-full ${activeEmojiProvider === p.id ? "bg-twitter-blue text-white" : "text-dim-muted hover:text-white"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Categories */}
              <div className="bg-dim-card border-b border-dim-border p-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {EMOJI_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveEmojiCategory(cat.id); setEmojiSearch(""); }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${activeEmojiCategory === cat.id && !emojiSearch ? "bg-twitter-blue/10 border-twitter-blue text-twitter-blue shadow-lg shadow-twitter-blue/5" : "border-dim-border text-dim-muted hover:bg-white/5 hover:text-white"}`}
                  >
                    <span className="text-xs">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                 <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                    {filteredEmojis.map(emoji => (
                      <button 
                        key={emoji.unicode}
                        onClick={() => insertEmoji(emoji)}
                        className="aspect-square flex items-center justify-center p-2 rounded-2xl hover:bg-white/10 transition-all hover:scale-125 active:scale-95 group relative"
                        title={emoji.name}
                      >
                        <img 
                          src={getEmojiUrl(emoji.unicode, activeEmojiProvider)} 
                          alt={emoji.shortcode} 
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-1.5 rounded-lg text-[9px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-dim-border shadow-2xl">
                          {emoji.name}
                        </div>
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* YouTube Input Modal */}
      {showYoutubeInput && (
        <div className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowYoutubeInput(false)}>
           <div className="bg-dim-card w-full max-w-lg rounded-[40px] border border-dim-border p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><Youtube className="text-red-500" /> Broadcast Channel</h3>
                <button onClick={() => setShowYoutubeInput(false)} className="p-2 hover:bg-white/5 rounded-full text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-sm text-dim-muted">Paste a YouTube URL to embed a high-performance player.</p>
              <input 
                autoFocus
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-red-500 outline-none transition-all"
              />
              <button 
                onClick={handleYoutubeInsert}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Sync Stream
              </button>
           </div>
        </div>
      )}

      {/* Embed Input Modal */}
      {showEmbedInput && (
        <div className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowEmbedInput(false)}>
           <div className="bg-dim-card w-full max-w-lg rounded-[40px] border border-dim-border p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><MonitorPlay className="text-emerald-500" /> External Node</h3>
                <button onClick={() => setShowEmbedInput(false)} className="p-2 hover:bg-white/5 rounded-full text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-sm text-dim-muted">Paste raw iframe code or specialized video links for advanced rendering.</p>
              <textarea 
                autoFocus
                value={embedCode}
                onChange={e => setEmbedCode(e.target.value)}
                rows={4}
                placeholder='<iframe src="..." ...></iframe>'
                className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-mono text-xs"
              />
              <button 
                onClick={handleEmbedInsert}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Inject Node
              </button>
           </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowTagModal(false)}>
           <div className="bg-dim-card w-full max-w-lg rounded-[40px] border border-dim-border p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><Hash className="text-amber-500" /> Knowledge Tags</h3>
                <button onClick={() => setShowTagModal(false)} className="p-2 hover:bg-white/5 rounded-full text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-dim-muted">Assign tags to index your article in the platform's knowledge graph.</p>
                
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="Enter tag..."
                    className="flex-1 bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-amber-500 outline-none transition-all"
                  />
                  <button 
                    onClick={addTag}
                    className="px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="group flex items-center gap-2 px-4 py-2 bg-white/5 border border-dim-border rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:border-amber-500/50 transition-all shadow-sm"
                    >
                      <Hash className="w-3 h-3 text-amber-500" />
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="p-1 hover:bg-red-500/20 rounded-full text-dim-muted hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <div className="w-full py-8 text-center border-2 border-dashed border-dim-border rounded-[32px]">
                      <p className="text-xs text-dim-muted uppercase font-black tracking-widest opacity-30">No tags assigned</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowTagModal(false)}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-amber-50"
              >
                Done
              </button>
           </div>
        </div>
      )}

      {/* Music Input Modal */}
      {showMusicInput && (
        <div className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowMusicInput(false)}>
           <div className="bg-dim-card w-full max-w-lg rounded-[40px] border border-dim-border p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                  <Music className="text-pink-500" /> {musicService.charAt(0).toUpperCase() + musicService.slice(1)} Integration
                </h3>
                <button onClick={() => setShowMusicInput(false)} className="p-2 hover:bg-white/5 rounded-full text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted mb-2 px-2">{musicService.charAt(0).toUpperCase() + musicService.slice(1)} Link / URL</label>
                  <input 
                    autoFocus
                    value={musicUrl}
                    onChange={e => setMusicUrl(e.target.value)}
                    placeholder={`Paste ${musicService} track or playlist URL...`}
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-pink-500 outline-none transition-all"
                  />
                  <p className="mt-2 text-[9px] text-dim-muted uppercase font-bold px-2">Example: {musicService === 'spotify' ? 'https://open.spotify.com/track/...' : musicService === 'soundcloud' ? 'https://soundcloud.com/...' : musicService === 'deezer' ? 'https://www.deezer.com/track/...' : 'https://music.youtube.com/watch?v=...'}</p>
                </div>
              </div>
              <button 
                onClick={handleMusicInsert}
                className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Assemble Audio Pipeline
              </button>
           </div>
        </div>
      )}

      {/* Code Input Modal */}
      {showCodeInput && (
        <div className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowCodeInput(false)}>
           <div className="bg-dim-card w-full max-w-2xl rounded-[40px] border border-dim-border p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3"><Code className="text-twitter-blue" /> Source Code Injection</h3>
                <button onClick={() => setShowCodeInput(false)} className="p-2 hover:bg-white/5 rounded-full text-dim-muted"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted mb-2 px-2">Language</label>
                    <select 
                      value={codeLanguage}
                      onChange={e => setCodeLanguage(e.target.value)}
                      className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-twitter-blue outline-none transition-all appearance-none"
                    >
                      <option value="bash">Terminal / Bash</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="python">Python</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-dim-muted mb-2 px-2">Content</label>
                  <textarea 
                    autoFocus
                    value={codeContent}
                    onChange={e => setCodeContent(e.target.value)}
                    rows={8}
                    placeholder="Enter your code snippet here..."
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl px-6 py-4 text-white focus:border-twitter-blue outline-none transition-all font-mono text-xs custom-scrollbar"
                  />
                </div>
              </div>
              <button 
                onClick={handleCodeInsert}
                className="w-full py-4 bg-twitter-blue hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-twitter-blue/20"
              >
                Insert Code Block
              </button>
           </div>
        </div>
      )}

    </div>
  );
};
