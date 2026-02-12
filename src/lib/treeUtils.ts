import type { AnyComponentInstance } from '../type/component';

/**
 * Trouve récursivement un composant par son ID dans l'arbre.
 */
export function findComponentById(tree: AnyComponentInstance[], id: string): AnyComponentInstance | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findComponentById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Met à jour un composant spécifique dans l'arbre de manière immuable pour déclencher la réactivité de Vue.
 */
export function updateComponentInTree(
  tree: AnyComponentInstance[],
  id: string,
  updates: Partial<AnyComponentInstance>
): AnyComponentInstance[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: updateComponentInTree(node.children, id, updates),
      };
    }
    return node;
  });
}
