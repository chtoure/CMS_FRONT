# Collections & Variables

Le module Collections/Variables permet de gérer des **valeurs réutilisables typées** qui peuvent être injectées dynamiquement dans les composants du Builder. C'est l'équivalent d'un système de Design Tokens ou de variables d'environnement runtime accessible à tous les blocs visuels.

## 1. Concepts Clés

### Collection
Une **Collection** est un groupe logique de variables partageant le **même type de donnée**. Par exemple :
- Collection `"Palette de couleurs"` → Type `COLOR`
- Collection `"Configuration Site"` → Type `STRING`
- Collection `"Flags"` → Type `BOOLEAN`

### Variable
Une **Variable** est une entrée unique dans une collection, définie par :
- `name` : identifiant lisible (ex: `primary-color`, `site-title`)
- `value` : la valeur stockée comme chaîne de caractères
- `type` : hérité de la collection parente

## 2. Types de Variables Supportés

| Type | Description | Interface d'édition |
| :--- | :--- | :--- |
| `COLOR` | Couleur hexadécimale (ex: `#3B82F6`) | Color Picker visuel |
| `STRING` | Texte libre (titre, slogan, URL) | Champ texte |
| `NUMBER` | Valeur numérique | Champ numérique |
| `BOOLEAN` | Commutateur vrai/faux | Bouton toggle |

## 3. Interface Utilisateur (`VariableListView.vue`)

L'interface se décompose en deux zones :

**Panneau gauche (Sidebar)** :
- Liste toutes les collections disponibles
- Permet de sélectionner une collection pour filtrer les variables
- Menu `+` pour créer une nouvelle collection (si permission `create_collection`)
- Clic droit (Context Menu) sur une collection pour l'ouvrir ou la supprimer

**Panneau droit (Table)** :
- Tableau paginé des variables de la collection sélectionnée
- **Double-clic** sur le nom ou la valeur pour éditer en place (*inline editing*)
- Recherche textuelle multi-champs (nom et valeur)
- Context Menu par variable : Renommer, Copier la valeur, Supprimer

## 4. Contrôle d'Accès

| Permission | Effet |
| :--- | :--- |
| `read_collection` | Affiche la liste des collections dans la sidebar |
| `create_collection` | Affiche le bouton `+` pour créer une collection |
| `create_variable` | Affiche le bouton `+` pour ajouter une variable dans la collection |
| `read_variable` | Accès au panneau Variables depuis les Propriétés du Builder |

## 5. Intégration dans le Builder

Les variables peuvent être liées à n'importe quel champ d'un composant Builder dont la source est `VARIABLE`. Le hook `useVariableResolver()` résout automatiquement la référence :

```typescript
// Dans un composant du Builder, la valeur data.content peut être liée à une variable
const resolvedValue = resolveValue(element.data.content);
// Si le param.type.source === 'VARIABLE', le resolver va chercher la valeur live dans le store
```

Ce mécanisme garantit que **modifier une variable dans le dashboard met à jour instantanément** tous les composants qui y font référence sans qu'il soit nécessaire de republier manuellement chaque page.

## 6. Hooks Utilisés (`src/hook/variable.ts`)

| Hook | Rôle |
| :--- | :--- |
| `useGetCollections(search?)` | Récupère toutes les collections (et leurs variables) |
| `useCreateCollection()` | Crée une nouvelle collection typée |
| `useDeleteCollection()` | Supprime une collection et ses variables |
| `useCreateVariable()` | Crée une variable dans une collection |
| `useUpdateVariable()` | Met à jour le `name` ou `value` d'une variable |
| `useDeleteVariable()` | Supprime une variable individuelle |
