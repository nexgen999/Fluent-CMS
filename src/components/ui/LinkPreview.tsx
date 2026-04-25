import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
  favicon?: string;
}

interface LinkPreviewProps {
  metadata: LinkMetadata;
}

export const LinkPreview = ({ metadata }: LinkPreviewProps) => {
  const isGithub = metadata.url.includes('github.com');

  return (
    <a 
      href={metadata.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block my-4 overflow-hidden rounded-[20px] border border-dim-border hover:bg-white/5 transition-all group"
    >
      <div className="flex flex-col sm:flex-row h-full">
        {metadata.image && (
          <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-auto overflow-hidden border-b sm:border-b-0 sm:border-r border-dim-border">
            <img 
              src={metadata.image} 
              alt={metadata.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {isGithub && (
              <div className="absolute top-3 left-3 p-1.5 bg-black/60 rounded-full backdrop-blur-md">
                <Github className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        )}
        
        <div className={`p-6 flex flex-col justify-center flex-1 ${!metadata.image ? 'w-full' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            {metadata.favicon && <img src={metadata.favicon} className="w-4 h-4 rounded-sm" alt="" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-dim-muted">
              {metadata.siteName || new URL(metadata.url).hostname}
            </span>
          </div>
          
          <h3 className="text-xl font-black text-white mb-2 line-clamp-2 leading-tight group-hover:text-twitter-blue transition-colors">
            {metadata.title}
          </h3>
          
          <p className="text-sm text-dim-muted line-clamp-3 leading-relaxed mb-4">
            {metadata.description}
          </p>
          
          <div className="flex items-center gap-2 text-twitter-blue font-bold text-xs">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{metadata.url}</span>
          </div>
        </div>
      </div>
    </a>
  );
};
