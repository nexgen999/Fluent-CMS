# Twitter-Style Article Platform

Une plateforme de publication d'articles moderne, inspirée du design d'Elon Musk sur X (ex-Twitter), conçue pour une expérience de lecture et d'écriture fluide, sombre et professionnelle.

## 🚀 Caractéristiques principales

- **Interface "Dim Mode"** : Un design sombre sophistiqué utilisant les codes visuels de X (Twitter).
- **Éditeur d'articles avancé (Composer)** : Une interface d'écriture riche avec prévisualisation en temps réel.
- **Système de Plugins Modulaire** : Extension facile des capacités de l'éditeur.
- **Gestionnaire de fichiers centralisé** : Explorez et insérez vos ressources partagées directement dans vos articles.
- **Administration complète** : Panel de gestion pour les articles, les configurations du site et les fichiers.

## 🔌 Plugins de l'Éditeur

L'éditeur intègre plusieurs outils puissants pour enrichir vos contenus :

1.  **Plugin Musique** : Intégration de widgets audio via des liens directs :
    -   **Spotify** (Titres, Playlists, Albums)
    -   **SoundCloud**
    -   **Deezer** (Support des nouveaux widgets)
    -   **YouTube Music**
2.  **Plugin Code** : Insertion de blocs de code avec style "GitHub" et bouton de copie automatique. Supporte plusieurs langages (JS, TS, HTML, Python, etc.).
3.  **Plugin Ressources** : Insertion de fichiers via l'explorateur centralisé ou via un lien URL direct.
4.  **Plugin Média** : Support pour les images (upload ou URL) et les intégrations vidéo YouTube.
5.  **Plugin Emojis** : Sélecteur complet d'emojis avec recherche catégorisée.
6.  **Plugin Tags** : Système de marquage dynamique pour catégoriser vos articles.

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, TypeScript.
- **Styling** : Tailwind CSS 4, Motion (framer-motion) pour les animations.
- **Backend** : Express (API Node.js) intégré via Vite Middleware.
- **Éditeur** : ContentEditable personnalisé avec insertion HTML dynamique.
- **Icônes** : Lucide React.
- **Composants UI** : Radix UI & Custom components.

## 📂 Structure du Projet

```text
├── src/
│   ├── components/
│   │   ├── admin/       # Panel d'administration
│   │   ├── editor/      # Éditeur d'articles et ses plugins
│   │   ├── feed/        # Flux d'affichage des articles
│   │   ├── layout/      # Structure de navigation et containers
│   │   └── ui/          # Composants réutilisables (Boutons, Modales)
│   ├── types.ts         # Définitions TypeScript
│   └── main.tsx         # Point d'entrée
├── server.ts            # Serveur API Express
└── data/                # Stockage des fichiers et configurations (JSON/MD)
```

## ⚙️ Installation et Démarrage

### Prérequis
- Node.js (v18+)
- npm ou yarn

### Installation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-compte/twitter-article-platform.git
   cd twitter-article-platform
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement (optionnel) :
   Copiez `.env.example` vers `.env`.

### Démarrage
Pour lancer le serveur de développement (Frontend + API) :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000`.

### Build pour la production
```bash
npm run build
npm start
```

## 📝 Licence
Distribué sous la licence MIT.
