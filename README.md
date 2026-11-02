# 🖥️ CMS Modular Frontend

[![Vue.js / React](https://img.shields.io/badge/Frontend-Vue.js%20%2F%20React-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

Interface d'administration moderne et réactive pour un système de gestion de contenu (CMS) modulaire. Permet la création dynamique de pages, la gestion des médias, la configuration de modules sur-mesure et la gestion des rôles utilisateurs.

---

## 🚀 Fonctionnalités Clés

- **Tableau de bord dynamique :** Métriques en temps réel sur les contenus et l'activité.
- **Éditeur de contenu modulaire :** Assemblage de blocs de contenu configurables (Hero, Carousels, Textes, Formulaires).
- **Gestion des médias :** Upload, prévisualisation et association aux articles/pages.
- **Authentification & Permissions :** Gestion sécurisée des sessions (JWT), interface adaptée aux rôles (Admin, Éditeur, Lecteur).
- **Interface responsive :** Conçue en Mobile-First avec Tailwind CSS.

---

## 🛠️ Stack Technique

- **Framework :** Vue 3 (Composition API / Vite) *ou* React
- **Gestion d'état :** Pinia *ou* Redux Toolkit
- **Routage :** Vue Router / React Router
- **Design & UI :** Tailwind CSS + Composants accessibles (Headless UI)
- **Client HTTP :** Axios avec intercepteurs pour refresh token

---

## 📦 Installation & Démarrage Local

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou pnpm

### Instructions

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/chtoure/CMS_FRONT.git
   cd CMS_FRONT
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer l'environnement :
   ```bash
   cp .env.example .env
   # Ajuster VITE_API_URL ou REACT_APP_API_URL selon votre backend
   ```

4. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```
   Si c'est démarrer alors l'application sera accessible sur `http://localhost:5173` (ou `3000`) de ta machine.

---

## 🔗 Dépôt Associé
Ce frontend communique avec l'API backend disponible ici : [CMS_BACKEND](https://github.com/chtoure/CMS_BACKEND).
