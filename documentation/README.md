# Documentation du Projet Compositor Web (Enelog Site Front)

## 1. Présentation
Ce projet est le frontend de l'application **Compositor Web** (Enelog), développé avec **Vue 3** et **Vite**. Il permet l'administration et la gestion de médias via une interface moderne.

## 2. Prérequis Techniques
Avant de commencer, assurez-vous d'avoir l'environnement suivant :
- **Node.js** : Version `^20.19.0` ou `>=22.12.0` (Testé avec v24.12.0).
- **NPM** : Installé avec Node.js.

## 3. Installation et Démarrage

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

## 4. Stack Technique
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

## 5. Architecture du Dossier `src/`

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

## 6. Routes Principales de l'Application

Les routes sont définies dans `src/router/index.ts`. Voici les principaux accès :

- **Authentification** : `/site/admin/auth/login` (`LoginView`)
- **Administration** :
  - **Dashboard** : `/site/admin/dashboard` (`DashboardView`)
  - **Médias** : `/site/admin/media` (`MediaListView`)
  - **Mise à jour Média** : `/site/admin/media/update/:id` (`MediaUpdateView`)

## 7. Scripts NPM Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement. |
| `npm run build` | Compile le projet pour la production (avec vérification de types). |
| `npm run preview` | Prévisualise localement le build de production. |
| `npm run lint` | Exécute les linters (ESLint, Oxlint) pour vérifier le code. |
| `npm run format` | Formate le code avec Prettier. |
| `npm run type-check` | Vérifie les types TypeScript sans compiler. |

---
*Documentation générée automatiquement le 25/12/2025.*
