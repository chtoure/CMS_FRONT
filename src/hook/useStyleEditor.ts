/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from 'vue';
import type { AnyComponentInstance, VariableProperty } from '../type/component';
import type { AnySectionInstance } from '../type/section';
import { useVariableResolver } from './variable';

export function useStyleEditor(initialElement: AnyComponentInstance | AnySectionInstance) {
  const builderState = inject<{
    pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
    libraryTree: { value: AnyComponentInstance[] };
    selectedId: { value: string | null };
    builderMode: { value: 'page' | 'library' };
    selectComponent: (id: string | null) => void;
    currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  }>('builderState');
  
  const { resolveValue } = useVariableResolver();

  // Helper pour trouver l'élément le plus frais dans l'arbre
  const getLatestElement = (): AnyComponentInstance | AnySectionInstance => {
    if (!builderState) return initialElement;
    
    const tree = builderState.builderMode.value === 'page' 
      ? builderState.pageTree.value 
      : builderState.libraryTree.value;

    const findInTree = (items: (AnyComponentInstance | AnySectionInstance)[]): AnyComponentInstance | AnySectionInstance | null => {
      for (const item of items) {
        if (item.id === initialElement.id) return item;
        if (item.children) {
          const found = findInTree(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInTree(tree) || initialElement;
  };

  const updateComponentStyle = (newStyles: any) => {
    if (!builderState) return;
    const targetId = initialElement.id;

    const updateTree = (items: (AnyComponentInstance | AnySectionInstance)[]): (AnyComponentInstance | AnySectionInstance)[] => {
      return items.map((item: any): any => {
        if (item.id === targetId) {
          return { ...item, styles: newStyles };
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) };
        }
        return item;
      });
    };
    
    if (builderState.builderMode.value === 'page') {
      builderState.pageTree.value = updateTree(builderState.pageTree.value);
    } else {
      builderState.libraryTree.value = updateTree(builderState.libraryTree.value) as AnyComponentInstance[];
    }
  };

  const updateStyles = (updates: Record<string, any>) => {
    if (!builderState) return;

    // IMPORTANT: On récupère la version la plus fraîche de l'élément avant de merger
    const currentElement = getLatestElement();
    const newStyles = { ...(currentElement.styles || {}) };
    const bp = builderState.currentBreakpoint.value;

    Object.entries(updates).forEach(([key, value]) => {
      let finalValue;

      if (typeof value === 'object' && value !== null && 'type' in value && 'value' in value) {
        finalValue = value;
      } else {
        const currentProp = (newStyles as any)[key] as VariableProperty<any> | undefined;
        if (currentProp?.type === 'variable') {
            console.warn(`Cannot apply responsive edit to a property linked to a variable.`);
            return;
        }

        const currentStaticValue = currentProp?.value;

        if (bp === 'default') {
          if (typeof currentStaticValue === 'object' && currentStaticValue !== null && 'default' in currentStaticValue) {
            finalValue = { type: 'static', value: { ...currentStaticValue, default: value } };
          } else {
            finalValue = { type: 'static', value: value };
          }
        } else {
          let newResponsiveValue;
          if (typeof currentStaticValue === 'object' && currentStaticValue !== null && 'default' in currentStaticValue) {
            newResponsiveValue = { ...currentStaticValue, [bp]: value };
          } else {
            newResponsiveValue = { default: currentStaticValue, [bp]: value };
          }
          finalValue = { type: 'static', value: newResponsiveValue };
        }
      }
      (newStyles as any)[key] = finalValue;
    });

    updateComponentStyle(newStyles);
  };

  const updateStyle = (key: string, value: any) => {
    updateStyles({ [key]: value });
  };

  const getRawValue = (prop: unknown): string | number | undefined => {
    if (!prop) return undefined;

    let valueToProcess = prop;

    if (typeof prop === 'object' && prop !== null && 'type' in prop && 'value' in prop) {
        const varProp = prop as VariableProperty<any>;
        if (varProp.type === 'variable') {
            return varProp.value;
        }
        valueToProcess = varProp.value;
    }

    const bp = builderState?.currentBreakpoint.value || 'default';
    if (typeof valueToProcess === 'object' && valueToProcess !== null && 'default' in valueToProcess) {
      const res = valueToProcess as any;
      if (res[bp] !== undefined) return res[bp];
      if (bp === 'lg' && res.md !== undefined) return res.md;
      if ((bp === 'lg' || bp === 'md') && res.sm !== undefined) return res.sm;
      return res.default;
    }

    return (typeof valueToProcess === 'string' || typeof valueToProcess === 'number') ? valueToProcess : undefined;
  };

  const getResolvedValue = (prop: unknown): any => {
    return resolveValue(prop as any);
  };

  const getHexValue = (prop: unknown): string => {
    const raw = getResolvedValue(prop);
    if (!raw || typeof raw !== 'string') return 'FFFFFF';
    
    const cleanRaw = raw.startsWith('#') ? raw.slice(1) : raw;
    if (/^[0-9A-Fa-f]{6,8}$/.test(cleanRaw)) return cleanRaw;

    const jitMatch = cleanRaw.match(/\[#([0-9A-Fa-f]{6})\]/);
    if (jitMatch && jitMatch[1]) return jitMatch[1];
    
    const tailwindMap: Record<string, string> = {
      'bg-white': 'FFFFFF', 'text-white': 'FFFFFF',
      'bg-black': '000000', 'text-black': '000000',
      'bg-transparent': '00000000',
      'bg-slate-800': '1e293b'
    };

    if (tailwindMap[cleanRaw]) return tailwindMap[cleanRaw];
    
    return 'CCCCCC'; 
  };

  return {
    builderState,
    getRawValue,
    getResolvedValue,
    getHexValue,
    updateStyle,
    updateStyles,
    getLatestElement // Optionnel, mais utile pour le debug
  }
}
