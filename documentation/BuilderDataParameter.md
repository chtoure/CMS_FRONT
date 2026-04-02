# Paramètres de Données (Builder Data)

Dans la couche du Builder, le rôle du composant n'est pas uniquement de s'afficher d'une certaine couleur (`styles`), mais aussi de consommer de la donnée (`data` / `params`).

## 1. Distinction Static vs Dynamic Data

L'objet JSON modélisant un composant contient :
- `data` : Les valeurs concrètes (ex: `content: "Mon titre de site"`).
- `params` : La "Définition de schéma" (le type attendu pour le label "Contenu" est un texte static, obligatoire).

*Un composant Texte typique sera défini comme ceci en base JSON :*
```json
{
  "tag": "TextBuilder",
  "data": {
    "content": "Bonjour le monde",
    "tag": "h1"
  },
  "params": [
    {
      "name": "content",
      "type": { "source": "STATIC", "value": "Bonjour le monde" }
    }
  ]
}
```

## 2. Les Sources de Variables (`ValueSource`)

Plutôt que d'être du simple texte statique, un champ du Builder peut-être lié ("*bound*") dynamiquement à une source globale. La bibliothèque gère les sources listées dans `ValueSource` (`src/type/params.ts`).

1. **`STATIC`** : Texte figé modifiable manuellement dans le panneau des propriétés.
2. **`IMAGE` / `MEDIA`** : L'ID ou l'URL absolue d'un fichier hébergé. Renvoie vers la sélection `CollectionMediaModal`.
3. **`VARIABLE`** : Fait référence à une clé d'une `CollectionVariable` (ex: La collection "Site Config", Champ "Slogan"). Si la variable globale est mise à jour depuis le dashboard, l'instance du Builder se met à jour.
4. **`CONTENT`** : *(Prévu pour l'intégration ContentEntry)* Fait référence au sous-champ d'une entité CMS pour le rendu paginé.

## 3. Hooks de Résolution (Le resolver)

Le parseur du composant utilise le composable `useVariableResolver()`.
Avant d'afficher `element.data.content`, le système le passe au resolver :

1. Si `type.source === STATIC`, le resolver retourne directement la chaîne de caractères.
2. Si `type.source === VARIABLE`, le resolver extrait l'ID unique lié dans les paramètres du JSON, va requêter l'interface Pinia du Store de Variables, et ramène en temps réel sa valeur actuelle.

Ce même système de Hook-Resolver est utilisé par le moteur de **Style** pour permettre la génération de couleurs/fonds via des variables globales (Gérer de l'UI Theme centralisé).

## 4. Propriétés Interactives (`cliquable`)

La famille de composants `interactive` (ex: `ButtonBuilder`) dispose de propriétés `data` spécifiques liées au click.
- `action` : Le type d'action défini (ex: `NAVIGATE_TO`, `OPEN_MODAL`, `SUBMIT_FORM`).
- `action_params` : La charge utile. Si `NAVIGATE_TO`, contient une URL absolue ou un lien ciblé interne. 

*Remarque : dans l'interface de construction du builder, les événements interactifs sont neutralisés via un `e.stopPropagation()` ou modifiés en sélection pour ne pas bloquer l'édition.*
