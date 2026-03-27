import type { AnyComponentInstance } from '../type/component';

import type { AnySectionInstance } from '../type/section';

/**
 * Trouve récursivement un composant ou une section par son ID dans l'arbre.
 */
export function findComponentById(tree: (AnyComponentInstance | AnySectionInstance)[], id: string): AnyComponentInstance | AnySectionInstance | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findComponentById(node.children as (AnyComponentInstance | AnySectionInstance)[], id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Met à jour un composant ou une section spécifique dans l'arbre de manière immuable.
 */
export function updateComponentInTree(
  tree: (AnyComponentInstance | AnySectionInstance)[],
  id: string,
  updates: Partial<AnyComponentInstance | AnySectionInstance>
): (AnyComponentInstance | AnySectionInstance)[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates } as any;
    }
    if (node.children?.length) {
      return {
        ...node,
        children: updateComponentInTree(node.children as (AnyComponentInstance | AnySectionInstance)[], id, updates),
      } as any;
    }
    return node;
  });
}

/**
 * Supprime récursivement un composant ou une section de l'arbre de manière immuable.
 */
export function removeFromTree(
  tree: (AnyComponentInstance | AnySectionInstance)[],
  id: string
): (AnyComponentInstance | AnySectionInstance)[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children?.length) {
        return {
          ...node,
          children: removeFromTree(node.children as (AnyComponentInstance | AnySectionInstance)[], id),
        } as any;
      }
      return node;
    });
}
