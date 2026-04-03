# Médiathèque

La Médiathèque est le gestionnaire centralisé de tous les fichiers numériques du projet (images, vidéos, documents). Elle est accessible via la route `/site/admin/media` et gérée par `src/views/media/MediaListView.vue`.

## 1. Fonctionnalités Principales

| Fonctionnalité | Description |
| :--- | :--- |
| **Upload** | Import de fichiers multiples depuis le système de fichiers local (via `<input type="file" multiple>`) |
| **Recherche** | Filtrage en temps réel par nom de fichier avec debounce |
| **Filtrage par type** | Filtres : Tout, Images, Vidéos, Documents |
| **Pagination** | Navigation par pages (limite configurable, par défaut 20 fichiers) |
| **Sélection & Aperçu** | Cliquer sur un fichier affiche son aperçu et ses métadonnées dans un panneau latéral |
| **Modification de l'alt** | Édition du texte alternatif (`alt`) pour l'accessibilité |
| **Suppression** | Suppression définitive avec confirmation |

## 2. Types de Fichiers Gérés

- **Images** : Formats web standard (JPG, PNG, WebP, SVG, GIF, etc.)
- **Vidéos** : Formats `mp4`, `webm`, etc. — avec aperçu via balise `<video>`
- **Documents** : PDF et autres fichiers non-visuels (représentés par une icône `FileText`)

## 3. Hooks Utilisés (`src/hook/media.ts`)

| Hook | Rôle |
| :--- | :--- |
| `useGetMediaList(params)` | Récupère la liste paginée des médias avec recherche et filtre de type |
| `useCreateMedia()` | Upload d'un ou plusieurs fichiers via FormData |
| `useUpdateMedia()` | Mise à jour des métadonnées (ex: texte `alt`) |
| `useDeleteMedia()` | Suppression physique d'un fichier |

## 4. Contrôle d'Accès par Permissions

Les actions de la Médiathèque sont conditionnées par le hook `usePermission()`. Un utilisateur sans les droits appropriés ne verra tout simplement pas les boutons correspondants.

| Permission | Effet |
| :--- | :--- |
| `upload_media` | Affiche le bouton d'import et le sélecteur de fichiers |
| `update_media` | Affiche le champ de modification du texte alternatif (`alt`) |
| `delete_media` | Affiche le bouton "Supprimer" dans le panneau de détail |

```html
<!-- Exemple : Le bouton d'upload n'apparaît que si l'utilisateur a la permission -->
<div v-if="hasPermission(['upload_media'])" class="flex items-center gap-3">
  <input ref="fileInput" type="file" multiple @change="handleFileUpload" />
  <Button @click="triggerFileInput">Importer</Button>
</div>
```

## 5. Utilisation dans le Builder

Les médias de la Médiathèque sont accessibles depuis le Builder via le composant `CompositionMediaPicker.vue`. Lors de l'édition d'un composant Image ou d'une propriété de fond (`bgImage`), l'utilisateur peut parcourir et sélectionner directement un fichier depuis la Médiathèque.

L'URL retournée par l'API est stockée dans `data.src` ou `styles.bgImage` du composant concerné, selon le cas d'usage.
