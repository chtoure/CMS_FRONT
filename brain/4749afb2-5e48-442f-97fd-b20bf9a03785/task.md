# Task: Création des Éditeurs de Style par Composant (Terminé)

# Task: Correction du Composant TextBuilder (Terminé)

# Task: Résolution des Variables dans les Propriétés de Données (Terminé)

# Task: Correction des Bugs de Stylisation du Texte (Terminé)

# Task: Ajout des Propriétés de Layout au TextBuilder (Terminé)

# Task: Correction du LinkStyleEditor & Harmonisation (Terminé)

# Task: Correction de l'Erreur de Création du Lien (400 Bad Request) (Terminé)

# Task: Refactorisation des Styles Partagés & Correction Position Lien (Terminé)

## Core & Refactor

- [x] Créer `src/lib/style/common.ts` avec la logique partagée (Typography, Layout, Visual)
- [x] Refactoriser `textProcessor.ts` pour utiliser `common.ts`
- [x] Refactoriser `linkProcessor.ts` pour utiliser `common.ts` (Correction position)
- [x] Refactoriser `buttonProcessor.ts` pour utiliser `common.ts`
- [x] Refactoriser `inputProcessor.ts` pour utiliser `common.ts`

## Vérification

- [x] Vérifier que le Lien applique W, H, Padding et Margins
- [x] Vérifier que le Bouton et l'Input supportent aussi ces nouveaux styles
- [x] S'assurer qu'aucune régression n'a été introduite sur le TextBuilder

## Historique (Condensé)

- [x] Correction de l'erreur 400 lors de la création d'un "Lien"
- [x] Suppression des doublons Position dans les éditeurs
- [x] Support des variables dans les champs de base (BaseStyleEditor)
