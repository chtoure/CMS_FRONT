# Documentation Technique : Gestion des Types de Contenu

Cette documentation détaille le fonctionnement des fichiers responsables de la structure des données dans le CMS : `ContentTypeListView.vue`, `ContentTypeFormView.vue` et `ContentTypeEditView.vue`.

---

## 1. ContentTypeListView.vue (La Liste)

Ce fichier affiche tous les types de contenu existants dans un tableau interactif.

### 📦 Bloc 1 : Configuration et États Réactifs

**Quoi :** Définition des colonnes du tableau et des variables de contrôle (pagination, recherche, filtres).
**Pourquoi :** Utiliser des variables réactives (`ref`) permet à Vue.js de mettre à jour l'interface instantanément dès que l'utilisateur interagit.
**Avantages :** Centralisation de la configuration.
**Inconvénients :** Si le nombre de colonnes devient trop grand, l'objet `columns` peut devenir difficile à lire.

#### 🔍 Analyse Ligne par Ligne (Extraits)

- **L26-34 :** `const columns = [...]` définit les entêtes du tableau (`key` pour la donnée, `label` pour le texte affiché).
- **L36-39 :** Initialisation de la pagination (`currentPage`) et de la recherche (`search`).
- **L48-52 :** `filterParams` est une `computed` qui regroupe tous les paramètres pour l'API. Si une valeur change, l'API est prête à être rappelée.

### 📦 Bloc 2 : Communication avec l'API

**Quoi :** Utilisation de Hooks personnalisés pour récupérer, archiver ou supprimer des données.
**Pourquoi :** L'utilisation de `tanstack-vue-query` (via les hooks) gère automatiquement le cache, les états de chargement et les erreurs.
**Avantages :** Réduction drastique du code de gestion de données dans le composant.
**Inconvénients :** Dépendance forte aux services API externes.

#### 🔍 Analyse Ligne par Ligne

- **L56-62 :** `useGetContentTypes(filterParams)` lance la récupération des données.
- **L70-72 :** Un `watch` surveille les changements de page ou de filtre pour relancer la recherche (`refetch`).
- **L129-164 :** Fonctions `handleArchive`, `handleRestore`, `handleDelete` qui appellent les mutations API et affichent des notifications (`showToast`).

---

## 2. ContentTypeFormView.vue (Le Constructeur)

C'est l'outil le plus complexe : il permet de créer la "forme" (schéma) des futurs contenus.

### 📦 Bloc 1 : Initialisation et Unicité du Titre

**Quoi :** Création d'un champ "Titre" automatique à l'index 0 et gestion de son nom technique.
**Pourquoi :** Chaque contenu a besoin d'un titre. Le masquer le rend "système", mais permettre à l'utilisateur de nommer un autre champ "title" demande une adaptation dynamique pour éviter les bugs de base de données.
**Avantages :** Expérience utilisateur fluide (pas d'erreur si l'utilisateur veut utiliser le mot "title").
**Inconvénients :** Complexité accrue de la logique de synchronisation (`watch` profond).

#### 🔍 Analyse Ligne par Ligne

- **L73-81 :** Initialisation de `fields` avec l'objet "title".
- **L108 :** `visibleFields` utilise `.slice(1)` pour cacher le premier élément (le titre système).
- **L125-154 :** Un `watch` surveille les noms de tous les champs. Si un doublon avec "title" est détecté, le champ système se renomme en interne (ex: `_title`).

### 📦 Bloc 2 : Gestion Dynamique des Champs

**Quoi :** Fonctions pour ajouter, copier ou supprimer des champs personnalisés.
**Pourquoi :** Permet une flexibilité totale dans la création de structures (Articles, Produits, Événements...).
**Avantages :** Interface très proche d'ACF (WordPress), intuitive.
**Inconvénients :** L'utilisation de `any[]` pour les champs est nécessaire pour la flexibilité mais réduit la sécurité du typage strict.

#### 🔍 Analyse Ligne par Ligne

- **L144-166 :** `addField()` génère un nom unique (`champ_N`) en vérifiant qu'il n'existe pas déjà dans la boucle `while`.
- **L224-238 :** `duplicateField()` crée une copie profonde (`JSON.parse(JSON.stringify)`) pour éviter que la copie ne modifie l'original.

### 📦 Bloc 3 : Validation Zod

**Quoi :** Vérification de la validité des champs de base (Nom, Slug).
**Pourquoi :** Empêcher l'envoi de caractères spéciaux interdits ou de noms trop courts avant que le serveur ne rejette la requête.
**Avantages :** Feedback immédiat pour l'utilisateur sans rechargement.

#### 🔍 Analyse Ligne par Ligne

- **L310-326 :** `contentTypeSchema.safeParse(form.value)` vérifie tout d'un coup. Les erreurs sont formatées et stockées dans `errors` pour l'affichage en rouge dans le template.

---

## 3. ContentTypeEditView.vue (La Modification)

Ce fichier est visuellement identique au formulaire de création, mais sa logique de chargement diffère.

### 📦 Bloc 1 : Chargement et Peuplement (Hydratation)

**Quoi :** Récupération des données existantes par ID et remplissage du formulaire.
**Pourquoi :** L'utilisateur doit modifier une structure existante, pas en créer une nouvelle.
**Avantages :** Persistance des données.
**Inconvénients :** Risque de désynchronisation si les données reçues ne correspondent pas exactement au format attendu par les composants UI.

#### 🔍 Analyse Ligne par Ligne

- **L85 :** `useGetContentTypeById(contentTypeId)` récupère les données dès le chargement.
- **L114-118 :** Un `watch` attend que les données arrivent de l'API pour appeler `populateForm`.
- **L120-128 :** `populateForm` copie les valeurs reçues dans les variables réactives locales du composant.

---

## 💡 Glossaire pour les débutants

- **`ref`** : Une boîte magique qui contient une valeur. Si vous changez le contenu de la boîte, l'écran se met à jour tout seul.
- **`computed`** : Une valeur calculée automatiquement à partir d'autres variables (ex: la liste filtrée).
- **`watch`** : Un espion qui surveille une variable et exécute du code dès qu'elle change.
- **`Zod`** : Un garde-barrière qui vérifie que les informations saisies sont correctes.
- **`Hook`** : Un petit outil prêt à l'emploi pour parler à la base de données sans refaire tout le travail de connexion.

---

## 🚀 Bonnes Pratiques pour l'avenir

1.  **Unique Name** : Toujours utiliser le nom technique (`name`) pour identifier un champ en base de données, pas son libellé.
2.  **Validation** : Toujours vérifier le `slug` (pas d'espaces, pas de majuscules).
3.  **Clean Up** : Utiliser la fonction `cleanedFields` pour ne pas envoyer d'options inutiles (ex: ne pas envoyer d'options de sélection pour un champ de type "Nombre").
