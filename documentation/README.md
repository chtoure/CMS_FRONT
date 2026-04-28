# Documentation du Projet Compositor Web (Enelog Site Front)

## 1. Présentation
Ce projet est le frontend de l'application **Compositor Web** (Enelog), développé avec **Vue 3** et **Vite**. Il permet l'administration et la gestion de médias via une interface moderne.

## 2. Table des Matières de la Documentation

La documentation de ce projet est découpée en plusieurs fichiers thématiques dans ce répertoire :

### Vue d'Ensemble & Accès
- [README.md](./README.md) : Lisez-moi (ce fichier)
- [Auth.md](./Auth.md) : Authentification JWT, intercepteurs Axios et gestion de session
- [RolePermission.md](./RolePermission.md) : Système RBAC (Roles/Permissions) et protection granulaire de l'UI

### Le Constructeur (Builder)
- [BuilderComponentStyle.md](./BuilderComponentStyle.md) : Moteur de style, cascade Mobile-First et normalisation de cohérence
- [BuilderDataParameter.md](./BuilderDataParameter.md) : Injection de données, mapping parent/enfant et variables

### Contenus & Média
- [Mediatheque.md](./Mediatheque.md) : Gestion des fichiers et Éditeur d'Image intégré (Sharp)
- [CollectionVariable.md](./CollectionVariable.md) : Design Tokens, typage strict et validation dynamique
- [ContentType.md](./ContentType.md) : Schémas dynamiques, Shadow Mirroring (SQL) et migrations
- [ContentEntry.md](./ContentEntry.md) : Cycle de vie des entrées, intégrité relationnelle et corbeille

### Moteur de Rendu
- [Templating.md](./Templating.md) : Composition visuelle des modèles de blocs et de sections
- [Render.md](./Render.md) : Compilation finale et rendu côté client ou SSR

### Configuration Serveur & Déploiement
- [Config.md](./Config.md) : Fichiers .env et configuration Vite
- [Deployement.md](./Deployement.md) : Build et consignes de déploiement

---

## 3. Prérequis Techniques
Avant de commencer, assurez-vous d'avoir l'environnement suivant :
- **Node.js** : Version `^20.19.0` ou `>=22.12.0` (Testé avec v24.12.0).
- **NPM** : Installé avec Node.js.

## 4. Installation et Démarrage

### Installation des dépendances
À la racine du projet, exécutez :
```bash
npm install
```

### Lancer le serveur de développement
Pour démarrer l'application en local :
```bash
npm run dev
```
L'application sera accessible généralement sur `http://localhost:5173`.

### Construire pour la production
```bash
npm run build
```
Les fichiers compilés seront dans le dossier `dist/`.

## 5. Stack Technique
Le projet repose sur un écosystème moderne :

- **Core** : [Vue 3](https://vuejs.org/) (Composition API) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool** : [Vite](https://vitejs.dev/)
- **Routing** : [Vue Router 4](https://router.vuejs.org/)
- **Gestion d'État** : [Pinia](https://pinia.vuejs.org/) + `pinia-plugin-persistedstate`
- **Requêtes Data** : [Axios](https://axios-http.com/) + [TanStack Query](https://tanstack.com/query/latest)
- **UI Framework** :
  - [Tailwind CSS](https://tailwindcss.com/) (Styling utilitaire)
  - [Shadcn-Vue](https://shadcn-vue.com/) (Composants UI basés sur Reka UI)
  - [Lucide Vue Next](https://lucide.dev/) (Icônes)
- **Qualité de code** : ESLint, Prettier, Oxlint.

## 6. Architecture du Dossier `src/`

| Dossier | Description |
| :--- | :--- |
| **`assets/`** | Fichiers statiques (CSS global, images). Contient `base.css` pour Tailwind. |
| **`components/`** | Composants Vue réutilisables. |
| &nbsp;&nbsp;`ui/` | Composants de base (Boutons, Cards, Inputs) issus de Shadcn. |
| **`hook/`** | Composables Vue personnalisés (Hooks). |
| **`layout/`** | Layouts de l'application (ex: `MainLayout` pour l'admin, `DefaultLayout`). |
| **`lib/`** | Utilitaires (ex: fonction `cn` pour la fusion de classes Tailwind). |
| **`router/`** | Configuration des routes (`index.ts`). |
| **`stores/`** | Stores Pinia pour la gestion d'état global (ex: `theme.ts`). |
| **`views/`** | Pages principales de l'application. |

## 7. Routes Principales de l'Application

Les routes sont définies dans `src/router/index.ts`. Voici les principaux accès :

- **Authentification** : `/site/admin/auth/login` (`LoginView`)
- **Administration** :
  - **Dashboard** : `/site/admin/dashboard` (`DashboardView`)
  - **Médias** : `/site/admin/media` (`MediaListView`)
  - **Mise à jour Média** : `/site/admin/media/update/:id` (`MediaUpdateView`)

## 8. Scripts NPM Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement. |
| `npm run build` | Compile le projet pour la production (avec vérification de types). |
| `npm run preview` | Prévisualise localement le build de production. |
| `npm run lint` | Exécute les linters (ESLint, Oxlint) pour vérifier le code. |
| `npm run format` | Formate le code avec Prettier. |
| `npm run type-check` | Vérifie les types TypeScript sans compiler. |

---
*Documentation mise à jour en Avril 2026.*
