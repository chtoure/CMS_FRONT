# Gestion de l'Authentification

L'authentification globale du frontend Compositor est gérée par une combinaison de tokens JWT, de `Vue Router` pour la protection des itinéraires, et de `Pinia` pour le stockage de l'état côté client.

## 1. Flux de Connexion (Login Flow)

1. L'utilisateur accède à la route `/site/admin/auth/login`.
2. Le composant `LoginView.vue` envoie les identifiants (email/mot de passe) via l'API, définie à l'aide de TanStack Query ou Axios.
3. Si la connexion réussit, le serveur retourne des données de session (typiquement un Token JWT et/ou des infos utilisateur).
4. Le **Store d'Authentification** (`auth.ts` via Pinia) met à jour l'état de l'application et enregistre le Token de manière persistante (ex: `localStorage` via le plugin `pinia-plugin-persistedstate`).
5. L'utilisateur est redirigé vers le `/site/admin/dashboard`.

## 2. Store Pinia (`useAuthStore`)

Le store d'authentification centralise l'état utilisateur :
- `user`: Stocke les informations de bases de l'utilisateur (nom, email, etc).
- `token` : Le jeton JWT utilisé pour l'autorisation des requêtes API.
- `isAuthenticated`: Un getter dynamique qui valide la présence du token.

Ce store est automatiquement réhydraté à chaque rechargement de page grâce à la persistance.

## 3. Route Guard (Protection des Pages)

Dans le fichier `src/router/index.ts`, un mécanisme de **Navigation Guard** (`router.beforeEach`) intercepte toutes les redirections.

- **Routes Publiques** : Les pages comme le `/login` sont accessibles à tous.
- **Routes Privées (`/site/admin/...`)** : Le routeur vérifie le getter `isAuthenticated`. Si l'utilisateur n'est pas connecté, il est instantanément redirigé vers `/site/admin/auth/login`.

## 4. Intercepteurs Axios (Requêtes API)

Afin que le backend puisse identifier l'utilisateur à chaque requête, un **intercepteur Axios** injecte automatiquement le token dans le header `Authorization` de toutes les requêtes HTTP sortantes.

En cas de réponse `401 Unauthorized` du serveur (ex: token expiré), l'intercepteur :
1. Déconnecte l'utilisateur localement via le Store Pinia.
2. Déclenche une redirection vers l'écran de Login pour forcer une nouvelle connexion.
