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

  // Plus besoin de `getLatestElement` ni de `updateTree` coûteux en O(N) !
  // Dans Vue 3, `initialElement` est un Proxy réactif provenant de l'arbre principal.
  // Toute mutation directe sur cet objet est traquée par Vue et met à jour l'UI instantanément.

  const updateStyles = (updates: Record<string, any>) => {
    if (!builderState) return;

    if (!initialElement.styles) {
      initialElement.styles = {};
    }

    const bp = builderState.currentBreakpoint.value;

    Object.entries(updates).forEach(([key, value]) => {
      // Lire la valeur actuelle existante (le wrapper VariableProperty/static)
      const currentWrapper = (initialElement.styles as any)[key] as { type: string; value: any } | undefined;
      
      // Extraire la valeur "interne" si c'est un wrapper statique, sinon la valeur brute
      let currentInnerValue: any;
      if (currentWrapper && typeof currentWrapper === 'object' && 'type' in currentWrapper && 'value' in currentWrapper) {
        if (currentWrapper.type === 'static') {
          currentInnerValue = currentWrapper.value;
        } else {
          // C'est une variable racine - on la remplace entièrement
          currentInnerValue = undefined;
        }
      } else {
        // Valeur legacy ou undefined
        currentInnerValue = currentWrapper;
      }

      // Déterminer si la valeur interne est un objet responsif
      const isResponsiveObj = typeof currentInnerValue === 'object' && currentInnerValue !== null && 
                              ('default' in currentInnerValue || 'sm' in currentInnerValue || 'md' in currentInnerValue || 'lg' in currentInnerValue);

      let finalValue: any;

      if (bp === 'default') {
        if (isResponsiveObj) {
          // Mettre à jour la clé 'default' en conservant les autres breakpoints
          finalValue = { type: 'static', value: { ...currentInnerValue, default: value } };
        } else {
          // Première affectation ou valeur scalaire simple
          finalValue = { type: 'static', value: value };
        }
      } else {
        if (isResponsiveObj) {
          // Ajouter/mettre à jour le breakpoint spécifique sans toucher aux autres
          finalValue = { type: 'static', value: { ...currentInnerValue, [bp]: value } };
        } else if (currentInnerValue !== undefined) {
          // On avait une valeur scalaire 'default', on crée un objet responsif
          finalValue = { type: 'static', value: { default: currentInnerValue, [bp]: value } };
        } else {
          // Aucune valeur précédente: on stocke SEULEMENT pour ce breakpoint,
          // sans créer de clé 'default: undefined' qui polluerait la cascade
          finalValue = { type: 'static', value: { [bp]: value } };
        }
      }

      (initialElement.styles as any)[key] = finalValue;
    });
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
    const isResponsiveObj = typeof valueToProcess === 'object' && valueToProcess !== null && 
                            ('default' in valueToProcess || 'sm' in valueToProcess || 'md' in valueToProcess || 'lg' in valueToProcess);

    if (isResponsiveObj) {
      const res = valueToProcess as any;
      let node;
      if (res[bp] !== undefined) node = res[bp];
      else if (bp === 'lg' && res.md !== undefined) node = res.md;
      else if ((bp === 'lg' || bp === 'md') && res.sm !== undefined) node = res.sm;
      else node = res.default;

      if (typeof node === 'object' && node !== null && 'type' in node && 'value' in node) {
        return node.value;
      }
      return node;
    }

    return (typeof valueToProcess === 'string' || typeof valueToProcess === 'number') ? valueToProcess : undefined;
  };

  const getRawNode = (prop: unknown): any => {
    if (!prop) return undefined;
    let valueToProcess = prop;
    if (typeof prop === 'object' && prop !== null && 'type' in prop && 'value' in prop) {
        const varProp = prop as VariableProperty<any>;
        if (varProp.type === 'variable') return varProp;
        valueToProcess = varProp.value;
    }
    const bp = builderState?.currentBreakpoint.value || 'default';
    const isResponsiveObj = typeof valueToProcess === 'object' && valueToProcess !== null && 
                            ('default' in valueToProcess || 'sm' in valueToProcess || 'md' in valueToProcess || 'lg' in valueToProcess);

    if (isResponsiveObj) {
      const res = valueToProcess as any;
      if (res[bp] !== undefined) return res[bp];
      if (bp === 'lg' && res.md !== undefined) return res.md;
      if ((bp === 'lg' || bp === 'md') && res.sm !== undefined) return res.sm;
      return res.default;
    }
    return valueToProcess;
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
    getRawNode,
    getRawValue,
    getResolvedValue,
    getHexValue,
    updateStyle,
    updateStyles
  }
}
