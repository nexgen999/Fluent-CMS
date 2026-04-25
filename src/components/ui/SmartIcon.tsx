import React from "react";
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils";

interface SmartIconProps {
  icon?: string;
  className?: string;
  textClassName?: string;
}

export const SmartIcon = ({ icon, className = "w-6 h-6", textClassName = "text-lg" }: SmartIconProps) => {
  if (!icon) return <span className={textClassName}>📁</span>;
  
  if (icon.startsWith("google:")) {
    return <span className={cn("material-symbols-outlined", className)}>{icon.replace("google:", "")}</span>;
  }
  
  if (icon.startsWith("/uploads/icones/") || icon.startsWith("http")) {
    return <img src={icon} className={className} alt="Icon" referrerPolicy="no-referrer" />;
  }
  
  const LucideIcon = (Icons as any)[icon];
  if (LucideIcon) return <LucideIcon className={className} />;
  
  return <span className={textClassName}>{icon}</span>;
};
