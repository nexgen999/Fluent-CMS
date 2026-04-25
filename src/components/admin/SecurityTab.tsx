import React, { useState } from "react";
import { Shield, Lock, User, Check, AlertTriangle, Key } from "lucide-react";
import { cn } from "../../lib/utils";

export const SecurityTab = () => {
  const [username, setUsername] = useState("admin");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: "New passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, oldPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: "Credentials updated successfully. Use your new password next time." });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus({ type: 'error', message: data.error || "Update failed" });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Communication failure with security protocols." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto pb-20">
       <div className="space-y-1 py-4 border-b border-dim-border">
          <h3 className="text-3xl font-black italic tracking-tighter text-white">Security & Access</h3>
          <p className="text-[10px] uppercase font-black tracking-widest text-dim-muted opacity-60 italic">Manage administrative credentials and system hardening.</p>
       </div>

       <form onSubmit={handleUpdate} className="bg-dim-card border border-dim-border rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Shield className="w-32 h-32 text-twitter-blue" />
          </div>

          <div className="space-y-6 relative z-10">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue px-1 flex items-center gap-2">
                   <User className="w-3 h-3" /> Admin Username
                </label>
                <input 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-dim-bg border border-dim-border rounded-2xl p-4 focus:border-twitter-blue outline-none font-bold text-white transition-all"
                  required
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue px-1 flex items-center gap-2">
                   <Key className="w-3 h-3" /> Current Password
                </label>
                <input 
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full bg-dim-bg border border-dim-border rounded-2xl p-4 focus:border-twitter-blue outline-none font-bold text-white transition-all"
                  required
                />
             </div>

             <div className="h-px bg-dim-border/50" />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue px-1 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> New Password
                  </label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl p-4 focus:border-twitter-blue outline-none font-bold text-white transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-twitter-blue px-1 flex items-center gap-2">
                    <Check className="w-3 h-3" /> Confirm New Password
                  </label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-dim-bg border border-dim-border rounded-2xl p-4 focus:border-twitter-blue outline-none font-bold text-white transition-all"
                    required
                  />
                </div>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className={cn(
                 "w-full py-4 bg-twitter-blue hover:bg-twitter-blue-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-twitter-blue/20 flex items-center justify-center gap-3",
                 loading && "opacity-50 cursor-not-allowed"
               )}
             >
               {loading ? "Hardening System..." : "Update Security Protocols"}
             </button>
          </div>
       </form>

       {status.type !== 'none' && (
         <div className={cn(
           "p-4 rounded-2xl flex items-center gap-3 border animate-in zoom-in-95",
           status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
         )}>
           {status.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
           <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
         </div>
       )}

       <div className="bg-dim-card/50 border border-dim-border rounded-[32px] p-8 flex items-start gap-4">
          <Shield className="w-5 h-5 text-twitter-blue mt-1 shrink-0" />
          <div className="space-y-1">
             <h5 className="text-xs font-black uppercase tracking-widest text-white">Entropy Analysis Enabled</h5>
             <p className="text-[10px] text-dim-muted leading-relaxed italic">Administrative passwords should be at least 12 characters. The system uses SHA-256 derivation via bcrypt with a salt factor of 10 to ensure zero-visibility of plaintext credentials in the data silo.</p>
          </div>
       </div>
    </section>
  );
};
