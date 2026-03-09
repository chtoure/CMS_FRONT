/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResponsiveProp } from "../../type/component";

// --- TYPES ---
export type MapperFn<T> = (v: T) => string;

// --- TYPE GUARDS ---
export function isResponsiveObject<T>(val: unknown): val is { default: T; sm?: T; md?: T; lg?: T } {
  return typeof val === 'object' && val !== null && 'default' in val;
}

export const isNumeric = (v: unknown): v is number | string => {
  if (typeof v === 'number') return true;
  return typeof v === 'string' && v !== '' && !isNaN(Number(v));
};

// --- FORMATTERS ---
export const formatDimension = (prefix: string, v: unknown) => {
  if (isNumeric(v)) return `${prefix}-[${v}px]`;
  if (typeof v === 'string' && (v.includes('px') || v.includes('rem') || v.includes('%') || v.includes('vh') || v.includes('vw'))) {
    return `${prefix}-[${v}]`;
  }
  return `${prefix}-${v}`;
};

export const formatColor = (prefix: string, v: unknown) => {
  if (!v || typeof v !== 'string') return '';
  if (v.startsWith(prefix + '-')) return v;
  if (v === 'transparent' || v === 'inherit') return `${prefix}-${v}`;
  const hex = v.startsWith('#') ? v : `#${v}`;
  return `${prefix}-[${hex}]`;
};

// --- RESOLUTION ---

/**
 * Normalise une propriété responsive en s'assurant que chaque breakpoint a une valeur.
 * Applique la cascade Mobile-first : default -> sm -> md -> lg
 */
export function normalizeResponsiveProp<T>(
  val: unknown, 
  resolver?: (v: unknown) => unknown
): { default: T; sm: T; md: T; lg: T } | null {
  if (val === undefined || val === null) return null;

  let processedVal = val;
  
  // Déballer VariableProperty via le resolver
  if (typeof val === 'object' && val !== null && 'type' in val && 'value' in val) {
    if (resolver) {
      processedVal = resolver(val);
    } else if ((val as any).type === 'static') {
      processedVal = (val as any).value;
    } else {
      return null; 
    }
  }

  if (processedVal === undefined || processedVal === null) return null;
  
  if (!isResponsiveObject<T>(processedVal)) {
    const v = processedVal as T;
    return { default: v, sm: v, md: v, lg: v };
  }

  const res = { ...processedVal } as { default: T; sm?: T; md?: T; lg?: T };
  
  // Cascade ascendante (Héritage)
  if (res.sm === undefined) res.sm = res.default;
  if (res.md === undefined) res.md = res.sm;
  if (res.lg === undefined) res.lg = res.md;
  
  return res as { default: T; sm: T; md: T; lg: T };
}

export function resolveValue<T>(value: unknown, mapFn: MapperFn<T>, resolver?: (v: unknown) => unknown): string {
  const normalized = normalizeResponsiveProp<T>(value, resolver);
  if (!normalized) return '';

  const classes: string[] = [];
  classes.push(mapFn(normalized.default));
  
  if (normalized.sm !== normalized.default) classes.push(`sm:${mapFn(normalized.sm)}`);
  if (normalized.md !== normalized.sm) classes.push(`md:${mapFn(normalized.md)}`);
  if (normalized.lg !== normalized.md) classes.push(`lg:${mapFn(normalized.lg)}`);
  
  return classes.filter(Boolean).join(' ');
}

export function resolveValueForBreakpoint<T>(
  value: unknown, 
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): T | undefined {
  const normalized = normalizeResponsiveProp<T>(value, resolver);
  if (!normalized) return undefined;
  return normalized[breakpoint];
}

export const formatSize = (value: unknown, breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default', resolver?: (v: unknown) => unknown, defaultValue?: string): string | undefined => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const finalValue = resolveValueForBreakpoint(value, breakpoint, resolver);
  
  if (finalValue === 'full') return '100%';
  if (typeof finalValue === 'number') return `${finalValue}px`;
  if (typeof finalValue === 'string' && !isNaN(Number(finalValue)) && finalValue.trim() !== '') {
    return `${finalValue}px`;
  }
  return finalValue as string;
};
