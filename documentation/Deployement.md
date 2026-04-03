# Déploiement

Cette documentation détaille les étapes nécessaires pour construire et déployer l'application frontend Compositor en production.

## 1. Préparation du Build

Avant de générer le lot de production, assurez-vous que les variables d'environnement sont correctement configurées (notamment `VITE_API_BASE_URL`).

### Commande de Build
Exécutez la commande suivante à la racine du projet :
```bash
npm run build
```
Cette commande effectue plusieurs actions :
1. `vue-tsc` : Vérification des types TypeScript.
2. `vite build` : Compilation et minification des ressources (JS, CSS, images) via Rollup.

Les fichiers générés sont placés dans le dossier **/dist**.

## 2. Structure du dossier `/dist`

Le dossier généré contient :
- `index.html` : Le point d'entrée de l'application.
- `assets/` : Scripts JS minifiés et fichiers CSS extraits.
- Fichiers statiques (favicon, icônes, etc.).

## 3. Stratégies de Déploiement

L'application étant une **SPA (Single Page Application)**, elle peut être hébergée sur n'importe quel serveur de fichiers statiques, mais nécessite une configuration spécifique pour la gestion du routage.

### Important : Gestion du Routage (Fallback)
Toutes les requêtes qui ne correspondent pas à un fichier statique doivent être redirigées vers `index.html`. C'est l'application Vue (via Vue Router) qui prendra ensuite le relais pour afficher la bonne page.

### Hébergement Nginx
Si vous déployez sur un serveur VPS avec Nginx, utilisez la configuration suivante dans votre fichier de site :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/compositor/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Control pour les ressources statiques
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Plateformes de déploiement automatique (Vercel / Netlify / Cloudflare Pages)
Ces plateformes détectent automatiquement le framework Vue/Vite.
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Configuration Fallback** :
  - **Vercel** : Géré via un fichier `vercel.json` (rewrites).
  - **Netlify** : Géré via un fichier `_redirects` contenant `/* /index.html 200`.

## 4. Optimisations de Production

- **Minification** : Vite utilise ESBuild pour minifier le JS et le CSS.
- **Image Compression** : Il est recommandé d'utiliser des formats modernes (WebP) via la Médiathèque pour optimiser le chargement.
- **Code Splitting** : Les routes sont chargées de manière asynchrone (`defineAsyncComponent`) pour réduire la taille du bundle initial.

## 5. Vérification post-déploiement

Après le déploiement, vérifiez :
1. Que la connexion à l'API backend fonctionne (`VITE_API_BASE_URL` correct).
2. Que le rafraîchissement des pages (`F5`) sur une route profonde (ex: `/site/admin/media`) ne renvoie pas une erreur 404 (grâce au fallback vers index.html).
3. Que les icônes et images se chargent correctement.
