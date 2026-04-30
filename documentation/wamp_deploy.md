# Déploiement avec WAMP (Apache en Reverse Proxy)

Ce guide détaille les étapes nécessaires pour déployer la solution **Compositor** sur un serveur Windows utilisant **WAMP**. Nous utiliserons Apache comme serveur web pour le frontend et comme reverse proxy pour l'API Node.js.

## 📋 Prérequis

- **WAMP Server** installé et fonctionnel.
- **Node.js & NPM** installés sur le serveur.
- **PM2** installé globalement (`npm install -g pm2`) pour la gestion du processus backend.

---

## 🛠️ Étape 1 : Préparation du Frontend

Le frontend doit être compilé en fichiers statiques (HTML/CSS/JS) pour garantir une performance optimale.

1.  Dans votre dossier de développement **frontend** local, générez le build :
    ```bash
    npm run build
    ```
2.  Copiez l'intégralité du contenu du dossier `dist` généré.
3.  Collez ce contenu sur le serveur dans le répertoire : `C:\www\compositor\frontend\dist`.
4.  Copiez votre fichier `.env` de production dans `C:\www\compositor\frontend` (au même niveau que le dossier `dist`).
5.  Modifiez le fichier `.env` pour y configurer l'URL de l'API :
    ```env
    VITE_API_BASE_URL="http://compositor.bj"
    ```

**Structure finale du répertoire frontend :**
```text
C:\www\compositor\frontend\
├── .env
└── dist\
```

---

## ⚙️ Étape 2 : Préparation du Backend (API)

L'API TypeScript doit être compilée en JavaScript avant le déploiement.

1.  Dans votre dossier de développement **backend** local, lancez la compilation :
    ```bash
    npm run build
    ```
2.  Copiez le contenu du dossier `dist` généré sur le serveur dans : `C:\www\compositor\backend\dist`.
3.  Copiez également les fichiers/dossiers suivants à la racine du dossier backend (`C:\www\compositor\backend\`) :
    - `package.json` (pour les dépendances)
    - `prisma.config.ts`
    - Le dossier `prisma/` (contenant `schema.prisma`)
    - Le fichier `.env` de production.

4.  **Configuration de la Base de Données** :
    Créez un répertoire pour la base de données SQLite : `C:\www\compositor\database`.

5.  **Variables d'Environnement** :
    Configurez le fichier `.env` du backend avec les valeurs réelles de production :
    ```env
    # Base de données
    DATABASE_URL="file:C:/www/compositor/database/compositor.db"
    PORT=3000
    NODE_ENV=production

    # URLs Globales
    APP_URL="http://compositor.bj/"
    API_URL_SENDEMAIL="https://cpay.enerlog.net/message/send/mail"
    APP_NAME="Compositor"

    # Sécurité & Auth
    URL_LOGIN_FRONT="http://compositor.bj/site/admin/auth/login"
    FRONT_APP_URL="http://compositor.bj"
    ACCESS_SECRET=VOTRE_CLE_SECRETE_ACCESS
    REFRESH_SECRET=VOTRE_CLE_SECRETE_REFRESH
    ACCESS_EXPIRY=15m
    REFRESH_EXPIRY=7d

    # Administrateur par défaut (utiliser un vrai compte mail)
    ADMIN_EMAIL="admin@gmail.com"
    ADMIN_FULL_NAME="Admin"
    ADMIN_DEFAULT_PASSWORD="votre_mot_de_passe"
    ```

6.  **Script de Déploiement (`deploy.bat`)** :
    Créez un fichier `deploy.bat` dans `C:\www\compositor\backend\` pour automatiser les tâches Prisma et le lancement via PM2. 

    > [!IMPORTANT]
    > Ne modifiez pas le contenu du script ci-dessous, il est pré-configuré pour votre environnement.

```batch
@echo off
setlocal enabledelayedexpansion
echo --- Mise a jour du Backend Compositor ---

:: 1. Installation des outils
echo Installation des dependances...
call npm install
call npm install dotenv-cli

:: 2. Nettoyage et Generation du client Prisma
echo Nettoyage du cache Prisma...
:: On supprime l'ancien client pour corriger l'erreur 'graph'
if exist "node_modules\.prisma" rd /s /q "node_modules\.prisma"
echo Generation du client...
call npx prisma generate

:: 3. Application des migrations
echo Application des migrations...
:: On utilise dotenv-cli pour injecter ton fichier .env directement
call npx dotenv -e .env -- npx prisma migrate deploy

:: 4. Lancement du Seeding
echo Lancement du seeding...
if exist "dist\Seed.js" (
    set SEED_PATH=dist\Seed.js
) else if exist "dist\Utils\Seeds\Seed.js" (
    set SEED_PATH=dist\Utils\Seeds\Seed.js
)

if defined SEED_PATH (
    echo [OK] Seeder trouve : !SEED_PATH!
    call npx dotenv -e .env -- node !SEED_PATH!
) else (
    echo [SKIP] Seed.js introuvable.
)

:: 5. Relance du serveur
echo Verification du demarrage...
if exist "dist\index.js" (
    set START_FILE=dist\index.js
) else if exist "dist\index.mjs" (
    set START_FILE=dist\index.mjs
)

if defined START_FILE (
    echo [OK] Demarrage de !START_FILE! avec PM2
    call npx pm2 restart compositor-backend || npx pm2 start !START_FILE! --name compositor-backend
) else (
    echo [ERREUR FATALE] index.js introuvable.
)

echo --- Termine ! ---
pause
```

7.  **Exécution** : Lancez le script `deploy.bat` et attendez la confirmation du démarrage par PM2.

---

## 🌐 Étape 3 : Configuration du Serveur Web (WAMP)

### 1. Activation des Modules Apache
Ouvrez le menu WAMP > Apache > Modules Apache et assurez-vous que les modules suivants sont activés (cochés) :
- `proxy_module`
- `proxy_http_module`
- `rewrite_module`
- `alias_module`
- `headers_module`

### 2. Création du VirtualHost
1.  Clic gauche sur l'icône WAMP > **Vos VirtualHosts** > **Gestion VirtualHost**.
2.  Nom du VirtualHost : `compositor.bj`
3.  Chemin complet : `C:/www/compositor/frontend/dist`
4.  Cliquez sur **Démarrer la création**.

### 3. Configuration Avancée (Reverse Proxy & Rewrites)
Nous devons maintenant configurer manuellement le VirtualHost pour gérer le routing Vue.js et le proxy vers l'API.

1.  Ouvrez le fichier : `C:\wamp64\bin\apache\apache[version]\conf\extra\httpd-vhosts.conf`.
2.  Localisez le bloc `<VirtualHost *:80>` correspondant à `compositor.bj` et remplacez son contenu par la configuration suivante :

```apache
<VirtualHost *:80>
    ServerName compositor.bj
    ServerAlias www.compositor.bj
    DocumentRoot "C:/www/compositor/frontend/dist"

    <Directory "C:/www/compositor/frontend/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # --- REWRITES POUR VUE 3 (SPA ROUTING) ---
        RewriteEngine On
        RewriteBase /
        
        # Ne pas rediriger si le fichier existe (images, icônes, etc.)
        RewriteCond %{REQUEST_FILENAME} -s [OR]
        RewriteCond %{REQUEST_FILENAME} -l [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^.*$ - [NC,L]

        # Rediriger tout le reste vers index.html
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 1. ALIAS POUR LES ICONES (FRONTEND)
    Alias /icons/ "C:/www/compositor/frontend/dist/icons/"
    <Directory "C:/www/compositor/frontend/dist/icons/">
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # 2. ALIAS POUR LES MEDIAS (BACKEND)
    Alias /media/ "C:/www/compositor/backend/media/"
    <Directory "C:/www/compositor/backend/media/">
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # 3. REVERSE PROXY POUR L'API (NODE.JS)
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api

</VirtualHost>
```

---

## 🏁 Étape 4 : Finalisation

1.  **Fichier Hosts** : Si vous testez localement sur le serveur, assurez-vous que votre fichier `C:\Windows\System32\drivers\etc\hosts` contient bien la ligne suivante :
    ```text
    127.0.0.1  compositor.bj
    ```
2.  **Redémarrage** : Clic droit sur l'icône WAMP > **Outils** > **Redémarrer le DNS**.
3.  **Accès** : Une fois l'icône verte, rendez-vous sur [http://compositor.bj](http://compositor.bj).