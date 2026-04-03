# Configuration Technique

Le projet Compositor (Frontend) utilise **Vite** comme outil de build et de serveur de développement. La configuration est pilotée par des variables d'environnement et le fichier `vite.config.ts`.

## 1. Variables d'Environnement

Le projet utilise des fichiers `.env` pour gérer les configurations selon l'environnement (développement, recette, production).

| Variable | Description | Valeur par défaut (dev) |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL de base de l'API Backend | `http://localhost:3000` |

### Utilisation dans le code
Les variables sont accessibles via `import.meta.env.VITE_VARIABLE_NAME`.
Exemple dans `src/api/fetchConfig.ts` :
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
```

## 2. Configuration Vite (`vite.config.ts`)

Le fichier de configuration définit les plugins, les alias de chemin et les paramètres du serveur.

### Plugins clés
- `@vitejs/plugin-vue` : Support officiel pour Vue 3.
- `vite-plugin-vue-devtools` : Outils de débogage intégrés au navigateur.
- `syncComponentsPlugin()` : Plugin personnalisé (`src/components/config/sync-component-pulgin.ts`) pour la synchronisation des composants du builder.

### Alias de Chemins
- `@` : Pointe vers le dossier `src/`.
- `vue` : Redirigé vers `vue/dist/vue.esm-bundler.js` pour supporter la compilation de templates au runtime si nécessaire.

### Paramètres Serveur
- **Host** : `0.0.0.0` (accessible sur le réseau local).
- **Port** : `5173`.
- **HMR (Hot Module Replacement)** : Activé pour une mise à jour instantanée du code sans rechargement de page.
- **Polling** : Activé dans le watch pour assurer la compatibilité avec certains systèmes de fichiers (ex: Docker/WSL).

## 3. Configuration TypeScript

Le projet utilise des fichiers de configuration TypeScript distincts pour le frontend et les outils de build :
- `tsconfig.json` : Configuration principale.
- `tsconfig.app.json` : Configuration spécifique à l'application Vue.
- `tsconfig.node.json` : Configuration pour les fichiers de config (Vite).

## 4. Linters et Formatage

- **ESLint** : Utilisé pour garantir la qualité du code.
- **Prettier** : Utilisé pour le formatage automatique.
- **Oxlint** : Utilisé pour des vérifications ultra-rapides de la qualité du code.
- **Tailwind CSS** : Configuré via `tailwind.config.js` et `postcss.config.js`.

## 5. Dépendances Majeures

| Package | Usage |
| :--- | :--- |
| `vue` | Framework principal (Composition API) |
| `pinia` | Gestion d'état global persistant |
| `vue-router` | Routage de l'application |
| `@tanstack/vue-query` | Gestion des requêtes API et du cache |
| `lucide-vue-next` | Bibliothèque d'icônes |
| `shadcn-vue` | Bibliothèque de composants UI |
| `tailwind-merge` & `clsx` | Utilitaires pour la manipulation de classes CSS |
