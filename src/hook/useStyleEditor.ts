import { inject } from 'vue';
import type { AnyComponentInstance, VariableProperty } from '../type/component';
import type { AnySectionInstance } from '../type/section';

export function useStyleEditor(element: AnyComponentInstance | AnySectionInstance) {
  const builderState = inject<{
    pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
    libraryTree: { value: AnyComponentInstance[] };
    selectedId: { value: string | null };
    builderMode: { value: 'page' | 'library' };
    selectComponent: (id: string | null) => void;
    currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  }>('builderState');

  const updateComponentStyle = (newStyles: any) => {
    if (!builderState) return;
    const updateTree = (items: (AnyComponentInstance | AnySectionInstance)[]): (AnyComponentInstance | AnySectionInstance)[] => {
      return items.map((item: any): any => {
        if (item.id === element.id) {
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

  const updateStyle = (key: string, value: any) => {
    if (!builderState) return;

    let finalValue;

    // Case 1: The incoming value is a complete VariableProperty object
    if (typeof value === 'object' && value !== null && 'type' in value && 'value' in value) {
        finalValue = value;
    } 
    // Case 2: The incoming value is a primitive for responsive editing
    else {
        const bp = builderState.currentBreakpoint.value;
        const currentProp = (element.styles as any)[key] as VariableProperty<any> | undefined;

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
    
    updateComponentStyle({ ...element.styles, [key]: finalValue });
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

  const getHexValue = (prop: unknown): string => {
    const raw = getRawValue(prop);
    if (!raw || typeof raw !== 'string') return 'FFFFFF';
    
    const cleanRaw = raw.startsWith('#') ? raw.slice(1) : raw;
    const jitMatch = cleanRaw.match(/\[#([0-9A-Fa-f]{6})\]/);
    if (jitMatch && jitMatch[1]) return jitMatch[1];
    
    const tailwindMap: Record<string, string> = {
      'bg-white': 'FFFFFF', 'text-white': 'FFFFFF',
      'bg-black': '000000', 'text-black': '000000',
      'bg-transparent': '00000000',
      'bg-slate-800': '1e293b'
    };

    if (tailwindMap[cleanRaw]) return tailwindMap[cleanRaw];
    if (/^[0-9A-Fa-f]{6,8}$/.test(cleanRaw)) return cleanRaw;
    
    return 'CCCCCC'; // Fallback for non-color strings (like variable keys)
  };

  return {
    builderState,
    getRawValue,
    getHexValue,
    updateStyle
  }
}
