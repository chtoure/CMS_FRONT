# Types de Contenu (Content Types)

Un **Type de Contenu** est un schéma de données structuré défini par l'administrateur. Il sert de **modèle** pour la saisie de données répétitives et structurées (type articles de blog, fiches produit, membres d'équipe, etc.).

## 1. Concept

Contrairement aux Variables (simples valeurs clé/valeur), un Type de Contenu est composé de **plusieurs champs typés**. Chaque champ possède un nom, un type de données attendu, et éventuellement des contraintes de validation.

**Exemple : Type de Contenu "Article de Blog"**

| Champ | Type | Obligatoire |
| :--- | :--- | :--- |
| `titre` | Texte | Oui |
| `contenu` | Texte long | Oui |
| `image_couverture` | Image/Média | Non |
| `date_publication` | Date | Oui |
| `auteur` | Texte | Non |

## 2. Types de Champs Disponibles

Le schéma d'un Content Type peut inclure des champs des types suivants :
- **Text** : Chaîne de caractères courte
- **Long Text / Richtext** : Contenu éditorial long
- **Number** : Valeur numérique
- **Boolean** : Interrupteur vrai/faux
- **Date** : Sélecteur de date
- **Media** : Référence à un fichier de la Médiathèque
- **Relation** : Lien vers une entrée d'un autre Content Type

## 3. Architecture Technique

Les types de contenus sont définis et stockés côté backend, mais le frontend (`ContentTypeListView.vue` et l'éditeur associé) permet de les créer, modifier et supprimer via l'interface d'administration.

- Chaque Content Type possède un `slug` unique utilisé comme identifiant stable dans les requêtes API.
- La liste des Content Types est consommée par le builder lors de la configuration d'un composant itérable (Conteneur en mode CMS), permettant de définir quelle collection de données alimentera la répétition des blocs enfants.

## 4. Contrôle d'Accès

| Permission | Effet |
| :--- | :--- |
| `read_content_type` | Accès à la liste et au détail des Content Types |
| `create_content_type` | Création d'un nouveau schéma |
| `update_content_type` | Modification d'un schéma existant |
| `delete_content_type` | Suppression d'un schéma (et potentiellement de ses entrées) |

## 5. Relation avec le Builder (Itération)

Quand un conteneur (Section ou BlocRender) est configuré en mode **Itération** (`isIterated: true`), l'utilisateur sélectionne le Content Type source. Le builder génère alors dynamiquement les blocs enfants pour chaque entrée (ContentEntry) associée à ce type, permettant de construire des listes, des grilles ou des carrousels de contenu dynamique.
