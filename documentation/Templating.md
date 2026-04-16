# Templating (BlocTemplates)

Le système de **Templating** de Compositor permet de composer des mises en page réutilisables à partir d'une hiérarchie de blocs visuels imbriqués. Il forme le cœur du Builder, en liant la structure JSON persistée en base de données à des composants Vue rendu en temps réel.

## 1. Hiérarchie d'une Page

Une page Compositor est structurée en trois niveaux :

```
Page
├── Section (AnySectionInstance)
│   ├── BlocTemplate (AnySectionInstance children)
│   │   ├── Composant (AnyComponentInstance)
│   │   │   └── Composant enfant (Container récursif)
│   │   └── Composant
│   └── BlocTemplate
└── Section
```

- **Page** : Ensemble de Sections ordonnées (tri par propriété `order`)
- **Section** : Conteneur racine de la mise en page, correspond à la balise `<section>` HTML. Gère la hauteur, le fond, le positionnement (`sticky`, `fixed`, `absolute`)
- **BlocTemplate** : Composant enfant d'une Section. Peut être un composant atomique (Texte, Image, Bouton) ou un conteneur récursif (Card, Accordéon, Slider)

## 2. Le BlocTemplate JSON

Chaque bloc est sérialisé en JSON avec la structure suivante :

```json
{
  "id": "cuid_unique",
  "tag": "TextBuilder",
  "family": "static",
  "name": "Titre Principal",
  "order": 1,
  "styles": {
    "fontSize": { "default": 24, "md": 32 },
    "textColor": "#111827",
    "textAlign": "center"
  },
  "params": [
    {
      "name": "content",
      "label": "Contenu",
      "type": { "source": "STATIC", "value": "Bienvenue !" }
    }
  ],
  "data": {
    "content": "Bienvenue !",
    "tag": "h1"
  },
  "children": []
}
```

## 3. Bibliothèque de Composants (Palette)

La **palette du Builder** liste les composants disponibles qui peuvent être glissés-déposés sur le canevas. Chaque composant est défini dans `src/components/config/config-component.ts` avec ses `defaultProps` (styles et données par défaut).

| Tag Builder | Famille | Description |
| :--- | :--- | :--- |
| `TextBuilder` | `static` | Texte simple ou titre |
| `ImageBuilder` | `static` | Image avec alt |
| `IconBuilder` | `static` | Icône Lucide vectorielle |
| `ButtonBuilder` | `interactive` | Bouton cliquable avec action |
| `InputBuilder` | `input` | Champ de formulaire |
| `CardBuilder` | `container` | Conteneur visuel récursif |
| `SliderBuilder` | `container` | Carrousel d'éléments |
| `AccordionBuilder` | `container` | Section repliable |

## 4. Blocs Personnalisés (Save as Custom)

L'utilisateur peut sauvegarder n'importe quelle combinaison de blocs comme un **composant réutilisable** via le bouton "Enregistrer comme modèle" dans le panneau des propriétés. Ces blocs personnalisés apparaissent dans un onglet dédié de la palette et peuvent être réutilisés sur n'importe quelle page.

## 5. Gestion du Glisser-Déposer

Le Builder utilise `VueDraggable` (basé sur SortableJS) pour orchestrer :
- Le **dépôt** depuis la palette vers le canevas
- Le **réordonnancement** des blocs au sein d'une section
- Le **déplacement** entre sections (inter-conteneurs)
- L'**imbrication récursive** dans les composants de famille `container`

Lors d'un glisser, `builderState.isDragging` est mis à `true` via `setIsDragging()`, ce qui déclenche le **Mode Blueprint** pour visualiser les zones de dépôt.
