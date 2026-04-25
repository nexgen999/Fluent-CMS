import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Clock, 
  Tag,
  Link as LinkIcon,
  Check,
  Twitter,
  Facebook,
  Mail,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { Article, SiteConfig } from "../../types";
import { SmartIcon } from "../ui/SmartIcon";
import { LinkPreview } from "../ui/LinkPreview";
import { cn } from "../../lib/utils";
import { useRef } from "react";

interface ArticleCardProps {
  article: Article;
  config: SiteConfig;
}

export const ArticleCard = ({ article, config }: ArticleCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkMetadata, setLinkMetadata] = useState<any>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const category = config?.categories.find((c: any) => c.id === article.category);
  const parentCategory = category?.parentId ? config?.categories.find((c: any) => c.id === category.parentId) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const detectAndPreviewLink = async () => {
      // Parse HTML to get only visible text, ignoring URLs in attributes like src or href
      const parser = new DOMParser();
      const doc = parser.parseFromString(article.content, 'text/html');
      const visibleText = doc.body.innerText || doc.body.textContent || "";
      
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = visibleText.match(urlRegex);
      
      if (matches && matches.length > 0) {
        const url = matches[0].replace(/[",]$/, ""); // Clean up trailing punctuation
        try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
          const data = await res.json();
          if (data.title || data.description) {
            setLinkMetadata(data);
          }
        } catch (e) {
          console.error("Link preview error", e);
        }
      } else {
        setLinkMetadata(null);
      }
    };
    detectAndPreviewLink();
  }, [article.content]);

  const getShareUrl = () => {
    return window.location.origin + "?article=" + article.id;
  };

  const shareToX = () => {
    const url = getShareUrl();
    const text = `Read "${article.title}" on ${config.siteName}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareByEmail = () => {
    const url = getShareUrl();
    const subject = article.title;
    const body = `I thought you might find this article interesting: ${article.title}\n\nRead more here: ${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setShowShareMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareMain = () => {
    setShowShareMenu(!showShareMenu);
  };

  useEffect(() => {
    const handleCopyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest('.copy-code-button');
      if (copyBtn) {
        const container = copyBtn.closest('.code-block-wrapper');
        const codeElement = container?.querySelector('code');
        if (codeElement) {
          const text = codeElement.innerText;
          navigator.clipboard.writeText(text);
          
          const originalContent = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
          copyBtn.classList.add('bg-emerald-500/20', 'text-emerald-500');
          
          setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.remove('bg-emerald-500/20', 'text-emerald-500');
          }, 2000);
        }
      }
    };
    document.addEventListener('click', handleCopyClick);
    return () => document.removeEventListener('click', handleCopyClick);
  }, []);

  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 bg-dim-card border border-dim-border rounded-[32px] hover:border-twitter-blue/30 transition-all mb-8 shadow-xl">
      <div className="flex gap-4 mb-6 items-start">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-dim-border flex items-center justify-center shadow-inner overflow-hidden">
          <SmartIcon icon={category?.icon || "📄"} className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl text-white truncate pr-4 tracking-tight leading-none mb-1 article-title">{article.title || "Untitled Post"}</h3>
            <div className="text-[10px] uppercase font-black tracking-widest text-twitter-blue bg-twitter-blue/5 px-3 py-1 rounded-full border border-twitter-blue/20">
              {parentCategory ? `${parentCategory.name} • ` : ""}{category?.name || "Global"}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-dim-muted mt-1 opacity-60">
             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {format(new Date(article.date), "MMM d, yyyy • HH:mm")}</span>
             {article.subcategory && <span className="text-twitter-blue">#{article.subcategory}</span>}
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none prose-p:text-slate-200 prose-p:leading-relaxed prose-pre:bg-dim-bg prose-pre:border prose-pre:border-dim-border prose-img:rounded-3xl prose-img:border prose-img:border-dim-border prose-iframe:rounded-3xl prose-iframe:shadow-2xl prose-iframe:my-8 prose-figure:my-10 font-[inherit]">
        <div className="ck-content overflow-hidden article-body" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {linkMetadata && (
        <div className="mt-6 mb-4">
          <LinkPreview metadata={linkMetadata} />
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-8 border-t border-dim-border/40 text-dim-muted">
        <div className="flex flex-wrap gap-2">
          {article.tags && article.tags.map(tag => (
            <span key={tag} className="text-[10px] px-3 py-1 bg-dim-bg border border-dim-border rounded-lg text-dim-muted font-black flex items-center gap-1.5 uppercase tracking-[0.1em] hover:text-white transition-colors cursor-default">
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
        </div>
        
        <div className="relative" ref={shareMenuRef}>
          <button 
            onClick={handleShareMain}
            onContextMenu={(e) => { e.preventDefault(); setShowShareMenu(!showShareMenu); }}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 bg-white/5 border border-dim-border rounded-full transition-all group relative active:scale-95",
              showShareMenu ? "bg-twitter-blue border-twitter-blue text-white" : "hover:bg-twitter-blue hover:text-white hover:border-twitter-blue"
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Connected</span>
                </motion.div>
              ) : (
                <motion.div key="share" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Distribute</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute bottom-full right-0 mb-4 w-52 bg-dim-card border border-dim-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50 backdrop-blur-xl"
              >
                <div className="px-4 py-2 border-b border-dim-border/50">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-dim-muted">Relay Protocol</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-twitter-blue" /> Copy Link
                </button>
                <button 
                  onClick={shareToX}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors"
                >
                  <Twitter className="w-4 h-4 text-white p-0.5" /> Post to X
                </button>
                <button 
                  onClick={shareToFacebook}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors"
                >
                  <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                </button>
                <button 
                  onClick={shareByEmail}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-dim-muted" /> Email Node
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        .ck-content .inline-emoji {
          width: 1.25em;
          height: 1.25em;
          vertical-align: -0.25em;
          display: inline-block;
          margin: 0 0.1em;
        }
        .ck-content img:not(.inline-emoji) {
          max-width: 100%;
          height: auto;
          border-radius: 24px;
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.5);
        }
        .ck-content .code-block-wrapper {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 12px;
          margin: 1.5rem 0;
          overflow: hidden;
          position: relative;
        }
        .ck-content .code-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #161b22;
          border-bottom: 1px solid #30363d;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        }
        .ck-content .code-language {
          font-[11px];
          font-weight: 600;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ck-content .copy-code-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          color: #8b949e;
          font-[11px];
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #30363d;
          background: #21262d;
          text-transform: uppercase;
        }
        .ck-content .copy-code-button:hover {
          background: #30363d;
          color: #c9d1d9;
        }
        .ck-content .code-block-wrapper pre {
          margin: 0 !important;
          padding: 16px !important;
          background: transparent !important;
          border: none !important;
          overflow-x: auto;
        }
        .ck-content .code-block-wrapper code {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-size: 13.6px;
          line-height: 1.45;
          color: #e6edf3;
        }
      `}</style>
    </motion.article>
  );
};
