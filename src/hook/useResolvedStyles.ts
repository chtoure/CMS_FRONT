import { computed, inject } from 'vue';
import { useVariableResolver } from './variable';
import type { AnyComponentInstance, VariableProperty } from '../type/component';

export function useResolvedStyles(element: AnyComponentInstance) {
  const builderState = inject<{
    currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  }>('builderState');

  const { resolveValue } = useVariableResolver();

  // Helper local pour résoudre le responsive (similaire à styleProcessor mais adapté ici)
  const resolveResponsive = (val: any, bp: string) => {
      if (typeof val === 'object' && val !== null && 'default' in val) {
          if (val[bp] !== undefined) return val[bp];
          if (bp === 'lg' && val.md !== undefined) return val.md;
          if ((bp === 'lg' || bp === 'md') && val.sm !== undefined) return val.sm;
          return val.default;
      }
      return val;
  }

  const resolvedStyles = computed(() => {
    const styles = element.styles || {};
    const bp = builderState?.currentBreakpoint.value || 'default';
    const result: Record<string, string | number> = {};

    for (const [key, prop] of Object.entries(styles)) {
      // 1. Résoudre la variable (VariableProperty -> Valeur brute ou Responsive Object)
      // Si c'est une variable, on obtient sa valeur (ex: "#FF0000" ou "20px")
      // Si c'est statique, on obtient l'objet interne (ex: { default: 10, md: 20 })
      const resolvedVar = resolveValue(prop as VariableProperty<any>);

      // 2. Résoudre le responsive (Responsive Object -> Valeur finale pour le breakpoint)
      const finalValue = resolveResponsive(resolvedVar, bp);
      
      if (finalValue !== undefined && finalValue !== null) {
          result[key] = finalValue;
      }
    }
    return result;
  });

  return { resolvedStyles };
}