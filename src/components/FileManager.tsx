import { useState, useEffect, useRef } from "react";
import { 
  File, 
  Folder, 
  Download, 
  Trash2, 
  Search, 
  ArrowLeft,
  FileText,
  FileImage,
  FileVideo,
  FileCode,
  FileArchive,
  Upload,
  Plus,
  Edit2,
  MoreVertical,
  ChevronRight,
  FolderPlus,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

interface FileInfo {
  name: string;
  url: string | null;
  size: number;
  mtime: string;
  isDirectory: boolean;
  path: string;
}

export default function FileManager({ isAdmin, onSelectFile }: { isAdmin?: boolean, onSelectFile?: (url: string) => void }) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (path: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?subDir=${encodeURIComponent(path)}`);
      const data = await res.json();
      setFiles(data);
    } catch (e) {
      console.error("Failed to fetch files", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handleDelete = async (file: FileInfo) => {
    if (!isAdmin) return;
    const type = file.isDirectory ? "folder" : "file";
    if (!confirm(`Are you sure you want to delete this ${type}: ${file.name}?`)) return;
    
    try {
      await fetch(`/api/media/files/${encodeURIComponent(file.path)}`, { method: "DELETE" });
      fetchFiles(currentPath);
    } catch (e) {
      alert("Failed to delete entry");
    }
  };

  const handleCreateFolder = async () => {
    if (!isAdmin) return;
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const path = currentPath ? `${currentPath}/${folderName}` : folderName;
      await fetch("/api/files/mkdir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      fetchFiles(currentPath);
    } catch (e) {
      alert("Failed to create folder");
    }
  };

  const handleRename = async (file: FileInfo) => {
    if (!isAdmin || !newName || newName === file.name) {
      setRenaming(null);
      return;
    }

    try {
      const parent = file.path.substring(0, file.path.lastIndexOf(file.name));
      const newPath = parent + newName;
      
      await fetch("/api/files/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath: file.path, newPath })
      });
      fetchFiles(currentPath);
      setRenaming(null);
    } catch (e) {
      alert("Failed to rename");
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!isAdmin || !fileList) return;
    
    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
       formData.append("file", fileList[i]);
    }

    try {
      await fetch(`/api/upload/files?folder=${encodeURIComponent(currentPath)}`, {
        method: "POST",
        body: formData
      });
      fetchFiles(currentPath);
    } catch (e) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isAdmin) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const getIcon = (file: FileInfo) => {
    if (file.isDirectory) return <Folder className="w-5 h-5 text-twitter-blue fill-twitter-blue/20" />;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext!)) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext!)) return <FileVideo className="w-5 h-5 text-purple-400" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext!)) return <FileArchive className="w-5 h-5 text-yellow-400" />;
    if (['js', 'ts', 'tsx', 'html', 'css', 'json', 'md'].includes(ext!)) return <FileCode className="w-5 h-5 text-green-400" />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext!)) return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  
  const breadcrumbs = currentPath.split("/").filter(Boolean);

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-dim-bg border border-dim-border rounded-3xl overflow-hidden transition-all",
        isDragging && "ring-4 ring-twitter-blue/50 border-twitter-blue"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 border-b border-dim-border bg-dim-card/50 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={() => setCurrentPath("")}
            className="p-2 hover:bg-white/5 rounded-xl text-twitter-blue shrink-0"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <div className="flex items-center text-sm font-bold text-dim-muted overflow-hidden">
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center shrink-0">
                <ChevronRight className="w-4 h-4 mx-1 opacity-30" />
                <button 
                  onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join("/"))}
                  className="hover:text-white transition-colors truncate max-w-[100px]"
                >
                  {crumb}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim-muted" />
            <input 
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-dim-bg border border-dim-border rounded-full py-2 pl-10 pr-4 text-xs w-48 focus:ring-1 focus:ring-twitter-blue outline-none"
            />
          </div>
          
          {isAdmin && (
            <>
              <button 
                onClick={handleCreateFolder}
                className="p-2 hover:bg-twitter-blue/20 text-twitter-blue rounded-xl flex items-center gap-2"
                title="New Folder"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-twitter-blue text-white rounded-xl flex items-center gap-2 px-4 font-bold text-xs"
              >
                <Upload className="w-4 h-4" /> UPLOAD
              </button>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={(e) => handleUpload(e.target.files)} 
              />
            </>
          )}
        </div>
      </div>

      {/* Grid view or Table view? Let's go with a cleaner responsive list */}
      <div className="flex-1 overflow-auto custom-scrollbar p-2">
         {loading ? (
            <div className="h-full flex items-center justify-center p-20 opacity-40 italic">
               Synchronizing Matrix...
            </div>
         ) : filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-20 opacity-30">
               <Folder className="w-16 h-16 mb-4" />
               <p className="font-bold">Digital Void</p>
               <p className="text-xs">No entries detected in this node.</p>
            </div>
         ) : (
           <div className="grid grid-cols-1 gap-1">
              {filtered.map(file => (
                <div 
                  key={file.path}
                  onClick={() => {
                    if (file.isDirectory) {
                      setCurrentPath(file.path);
                    } else if (onSelectFile && file.url) {
                      onSelectFile(file.url);
                    }
                  }}
                  className="group flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-dim-border"
                >
                  <div className="shrink-0 p-2 bg-dim-card rounded-xl border border-dim-border group-hover:border-twitter-blue/30 transition-colors">
                    {getIcon(file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {renaming === file.path ? (
                      <input 
                        autoFocus
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onBlur={() => handleRename(file)}
                        onKeyDown={e => e.key === 'Enter' && handleRename(file)}
                        className="bg-dim-bg border border-twitter-blue rounded px-2 py-1 text-sm text-white w-full"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-bold text-dim-text truncate group-hover:text-twitter-blue">
                        {file.name}
                      </p>
                    )}
                    <p className="text-[10px] text-dim-muted uppercase font-black tracking-widest opacity-60">
                      {file.isDirectory ? "Folder" : formatSize(file.size)} • {format(new Date(file.mtime), "MMM d, HH:mm")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!file.isDirectory && file.url && (
                      <a 
                        href={file.url} 
                        download 
                        onClick={e => e.stopPropagation()}
                        className="p-2 hover:bg-twitter-blue/20 text-twitter-blue rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    
                    {isAdmin && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenaming(file.path);
                            setNewName(file.name);
                          }}
                          className="p-2 hover:bg-white/10 text-dim-muted rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
           </div>
         )}
      </div>

      {/* Footer / Stats */}
      <div className="p-3 border-t border-dim-border bg-dim-card/30 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-dim-muted">
         <div className="px-2">Node: /files/{currentPath}</div>
         <div className="px-2">{filtered.length} Entities detected</div>
      </div>
    </div>
  );
}

