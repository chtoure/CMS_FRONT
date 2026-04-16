# Styles de Composants dans le Builder

Le **Builder Compositor** utilise un moteur de style granulaire qui compile dynamiquement un objet JSON de configuration CSS en classes utilitaires (Tailwind).

## 1. Types de Styles (`ContainerStyles` / `BlocStyles`)

Chaque élément modélisé dans le builder possède une propriété `styles` qui inclut les spécifications visuelles.
On distingue deux éléments :
- **Visual Styles** : ombres (`shadow`), couleurs de fond (`bg`), arrondis (`rounded`), transparence (`opacity`), bordure (`border`).
- **Layout Styles** : flexbox/grid layout (`direction`, `justify`, `align`, `columns`), espaces (`gap`, `padding`), marges (`margin`), largeur (`width`).

## 2. Modes Responsifs & "Mobile-First"

Une propriété stylistique (ex: `fontSize`) peut prendre une valeur simple (`14`) ou bien un objet responsif :
```json
{
  "fontSize": { "default": 14, "md": 18, "lg": 22 }
}
```
L'analyseur applique une **cascade Mobile-First**. Cela signifie que si `sm` est absent, il hérite de `default`. Si `lg` est absent, il hérite de `md`, conformément à l'approche de Tailwind CSS.

## 3. Map de Résolution (Visual Mapper / Format)

Le constructeur n'injecte pas brutalement des balises style. Il s'appuie sur une bibliothèque de parseurs localisée dans `src/lib/style/`.

- `core.ts` : Centralise les outils de normalisation des valeurs responsives et d'extraction de breakpoints.
- `shared.ts` (Mappers) : Fait correspondre une propriété (`roundedTopLeft: 10`) à une string utilisable (`rounded-tl-[10px]`).
- `sectionProcessor.ts` / `blocProcessor.ts` / `cardProcessor.ts` : Compilent l'ensemble des mappers pour générer une chaine de caractères `class="..."` ou un objet `:style="..."` selon la propriété (les images de fond dynamiques finissent dans les styles *inline*).

## 4. Affichage et Mode "Blueprint" (X-Ray)

Pour fluidifier l'usage d'un éditeur glisser-déposer sur le frontend, certaines modifications visuelles sont temporaires.

### Mode Blueprint (Survol)
Les sections et conteneurs n'appliquent pas de padding artificiel qui risque de provoquer du *Hover Flicker* (Vibrations). Au lieu de cela, le survol d'un composant déclenche l'affichage :
- D'un anneau de sélection coloré basé sur sa profondeur (`depth`) dans la grille de rendu imbriquée.
- S'il s'agit d'un "Container", la bordure guide visuellement l'usager avant le drop.

### Mode Structure (Rayon X)
Un raccourci disponible via la barre d'outils du builder (Bouton "Structure"). 
Quand il est activé de force via le `builderState` injecté dynamiquement, tous les conteneurs de la page adoptent une marge temporaire (`padding: 8px, gap: 8px`) et une bordure en pointillés, permettant de visualiser de force la profondeur "squelette" d'un design complet.

## 5. Distinction Conteneur / Contenu (Les sections)

Afin d'éviter tout conflit avec `position: absolute` et `flexbox`, la structure CSS des "Sections" du bloc racine se divise en deux conteneurs DOM imbriqués :
- `<section>` (Root) : S'occupe du positionnement absolu/fixe, de l'arrière plan visuel, des bordures et ombres. Reçoit la classe `flex flex-col`.
- `<VueDraggable>` (Enfant) : Reçoit les classes fonctionnelles du Layout spécifié par l'utilisateur (`columns`, `gap`, `justify`). Il épouse toujours l'espace du parent en `flex-1 w-full`.
