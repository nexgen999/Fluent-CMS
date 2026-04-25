import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import multer from "multer";

import { 
  CMS_DIR, 
  ARTICLES_DIR, 
  CONFIG_DIR, 
  UPLOADS_DIR, 
  GALLERY_DIR, 
  FILES_DIR, 
  ICONS_DIR, 
  CONFIG_FILE, 
  ADMIN_FILE, 
  PORT 
} from "./src/server/constants";

dotenv.config();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type; // pictures, files, or icones
    let targetDir = FILES_DIR;
    if (type === "pictures") targetDir = GALLERY_DIR;
    else if (type === "icones") targetDir = ICONS_DIR;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

async function ensureDirs() {
  await fs.mkdir(CMS_DIR, { recursive: true });
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.mkdir(FILES_DIR, { recursive: true });
  await fs.mkdir(GALLERY_DIR, { recursive: true });
  await fs.mkdir(ICONS_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(path.join(GALLERY_DIR, "article_import"), { recursive: true });
  await fs.mkdir(path.join(GALLERY_DIR, "articles"), { recursive: true });
  
  try {
    await fs.access(CONFIG_FILE);
  } catch {
    const defaultConfig = {
      siteName: "Fluent CMS",
      favicon: "🚀",
      footerText: "© 2026 Fluent CMS • Built with Antigravity",
      profile: {
        name: "Jean-Pierre",
        handle: "jp_dev",
        bio: "Fullstack Architect & UI/UX enthusiast.",
        avatarUrl: ""
      },
      socials: [
        { id: "1", name: "Twitter", url: "https://twitter.com", icon: "Twitter" },
        { id: "2", name: "Github", url: "https://github.com", icon: "Github" }
      ],
      categories: [
        { id: "root_1", name: "Tech", icon: "💻", parentId: null },
        { id: "sub_1", name: "React", icon: "⚛️", parentId: "root_1" }
      ],
      theme: "DIM",
      font: "Inter",
      fontSize: "16px"
    };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  }

  try {
    await fs.access(ADMIN_FILE);
  } catch {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await fs.writeFile(ADMIN_FILE, JSON.stringify({ username: "admin", password: hashedPassword }, null, 2));
  }
}

async function startServer() {
  await ensureDirs();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  // Static serving for media
  app.use("/uploads/pictures", express.static(GALLERY_DIR));
  app.use("/uploads/pictures/article_import", express.static(path.join(GALLERY_DIR, "article_import")));
  app.use("/uploads/files", express.static(FILES_DIR));
  app.use("/uploads/icones", express.static(ICONS_DIR));

  // --- API Routes ---

  app.get("/api/link-preview", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") return res.status(400).json({ error: "URL required" });
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const text = await response.text();
      
      const cheerio = await import('cheerio');
      const $ = cheerio.load(text);
      
      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="twitter:title"]').attr('content') || "";
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || "";
      const image = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || "";
      const siteName = $('meta[property="og:site_name"]').attr('content') || "";
      const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || "";
      
      // Resolve relative URLs
      let finalImage = image;
      if (image && !image.startsWith('http')) {
        const baseUrl = new URL(url);
        finalImage = new URL(image, baseUrl.origin).href;
      }

      let finalFavicon = favicon;
      if (favicon && !favicon.startsWith('http')) {
         const baseUrl = new URL(url);
         finalFavicon = new URL(favicon, baseUrl.origin).href;
      }

      res.json({ title, description, image: finalImage, url, siteName, favicon: finalFavicon });
    } catch (e) {
      console.error("Link Preview Error:", e);
      res.status(500).json({ error: "Failed to fetch preview" });
    }
  });
  
  app.get("/api/icons", async (req, res) => {
    try {
      const files = await fs.readdir(ICONS_DIR);
      res.json(files.map(f => ({ name: f, url: `/uploads/icones/${f}` })));
    } catch {
      res.json([]);
    }
  });

  app.post("/api/scrape-icon", async (req, res) => {
    const { url, name } = req.body;
    try {
      if (!url || !url.startsWith('http')) {
        return res.status(400).json({ success: false, error: "Invalid URL provided." });
      }
      
      console.log("Scraping icon from:", url);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/png,image/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Remote server responded with ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('image')) {
        console.warn("Content-Type mismatch:", contentType);
        // We proceed anyway because some CDNs might have weird headers
      }

      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error("Received empty data from remote server.");
      }

      const buffer = Buffer.from(arrayBuffer);
      
      let safeName = name ? name.replace(/[^a-z0-9_-]/gi, '_') : `icon_${Date.now()}`;
      let filename = `${safeName}.png`;
      
      const targetPath = path.join(ICONS_DIR, filename);
      await fs.writeFile(targetPath, buffer);
      
      console.log("Icon saved successfully:", filename);
      res.json({ success: true, url: `/uploads/icones/${filename}`, filename });
    } catch (error: any) {
      console.error("Scrape Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/config", async (req, res) => {
    try {
      const config = await fs.readFile(CONFIG_FILE, "utf-8");
      res.json(JSON.parse(config));
    } catch (error) {
      console.error("Error reading config:", error);
      res.status(500).json({ error: "Failed to read config" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const adminData = JSON.parse(await fs.readFile(ADMIN_FILE, "utf-8"));
    if (username === adminData.username && await bcrypt.compare(password, adminData.password)) {
      res.json({ success: true, token: "mock-token" });
    } else {
      res.status(401).json({ success: false });
    }
  });

  app.post("/api/admin/update-credentials", async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    try {
      const adminData = JSON.parse(await fs.readFile(ADMIN_FILE, "utf-8"));
      
      // Verify old password
      if (await bcrypt.compare(oldPassword, adminData.password)) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await fs.writeFile(ADMIN_FILE, JSON.stringify({ username, password: hashedPassword }, null, 2));
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, error: "Incorrect current password" });
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      res.status(500).json({ error: "Failed to update credentials" });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const files = await fs.readdir(ARTICLES_DIR);
      const articles = await Promise.all(
        files.filter(f => f.endsWith(".md")).map(async f => {
          const content = await fs.readFile(path.join(ARTICLES_DIR, f), "utf-8");
          const { data, content: body } = matter(content);
          return { id: f.replace(".md", ""), ...data, content: body };
        })
      );
      articles.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(articles);
    } catch (error) {
      res.status(500).json([]);
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const content = await fs.readFile(path.join(ARTICLES_DIR, `${req.params.id}.md`), "utf-8");
      const { data, content: body } = matter(content);
      res.json({ id: req.params.id, ...data, content: body });
    } catch {
      res.status(404).send("Not found");
    }
  });

  app.post("/api/articles", async (req, res) => {
    const { id, title, content, category, subcategory, parentCategoryId, date, tags } = req.body;
    let finalId = id;
    if (!finalId) {
      finalId = `article_${Date.now()}`;
    }
    const fileContent = matter.stringify(content, {
      title: title || "",
      category: category || "global",
      subcategory: subcategory || "",
      parentCategoryId: parentCategoryId || null,
      date: date || new Date().toISOString(),
      tags: tags || []
    });
    await fs.writeFile(path.join(ARTICLES_DIR, `${finalId}.md`), fileContent);
    res.json({ success: true, id: finalId });
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      await fs.unlink(path.join(ARTICLES_DIR, `${req.params.id}.md`));
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.json({ success: true, message: "Article already deleted" });
      }
      console.error("Error deleting article:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/config", async (req, res) => {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  // --- Media ---
  app.post("/api/upload/:type", upload.single("file"), (req: any, res) => {
    if (!req.file) return res.status(400).send("No file");
    const { folder = "" } = req.query;
    
    let baseDir = FILES_DIR;
    if (req.params.type === "pictures") baseDir = GALLERY_DIR;
    else if (req.params.type === "icones") baseDir = ICONS_DIR;

    const targetDir = path.join(baseDir, folder as string);
    const oldPath = req.file.path;
    const newPath = path.join(targetDir, req.file.filename);

    fs.mkdir(targetDir, { recursive: true })
      .then(() => fs.rename(oldPath, newPath))
      .then(() => {
        const relativeUrl = folder ? `${folder}/${req.file.filename}` : req.file.filename;
        res.json({ success: true, url: `/uploads/${req.params.type}/${relativeUrl}`, filename: req.file.filename });
      })
      .catch(err => {
        console.error("Upload rename error:", err);
        res.status(500).json({ success: false, error: err.message });
      });
  });

  app.get("/api/gallery", async (req, res) => {
    try {
      const files = await fs.readdir(GALLERY_DIR);
      res.json(files.map(f => ({ name: f, url: `/uploads/pictures/${f}` })));
    } catch {
      res.json([]);
    }
  });

  app.get("/api/files", async (req, res) => {
    try {
      const { subDir = "" } = req.query;
      const targetDir = path.join(FILES_DIR, subDir as string);
      
      // Ensure targetDir is within FILES_DIR
      if (!targetDir.startsWith(FILES_DIR)) {
        return res.status(403).json({ error: "Forbidden access" });
      }

      await fs.mkdir(targetDir, { recursive: true });
      const entries = await fs.readdir(targetDir, { withFileTypes: true });
      
      const stats = await Promise.all(entries.map(async entry => {
        const entryPath = path.join(targetDir, entry.name);
        const s = await fs.stat(entryPath);
        const relativePath = subDir ? `${subDir}/${entry.name}` : entry.name;
        
        return { 
          name: entry.name, 
          url: entry.isDirectory() ? null : `/uploads/files/${relativePath}`, 
          size: s.size, 
          mtime: s.mtime,
          isDirectory: entry.isDirectory(),
          path: relativePath
        };
      }));
      res.json(stats);
    } catch (e) {
      console.error("Fetch files error:", e);
      res.status(500).json([]);
    }
  });

  app.post("/api/files/mkdir", async (req, res) => {
    const { path: dirPath } = req.body;
    try {
      const fullPath = path.join(FILES_DIR, dirPath);
      await fs.mkdir(fullPath, { recursive: true });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/files/rename", async (req, res) => {
    const { oldPath, newPath } = req.body;
    try {
      const fullOldPath = path.join(FILES_DIR, oldPath);
      const fullNewPath = path.join(FILES_DIR, newPath);
      await fs.rename(fullOldPath, fullNewPath);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/media/:type/:name", async (req, res) => {
    try {
      let dir = GALLERY_DIR;
      if (req.params.type === "icones") dir = ICONS_DIR;
      else if (req.params.type === "files") dir = FILES_DIR;
      
      const targetPath = path.join(dir, req.params.name);
      const stat = await fs.stat(targetPath);
      
      if (stat.isDirectory()) {
        await fs.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.unlink(targetPath);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  async function createInitialArticle() {
    const files = await fs.readdir(ARTICLES_DIR);
    if (files.filter(f => f.endsWith(".md")).length === 0) {
      const id = "article_id_00001";
      const content = matter.stringify("Welcome to your new Fluent CMS! \n\nCheck out this YouTube embed test: \n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>", {
        title: "Welcome aboard!",
        category: "news",
        subcategory: "World",
        date: new Date().toISOString(),
        tags: ["welcome", "fluent"]
      });
      await fs.writeFile(path.join(ARTICLES_DIR, `${id}.md`), content);
    }
  }
  await createInitialArticle();

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API Route not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  // Generic error handler to ensure JSON responses
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
