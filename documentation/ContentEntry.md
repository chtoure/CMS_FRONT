# Entrées de Contenu (Content Entries)

Une **Entrée de Contenu** (Content Entry) est une instance de données créée à partir d'un **Type de Contenu**. Si le Type de Contenu est le moule, l'entrée est la pièce moulée.

## 1. Cycle de Vie d'une Entrée

Une entrée passe par plusieurs états :

```
DRAFT (Brouillon) → PUBLISHED (Publié) → ARCHIVED (Archivé)
                                        ↓
                                   CORBEILLE (Suppression douce)
```

| Statut | Description |
| :--- | :--- |
| **Brouillon** | Créée mais non visible sur le site final |
| **Publié** | Active et visible dans le rendu |
| **Archivé** | Désactivée mais conservée en base, non visible |
| **Corbeille** | Marquée pour suppression, récupérable depuis `ContentEntryCorbeilleView.vue` |

## 2. Gestion depuis l'Interface

### Liste des entrées (`ContentEntryListView.vue`)
- Tableau paginé de toutes les entrées du type sélectionné
- Filtrage par statut (Tout, Publié, Brouillon, Archivé)
- Recherche textuelle
- Actions rapides par entrée (menu dropdown) :
  - **Aperçu** : Visualisation de l'entrée
  - **Modifier** : Accès au formulaire d'édition
  - **Changer le statut** : Bascule Brouillon/Publié
  - **Archiver** : Déplace vers archivé
  - **Supprimer** : Envoie en corbeille

### Formulaire de création/édition
- Champs générés dynamiquement selon le schéma du Content Type
- Chaque champ correspond au type défini (texte, image, date, etc.)
- Boutons de sauvegarde et de changement de statut directement dans le formulaire

### Corbeille (`ContentEntryCorbeilleView.vue`)
- Liste des entrées supprimées (suppression douce)
- Actions disponibles :
  - **Restaurer** : Replace l'entrée en statut Brouillon
  - **Supprimer définitivement** : Destruction permanente

## 3. Contrôle d'Accès

| Permission | Effet |
| :--- | :--- |
| `read_content_entry` | Accès à la liste des entrées |
| `create_content_entry` | Affiche le bouton "Créer" et accès au formulaire de création |
| `update_content_entry` | Accès à la modification, changement de statut, restauration |
| `delete_content_entry` | Archivage, suppression et suppression définitive |

```html
<!-- Exemple : Bouton "Créer" conditionnel -->
<div v-if="hasPermission(['create_content_entry'])" class="flex items-center gap-4">
  <Button @click="navigateToCreate">Nouveau Contenu</Button>
</div>
```

## 4. Intégration avec le Builder (Rendu Dynamique)

En mode **Itération**, le moteur de rendu (`BlocRenderView.vue`) consomme les entrées d'un Content Type pour répéter dynamiquement les blocs enfants. Chaque item (`_inherited_item`) est injecté via `parentData` et les paramètres du bloc font le mapping entre les champs de l'entrée et les emplacements visuels :

```typescript
// Dans BlocRenderView.vue
if (p.type?.source === 'parent' && p.type?.parentKey) {
  const val = item[p.type.parentKey]; // ex: item['titre']
  data[p.name] = val; // Injecté dans le composant TextBuilder
}
```

Cela permet de construire une liste de cartes (produits, articles, membres) dont le contenu est alimenté 100% depuis le backend CMS, sans modifier le template visuel.
