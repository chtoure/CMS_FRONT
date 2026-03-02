import { inject } from 'vue';
import type { AnyComponentInstance } from '../type/component';
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

  const getRawValue = (val: unknown): string | number | undefined => {
    if (!val) return undefined;
    const bp = builderState?.currentBreakpoint.value || 'default';
    
    if (typeof val === 'object' && val !== null && 'default' in val) {
      const res = val as any;
      if (res[bp] !== undefined) return res[bp];
      if (bp === 'lg' && res.md !== undefined) return res.md;
      if ((bp === 'lg' || bp === 'md') && res.sm !== undefined) return res.sm;
      return res.default;
    }
    
    return (typeof val === 'string' || typeof val === 'number') ? val : undefined;
  };

  const getHexValue = (val: unknown): string => {
    const raw = getRawValue(val);
    if (!raw || typeof raw !== 'string') return 'FFFFFF';
    const cleanRaw = raw.startsWith('#') ? raw.slice(1) : raw;
    const jitMatch = cleanRaw.match(/\[#([0-9A-Fa-f]{6})\]/);
    if (jitMatch && jitMatch[1]) return jitMatch[1];
    if (/^[0-9A-Fa-f]{6}$/.test(cleanRaw)) return cleanRaw;
    
    const tailwindMap: Record<string, string> = {
      'bg-white': 'FFFFFF', 'text-white': 'FFFFFF',
      'bg-black': '000000', 'text-black': '000000',
      'bg-transparent': '00000000',
      'bg-slate-800': '1e293b'
    };
    
    return tailwindMap[cleanRaw] || 'FFFFFF';
  };

  const updateStyle = (key: string, value: string | number | boolean | undefined) => {
    if (!builderState) return;
    const bp = builderState.currentBreakpoint.value;
    const currentVal = (element.styles as any)[key];
    let newStyles = { ...element.styles } as any;

    if (value === undefined || value === null || value === '') {
      // Remove the property entirely when unsetting
      delete newStyles[key];
    } else {
      let newValue: any;
      if (typeof currentVal === 'object' && currentVal !== null && 'default' in currentVal) {
        newValue = { ...currentVal, [bp]: value };
      } else if (bp === 'default') {
        newValue = value;
      } else {
        newValue = { default: currentVal, [bp]: value };
      }
      newStyles[key] = newValue;
    }

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

  return {
    builderState,
    getRawValue,
    getHexValue,
    updateStyle
  };
}
