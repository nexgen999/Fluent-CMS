export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
}

export interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  icon: string; // lucide icon name
}

export interface Profile {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  avatarScale?: number;
  avatarFrame?: 'none' | 'circle' | 'square' | 'hexagon' | 'squircle' | 'diamond';
  avatarPosX?: number;
  avatarPosY?: number;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  subcategory?: string; // Legacy support
  parentCategoryId?: string; // New nested support
  date: string;
  content: string;
  tags?: string[];
  likes?: number;
}

export interface TypographySetting {
  family: string;
  size: string;
  color?: string;
  weight?: string;
}

export interface SiteConfig {
  siteName: string;
  favicon?: string;
  headerText?: string;
  footerText?: string;
  profile: Profile;
  socials: SocialNetwork[];
  categories: Category[];
  theme: "DIM" | "LIGHT" | "DARK" | "CUSTOM";
  customColors?: {
    bg: string;
    card: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
  };
  typography: {
    global: TypographySetting;
    menu: TypographySetting;
    articleTitle: TypographySetting;
    articleBody: TypographySetting;
    profileName: TypographySetting;
    profileHandle: TypographySetting;
    profileBio: TypographySetting;
  };
  font: string; // Legacy
  fontSize: string; // Legacy
}

export interface User {
  username: string;
  isAuthenticated: boolean;
  token?: string;
}
