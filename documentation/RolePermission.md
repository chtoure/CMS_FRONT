# Rôles et Permissions

Compositor implémente un système granulaire de contrôle d'accès basé sur les permissions. Plutôt que de limiter l'accès par "Rôles" (Admin, Editeur, etc.), l'interface réagit directement aux "**Permissions**" accordées à l'utilisateur ciblé (ex: `create_media`, `read_collection`).

## 1. Récupération des Permissions

Lors de la connexion ou du chargement de l'application, le profil utilisateur fourni par l'API inclut généralement une structure listant ses rôles ou permissions. Le hook `src/hook/usePermission.ts` analyse le store d'authentification pour extraire un tableau de chaines de caractères (`string[]`) représentant ces droits.

## 2. Le Hook `usePermission`

C'est l'outil principal pour l'UI. Il expose une fonction réactive `hasPermission(permissionsToCheck: string[])`.

```typescript
import { usePermission } from '../../hook/usePermission.ts';

const { hasPermission } = usePermission();

// Vérifie si l'utilisateur possède AU MOINS UNE des permissions suivantes
const canEdit = hasPermission(['update_content_entry', 'admin_override']);
```

### Mécanique d'évaluation
1. Si aucune permission n'est demandée (`[]`), la fonction retourne `true`.
2. Si le tableau n'est pas vide, elle vérifie via un `.some()` si le tableau de permissions de l'utilisateur inclut l'une des permissions requises.
3. Si la correspondance est trouvée, le bloc UI est affiché, sinon il est masqué de l'arbre DOM.

## 3. Application dans l'Interface Vue

### Masquage d'éléments (Boutons, Menus)
On utilise la directive standard `v-if` combinée à notre hook pour protéger les actions sensibles.

**Exemple : Cacher le bouton "Créer une Variable" si l'utilisateur n'a pas le droit.**
```html
<button 
  v-if="hasPermission(['create_variable'])" 
  @click="addNewVariable" 
  class="btn-primary"
>
  + Nouvelle Variable
</button>
```

**Exemple : Protéger les menus contextuels (Suppression).**
```html
<DropdownMenuSeparator v-if="hasPermission(['delete_content_entry'])" />
<DropdownMenuItem v-if="hasPermission(['delete_content_entry'])" @click="handleArchive">
  <Trash2 class="w-4 h-4" /> Supprimer
</DropdownMenuItem>
```

### Protection des Routes
Bien que principalement utilisé dans les composants UI, ce même principe peut être appliqué dans les guards du routeur (`src/router/index.ts`) en vérifiant les `meta.permissions` d'une route ciblée avant d'autoriser la navigation, bloquant ainsi l'accès URL direct.
