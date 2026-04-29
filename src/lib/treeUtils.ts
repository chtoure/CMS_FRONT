/* eslint-disable @typescript-eslint/no-explicit-any */
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
/**
 * Insère un nouvel élément dans l'arbre.
 * - Si targetId est null, ajoute à la fin de l'arbre principal (root).
 * - Si strategy='append', ajoute l'élément à la fin des enfants de targetId.
 * - Si strategy='after', ajoute l'élément juste après targetId dans sa liste parente.
 */
export function insertIntoTree(
  tree: (AnyComponentInstance | AnySectionInstance)[],
  targetId: string | null,
  item: AnyComponentInstance | AnySectionInstance,
  strategy: 'append' | 'after'
): (AnyComponentInstance | AnySectionInstance)[] {
  if (targetId === null) {
    return [...tree, item];
  }

  // Vérifier si la target est dans le root et strategy='after'
  if (strategy === 'after') {
    const rootIndex = tree.findIndex(n => n.id === targetId);
    if (rootIndex !== -1) {
      const newTree = [...tree];
      newTree.splice(rootIndex + 1, 0, item);
      return newTree;
    }
  }

  return tree.map((node) => {
    if (node.id === targetId && strategy === 'append') {
      return {
        ...node,
        children: [...(node.children || []), item],
      } as any;
    }
    
    if (node.children?.length) {
      if (strategy === 'after') {
        const childIndex = (node.children as any[]).findIndex(n => n.id === targetId);
        if (childIndex !== -1) {
          const newChildren = [...(node.children as any[])];
          newChildren.splice(childIndex + 1, 0, item);
          return {
            ...node,
            children: newChildren,
          } as any;
        }
      }

      return {
        ...node,
        children: insertIntoTree(node.children as (AnyComponentInstance | AnySectionInstance)[], targetId, item, strategy),
      } as any;
    }
    return node;
  });
}

/**
 * Déplace un élément d'un cran vers le haut ou vers le bas dans l'arbre (au sein de son parent).
 */
export function moveInTree(
  tree: (AnyComponentInstance | AnySectionInstance)[],
  targetId: string,
  direction: 'up' | 'down'
): (AnyComponentInstance | AnySectionInstance)[] {
  const rootIndex = tree.findIndex(n => n.id === targetId);
  if (rootIndex !== -1) {
    const tempTree = [...tree];
    if (direction === 'up' && rootIndex > 0) {
      [tempTree[rootIndex - 1], tempTree[rootIndex]] = [tempTree[rootIndex]!, tempTree[rootIndex - 1]!];
    } else if (direction === 'down' && rootIndex < tempTree.length - 1) {
      [tempTree[rootIndex + 1], tempTree[rootIndex]] = [tempTree[rootIndex]!, tempTree[rootIndex + 1]!];
    }
    return tempTree;
  }

  return tree.map((node) => {
    if (node.children?.length) {
      const childIndex = (node.children as any[]).findIndex(n => n.id === targetId);
      if (childIndex !== -1) {
        const newChildren = [...(node.children as any[])];
        if (direction === 'up' && childIndex > 0) {
          [newChildren[childIndex - 1], newChildren[childIndex]] = [newChildren[childIndex]!, newChildren[childIndex - 1]!];
        } else if (direction === 'down' && childIndex < newChildren.length - 1) {
          [newChildren[childIndex + 1], newChildren[childIndex]] = [newChildren[childIndex]!, newChildren[childIndex + 1]!];
        }
        return {
          ...node,
          children: newChildren,
        } as any;
      }

      return {
        ...node,
        children: moveInTree(node.children as (AnyComponentInstance | AnySectionInstance)[], targetId, direction),
      } as any;
    }
    return node;
  });
}
