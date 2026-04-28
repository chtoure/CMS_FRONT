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

## 4. Intercepteurs Axios (Gestion des Sessions)

Afin d'assurer une communication sécurisée et fluide, un **intercepteur Axios** (`src/Utils/axios.ts`) gère automatiquement les requêtes et les réponses :

### Requêtes (Authorization Header)
Toutes les requêtes sortantes vers l'API incluent automatiquement le token JWT dans le header `Authorization` :
```typescript
config.headers.Authorization = `Bearer ${token}`;
```

### Réponses (Gestion du 401)
Si le serveur retourne une erreur **401 (Unauthorized)**, cela signifie que le token est expiré ou invalide. L'intercepteur réagit immédiatement :
1. **Nettoyage** : Il vide le store Pinia (`auth.ts`) pour supprimer le token expiré.
2. **Redirection** : Il redirige l'utilisateur vers `/site/admin/auth/login`.
3. **Information** : Il peut afficher une notification Toast informant l'utilisateur que sa session a expiré pour des raisons de sécurité.

---

## 5. Sécurité des Mots de Passe
Bien que géré principalement par le backend (Hachage Argon2/BCrypt), le frontend impose des validations de complexité lors de la création ou du changement de mot de passe afin de prévenir les attaques par force brute.
