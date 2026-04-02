# Moteur de Rendu (Render Engine)

Le moteur de rendu transforme l'arborescence JSON persistée en base de données en un arbre de composants Vue affichable dans le navigateur. Son objectif est de produire un rendu **fidèle à 100%** à ce que l'utilisateur a construit dans le Builder.

## 1. Architecture du Rendu

Le composant central est `src/views/renderPage/BlocRenderView.vue`. Il fonctionne de manière **récursive** : chaque bloc peut contenir d'autres blocs.

```
PageRenderView
└── BlocRenderView (Section racine)
    └── BlocRenderView (BlocTemplate enfant)
        ├── <component :is="TextBuilder" :data="..." />
        └── BlocRenderView (Conteneur récursif)
            └── <component :is="CardBuilder" :data="..." />
```

## 2. Résolution des Composants

À partir du `tag` d'un bloc (ex: `"TextBuilder"`), le moteur de rendu charge dynamiquement le composant Vue correspondant via la **registry centralisée** :

```typescript
// src/registry/component_registry.ts
export const COMPONENT_MAP = {
  TextBuilder: defineAsyncComponent(() => import('@/components/builder/TextBuilder.vue')),
  CardBuilder: defineAsyncComponent(() => import('@/components/builder/CardBuilder.vue')),
  // ...
}
```

Si le `tag` n'est **pas** dans le registre (cas des Sections racines qui n'ont pas de tag), c'est une section HTML native `<section>` qui est rendue avec les classes et styles appliqués directement.

## 3. Injection de Données

Le moteur fusionne les données selon cette priorité :
1. `element.data` : Données statiques du bloc (stockées en JSON)
2. `parentData` : Données héritées du conteneur parent (ex: item CMS en cours d'itération)

Ce système permet l'**itération CMS dynamique** : un conteneur en mode `isIterated` répète ses blocs enfants N fois, une fois pour chaque entrée retournée par le backend.

```typescript
// Injection des données d'un item CMS dans les paramètres du bloc
if (p.type?.source === 'parent' && p.type?.parentKey) {
  const val = item[p.type.parentKey];
  data[p.name] = val;
}
```

## 4. Parité Builder / Rendu

Un soin particulier a été apporté pour que le rendu final soit **pixel-perfect** par rapport à ce qui est construit dans le Builder :

- Les **classes de layout** (`flex`, `grid`, `gap`, `justify`, etc.) sont calculées par les mêmes fonctions utilitaires (`buildBlocLayoutStyles`, `buildBlocLayoutInlineStyles`) utilisées dans `BlocRender.vue`.
- Les **styles inline** (couleurs de fond hexadécimales, tailles en pixels, arrière-plans d'image) sont générés par les mêmes processeurs (`cardProcessor.ts`, `sectionProcessor.ts`).
- Le **tri par `order`** garantit que les blocs s'affichent dans le même ordre que dans le Builder.
- La **cascade Mobile-First** des breakpoints est respectée à l'identique.

## 5. Visibilité Conditionnelle

Le moteur respecte la propriété de visibilité définie dans le Builder. Via `builderState.isVisible()`, chaque bloc peut être affiché ou masqué selon son état, sans être retiré du DOM (utilisation de `v-show` pour préserver le flux).

## 6. Rendu Côté Client (CSR)

Actuellement, le rendu est purement **côté client (SPA)**. La page est chargée comme application Vue, puis l'arborescence JSON est récupérée depuis l'API backend et rendue dans le navigateur.

> [!TIP]
> Pour un meilleur SEO et des performances de premier affichage optimales, une migration vers le Rendu Côté Serveur (SSR via **Nuxt.js**) ou la Génération Statique (SSG) pourrait être envisagée à l'avenir.
