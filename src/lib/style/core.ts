/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResponsiveProp } from "../../type/component";

// --- TYPES ---
export type MapperFn<T> = (v: T) => string;

// --- TYPE GUARDS ---
/**
 * Reconnaît un objet responsif, même si la clé 'default' est absente.
 * Ceci permet de gérer des objets comme { md: 100 } valide.
 */
export function isResponsiveObject<T>(val: unknown): val is { default?: T; sm?: T; md?: T; lg?: T } {
  return typeof val === 'object' && val !== null &&
    ('default' in val || 'sm' in val || 'md' in val || 'lg' in val);
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
 * Ne propage JAMAIS undefined vers les breakpoints supérieurs.
 */
export function normalizeResponsiveProp<T>(
  val: unknown,
  resolver?: (v: unknown) => unknown
): { default: T; sm: T; md: T; lg: T } | null {
  if (val === undefined || val === null) return null;

  let processedVal = val;

  // Déballer VariableProperty via le resolver (niveau racine)
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

  const raw = { ...processedVal } as { default?: any; sm?: any; md?: any; lg?: any };

  // Helper pour déballer une variable VariableProperty au niveau d'un breakpoint
  const unwrap = (node: any) => {
    if (typeof node === 'object' && node !== null && 'type' in node && 'value' in node) {
      if (resolver) return resolver(node);
      if (node.type === 'static') return node.value;
      return undefined;
    }
    return node;
  };

  // Déballer les nœuds variable au niveau de chaque breakpoint
  if (raw.default !== undefined) raw.default = unwrap(raw.default);
  if (raw.sm !== undefined) raw.sm = unwrap(raw.sm);
  if (raw.md !== undefined) raw.md = unwrap(raw.md);
  if (raw.lg !== undefined) raw.lg = unwrap(raw.lg);

  // Cascade ascendante Mobile-first :
  // On hérite UNIQUEMENT si la valeur du breakpoint est undefined.
  // Si le breakpoint plus bas est aussi undefined, on ne propage pas de undefined "faux positif".
  const def = raw.default;
  const sm  = raw.sm  !== undefined ? raw.sm  : def;
  const md  = raw.md  !== undefined ? raw.md  : sm;
  const lg  = raw.lg  !== undefined ? raw.lg  : md;

  return { default: def as T, sm: sm as T, md: md as T, lg: lg as T };
}

export function resolveValue<T>(value: unknown, mapFn: MapperFn<T>, resolver?: (v: unknown) => unknown): string {
  const normalized = normalizeResponsiveProp<T>(value, resolver);
  if (!normalized) return '';

  const classes: string[] = [];

  // N'émettre une classe que si la valeur est définie (non-undefined)
  if (normalized.default !== undefined) classes.push(mapFn(normalized.default));
  if (normalized.sm !== undefined && normalized.sm !== normalized.default) classes.push(`sm:${mapFn(normalized.sm)}`);
  if (normalized.md !== undefined && normalized.md !== normalized.sm) classes.push(`md:${mapFn(normalized.md)}`);
  if (normalized.lg !== undefined && normalized.lg !== normalized.md) classes.push(`lg:${mapFn(normalized.lg)}`);

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

export const formatSize = (
  value: unknown,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown,
  defaultValue?: string
): string | undefined => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const finalValue = resolveValueForBreakpoint(value, breakpoint, resolver);

  if (finalValue === undefined || finalValue === null) return defaultValue;
  if (finalValue === 'full') return '100%';
  if (finalValue === 'screen') return '100vh';
  if (typeof finalValue === 'number') return `${finalValue}px`;
  if (typeof finalValue === 'string' && !isNaN(Number(finalValue)) && finalValue.trim() !== '') {
    return `${finalValue}px`;
  }
  if (typeof finalValue === 'string') return finalValue;
  return defaultValue;
};

/**
 * Filtre les classes Tailwind (sm:, md:, lg:, xl:, 2xl:) pour ne garder
 * que celles qui sont inférieures ou égales au breakpoint simulé actif.
 * Ceci permet au Builder de ne pas appliquer les styles desktop sur un petit écran simulé.
 */
export function filterResponsiveClasses(classesStr: string, activeBreakpoint: 'default' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'default'): string {
  if (!classesStr) return '';
  const classes = classesStr.split(/\s+/).filter(Boolean);

  const levels: Record<string, number> = {
    'default': 0,
    'sm': 1,
    'md': 2,
    'lg': 3,
    'xl': 4,
    '2xl': 5
  };

  const activeLevel = levels[activeBreakpoint] ?? 0;

  return classes.filter(cls => {
    let clsLevel = 0;
    if (cls.startsWith('sm:')) clsLevel = 1;
    else if (cls.startsWith('md:')) clsLevel = 2;
    else if (cls.startsWith('lg:')) clsLevel = 3;
    else if (cls.startsWith('xl:')) clsLevel = 4;
    else if (cls.startsWith('2xl:')) clsLevel = 5;

    // On conserve la classe "base" ou les classes <= au niveau actif
    return clsLevel <= activeLevel;
  }).join(' ');
}
