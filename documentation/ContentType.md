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

## 3. Architecture Technique : Shadow Mirroring

Les types de contenus sont définis dynamiquement via un schéma JSON (`fields_schema`). Cependant, pour garantir la performance et l'intégrité relationnelle, Compositor utilise une architecture de **Shadow Mirroring**.

1. **Slug Unique** : Utilisé comme identifiant stable dans les requêtes API.
2. **Tables Pivots SQL** : Chaque relation définie dans le JSON est automatiquement "mise en miroir" dans la table SQL `ContentTypeRelation`. Cela permet d'effectuer des jointures SQL natives et de protéger l'intégrité des données (ex: empêcher la suppression d'un type référencé).

---

## 4. Migration de Schéma (`logiqueModContentType`)

Lorsqu'un schéma de Content Type est modifié (ajout, suppression ou modification de type d'un champ), le système applique une **migration asynchrone** sur les entrées existantes :
- **Suppression** : Les données des champs supprimés sont retirées du JSON des entrées.
- **Normalisation** : Si un type change (ex: texte vers relation), la valeur est réinitialisée à `null` pour éviter les erreurs de typage au rendu.

---

## 5. Contrôle d'Accès

| Permission | Effet |
| :--- | :--- |
| `read_content_type` | Accès à la liste et au détail des Content Types |
| `create_content_type` | Création d'un nouveau schéma |
| `update_content_type` | Modification d'un schéma existant |
| `delete_content_type` | Suppression d'un schéma (et potentiellement de ses entrées) |

---

## 6. Relation avec le Builder (Itération)

Quand un conteneur (Section ou BlocRender) est configuré en mode **Itération** (`isIterated: true`), l'utilisateur sélectionne le Content Type source. Le builder génère alors dynamiquement les blocs enfants pour chaque entrée (ContentEntry) associée à ce type, permettant de construire des listes, des grilles ou des carrousels de contenu dynamique.
