import path from "path";

export const CMS_DIR = path.join(process.cwd(), "data", "CMS");
export const ARTICLES_DIR = path.join(CMS_DIR, "articles");
export const CONFIG_DIR = path.join(CMS_DIR, "config");
export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
export const GALLERY_DIR = path.join(CMS_DIR, "pictures");
export const FILES_DIR = path.join(CMS_DIR, "files");
export const ICONS_DIR = path.join(CMS_DIR, "icones");

export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export const ADMIN_FILE = path.join(CONFIG_DIR, "admin.json");

export const PORT = 3000;
