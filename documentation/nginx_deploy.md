# GUIDE DE DÉPLOIEMENT COMPLET : COMPOSITOR

Ce document contient l'intégralité des étapes, commandes et configurations pour mettre en production le frontend et le backend sur votre serveur local Windows.

---

## 1. ARCHITECTURE GÉNÉRALE

- **Domaine** : [http://compositor.bj](http://compositor.bj) (configuré dans le fichier `hosts` de Windows).
- **Frontend** : Vue 3 (Vite), servi statiquement par Nginx sur le port `80`.
- **Backend** : Node.js, géré par PM2 sur le port `3000`.
- **Reverse Proxy** : Nginx fait le lien entre le nom de domaine, les fichiers statiques et l'API Node.js.

---

## 2. ÉTAPE 1 : RÉGLAGES DU SYSTÈME (WINDOWS)

Avant de lancer les serveurs, Windows doit reconnaître le nom de domaine local.

1. Ouvrez le **Bloc-notes en mode Administrateur**.
2. Ouvrez le fichier : `C:\Windows\System32\drivers\etc\hosts`.
3. Ajoutez cette ligne tout en bas :
   ```text
   127.0.0.1       compositor.bj
   ```
<!-- 4. **Permissions** : Faites un clic droit sur votre dossier racine `C:\www\compositor`, allez dans **Propriétés > Sécurité**, et ajoutez l'utilisateur "Tout le monde" avec les droits de **Lecture**. -->

---

## 3. ÉTAPE 2 : LE BACKEND (NODE.JS, PRISMA & PM2)

Le backend traite les données et gère la base de données SQLite.

### 3.1. Configuration (`.env`)
Dans `C:\www\compositor\backend\.env`, assurez-vous d'avoir ces valeurs :
```env
PORT=3000
NODE_ENV=production
APP_URL="http://compositor.bj/"
DATABASE_URL="file:C:/www/compositor/database/compositor.db"
```

### 3.2. Script de déploiement (`deploy.bat`)
Il est recommandé d'utiliser le script `deploy.bat` situé dans `C:\www\compositor\backend` pour automatiser l'installation et le démarrage. Ce script s'occupe de :
- L'installation des dépendances (`npm install`).
- La génération du client Prisma (`npx prisma generate`).
- Le lancement des migrations (`npx prisma migrate deploy`).
- L'exécution du Seed si la base est vide.
- Le démarrage ou redémarrage de l'application via PM2.

**Fichiers Prisma requis sur le serveur** : 
Assurez-vous de bien copier les fichiers suivants depuis votre environnement local vers le serveur pour que Prisma 7 fonctionne correctement :
- Le dossier `dist/` (avec `dist/schema.prisma` à l'intérieur).
- Le fichier `prisma.config.ts` (à la racine).
- Le dossier `prisma/migrations/`.
- Le fichier `prisma/schema.prisma`.

### 3.3. Commandes manuelles (Alternative)
Ouvrez un terminal dans le dossier de votre backend (`C:\www\compositor\backend`) :
```bash
# Installation des dépendances
npm install

# Démarrage permanent
npx pm2 start dist/index.js --name "compositor-backend"

# Vérification
npx pm2 status
```

---

## 4. ÉTAPE 3 : LE FRONTEND (VUE 3)

Le frontend doit être compilé en fichiers HTML/CSS/JS statiques pour être ultra-rapide.

1. Dans votre dossier de développement frontend local, lancez :
   ```bash
   npm run build
   ```
2. Copiez l'intégralité du contenu du dossier `dist` généré.
3. Collez ce contenu sur le serveur dans : `C:\www\compositor\frontend\dist`.

---

## 5. ÉTAPE 4 : LE SERVEUR WEB (NGINX)

C'est ici que tout se connecte. Remplacez le contenu de votre fichier `C:\nginx\conf\nginx.conf` avec ce bloc de configuration :

```nginx
server {
    listen  80;
    server_name compositor.bj;

    # GESTION DU FRONTEND (VUE 3)
    location / {
        root    C:/www/compositor/frontend/dist;
        index   index.html;
        try_files $uri $uri/ /index.html; # Important pour le routage Vue (History API)
    }

    # GESTION DES MÉDIAS (SANS TOUCHER AU CODE)
    # Redirige les URLs /media/ vers le dossier physique du backend
    location /media/ {
        alias "C:/www/compositor/backend/media/";
        expires 30d;
        add_header Cache-Control "public";
    }

    # GESTION DE L'API (PROXY VERS NODE.JS)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Important** : Après toute modification de ce fichier, n'oubliez pas de recharger Nginx.

---

## 6. RÉCAPITULATIF DES COMMANDES DE MAINTENANCE

Voici un tableau des commandes utiles pour la maintenance quotidienne.

| Action | Outil | Commande (Terminal) |
| :--- | :---: | :--- |
| **Relancer le Backend** | PM2 | `npx pm2 restart compositor-backend` |
| **Voir les logs/erreurs Backend** | PM2 | `npx pm2 logs compositor-backend` |
| **Vérifier la config Nginx** | Nginx | `.\nginx.exe -t` (depuis `C:\nginx`) |
| **Appliquer les modifs Nginx** | Nginx | `.\nginx.exe -s reload` (depuis `C:\nginx`) |

---

## 7. NOTES TECHNIQUES IMPORTANTES

- **Slashes (`/`) et Antislashes (`\`)** : Nginx sous Windows convertit automatiquement les `\` stockés dans votre base de données SQLite en `/` pour le web, grâce à la directive `alias`.
- **Images non trouvées (Erreur 404)** : Si une image ne s'affiche pas sur le site, vérifiez que le dossier physique `C:\www\compositor\backend\media\` contient bien vos fichiers (notamment les sous-dossiers comme `uploads/images/`). Vérifiez aussi les droits de lecture.
- **Persistance PM2** : Si le serveur Windows redémarre, PM2 ne relancera pas automatiquement le backend de base. Pensez à utiliser un package comme `pm2-windows-startup` ou le Planificateur de tâches Windows pour automatiser le lancement au démarrage de la machine.
- **Cookies & HTTPS** : L'en-tête `proxy_set_header X-Forwarded-Proto $scheme;` ajouté dans Nginx permet au backend Express de savoir si la requête d'origine était sécurisée, ce qui est très utile pour paramétrer les cookies avec `Secure`.