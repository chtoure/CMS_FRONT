/* eslint-disable @typescript-eslint/no-explicit-any */
import type { 
  BaseStyles, 
  ComponentFamily, 
  ContainerStyles, 
  StaticStyles,
  InteractiveStyles,
  ResponsiveProp
} from "../type/component";

// --- TYPES UTILITAIRES ---
type BaseType<T> = T extends ResponsiveProp<infer U> ? U : T;
type MapperFn<T> = (v: T) => string;
type StyleMapper<T> = { [K in keyof T]?: MapperFn<BaseType<NonNullable<T[K]>>> };

// --- TYPE GUARDS ---
function isResponsiveObject<T>(val: unknown): val is { default: T; sm?: T; md?: T; lg?: T } {
  return typeof val === 'object' && val !== null && 'default' in val;
}

/**
 * Normalise une propriété responsive en s'assurant que chaque breakpoint a une valeur.
 * Applique la cascade Mobile-first : default -> sm -> md -> lg
 */
function normalizeResponsiveProp<T>(val: unknown): { default: T; sm: T; md: T; lg: T } | null {
  if (val === undefined || val === null) return null;
  
  if (!isResponsiveObject<T>(val)) {
    const v = val as T;
    return { default: v, sm: v, md: v, lg: v };
  }

  const res = { ...val } as { default: T; sm?: T; md?: T; lg?: T };
  
  // Cascade ascendante (Héritage)
  if (res.sm === undefined) res.sm = res.default;
  if (res.md === undefined) res.md = res.sm;
  if (res.lg === undefined) res.lg = res.md;
  
  return res as { default: T; sm: T; md: T; lg: T };
}

// --- MAPPERS ---
const isNumeric = (v: unknown): v is number | string => {
  if (typeof v === 'number') return true;
  return typeof v === 'string' && v !== '' && !isNaN(Number(v));
};

const formatDimension = (prefix: string, v: unknown) => {
  if (isNumeric(v)) return `${prefix}-[${v}px]`;
  if (typeof v === 'string' && (v.includes('px') || v.includes('rem') || v.includes('%') || v.includes('vh') || v.includes('vw'))) {
    return `${prefix}-[${v}]`;
  }
  return `${prefix}-${v}`;
};

const formatColor = (prefix: string, v: unknown) => {
  if (!v || typeof v !== 'string') return '';
  if (v.startsWith(prefix + '-')) return v;
  if (v === 'transparent' || v === 'inherit') return `${prefix}-${v}`;
  const hex = v.startsWith('#') ? v : `#${v}`;
  return `${prefix}-[${hex}]`;
};

const BASE_MAPPER: StyleMapper<BaseStyles & Record<string, any>> = {
  marginTop: (v) => formatDimension('mt', v),
  marginBottom: (v) => formatDimension('mb', v),
  padding: (v) => formatDimension('p', v),
  bg: (v) => formatColor('bg', v),
  rounded: (v) => formatDimension('rounded', v),
  roundedTopLeft: (v) => formatDimension('rounded-tl', v),
  roundedTopRight: (v) => formatDimension('rounded-tr', v),
  roundedBottomLeft: (v) => formatDimension('rounded-bl', v),
  roundedBottomRight: (v) => formatDimension('rounded-br', v),
  shadow: (v) => (v === 'none' || v === 'default') ? (v === 'none' ? 'shadow-none' : 'shadow') : `shadow-${v}`,
  opacity: (v) => isNumeric(v) ? `opacity-[${v}]` : `opacity-${v}`,
  display: (v) => v,
  width: (v) => `w-[${v}px]`,
  height: (v) => `h-[${v}px]`,
};

const CONTAINER_LAYOUT_MAPPER: StyleMapper<ContainerStyles> = {
  columns: (v) => `grid-cols-${v}`,
  gap: (v) => formatDimension('gap', v),
  direction: (v) => v === 'horizontal' ? 'flex-row' : 'flex-col',
  justify: (v) => `justify-${v}`,
  align: (v) => `items-${v}`,
};

const VISUAL_MAPPER: StyleMapper<any> = {
  bg: (v) => formatColor('bg', v),
  rounded: (v) => formatDimension('rounded', v),
  roundedTopLeft: (v) => formatDimension('rounded-tl', v),
  roundedTopRight: (v) => formatDimension('rounded-tr', v),
  roundedBottomLeft: (v) => formatDimension('rounded-bl', v),
  roundedBottomRight: (v) => formatDimension('rounded-br', v),
  shadow: (v) => (v === 'none' || v === 'default') ? (v === 'none' ? 'shadow-none' : 'shadow') : `shadow-${v}`,
  opacity: (v) => isNumeric(v) ? `opacity-[${v}]` : `opacity-${v}`,
  borderWidth: (v) => formatDimension('border', v),
  borderColor: (v) => formatColor('border', v),
  borderStyle: (v) => `border-${v}`,
};

const EXTERNAL_MAPPER: StyleMapper<any> = {
  marginTop: (v) => formatDimension('mt', v),
  marginBottom: (v) => formatDimension('mb', v),
  width: (v) => `w-[${v}px]`,
  height: (v) => `h-[${v}px]`,
};

const PADDING_MAPPER: StyleMapper<any> = {
  padding: (v) => formatDimension('p', v),
};

const STATIC_MAPPER: StyleMapper<StaticStyles> = {
  fontSize: (v) => formatDimension('text', v),
  fontWeight: (v) => `font-${v}`,
  textAlign: (v) => `text-${v}`,
  textColor: (v) => formatColor('text', v),
};

const INTERACTIVE_MAPPER: StyleMapper<InteractiveStyles> = {
  variant: (v) => `btn-${v}`,
  size: (v) => `btn-sz-${v}`,
};

// --- LOGIQUE DE RÉSOLUTION ---

function resolveValue<T>(value: unknown, mapFn: MapperFn<T>): string {
  const normalized = normalizeResponsiveProp<T>(value);
  if (!normalized) return '';

  const classes: string[] = [];
  
  // Valeur par défaut (Mobile-first)
  classes.push(mapFn(normalized.default));
  
  // On n'ajoute les préfixes responsive que si la valeur change par rapport au breakpoint précédent
  if (normalized.sm !== normalized.default) {
    classes.push(`sm:${mapFn(normalized.sm)}`);
  }
  
  if (normalized.md !== normalized.sm) {
    classes.push(`md:${mapFn(normalized.md)}`);
  }
  
  if (normalized.lg !== normalized.md) {
    classes.push(`lg:${mapFn(normalized.lg)}`);
  }
  
  return classes.filter(Boolean).join(' ');
}

/**
 * Résout la valeur d'une propriété responsive pour un breakpoint spécifique
 * en suivant la cascade Mobile-first.
 */
export function resolveValueForBreakpoint<T>(value: unknown, breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default'): T | undefined {
  const normalized = normalizeResponsiveProp<T>(value);
  if (!normalized) return undefined;
  return normalized[breakpoint];
}

/**
 * La nouvelle fonction buildStyles prend l'objet 'styles' typé
 */
export function buildStyles(
  family: ComponentFamily, 
  styles?: Record<string, unknown> // Ici on passe props.styles
): string {
  if (!styles) return '';
  
  const allStyles: string[] = [];

  const processMapper = <T extends object>(mapper: StyleMapper<T>) => {
    (Object.keys(mapper) as Array<keyof T>).forEach(key => {
      const value = styles[key as string];
      const mapFn = mapper[key];
      if (value !== undefined && mapFn) {
        allStyles.push(resolveValue(value, mapFn));
      }
    });
  };

  // Traitement séquentiel
  processMapper(EXTERNAL_MAPPER);
  processMapper(VISUAL_MAPPER);
  processMapper(PADDING_MAPPER);
  processMapper({ display: BASE_MAPPER.display });

  if (family === 'container') processMapper(CONTAINER_LAYOUT_MAPPER);
  else if (family === 'static') processMapper(STATIC_MAPPER);
  else if (family === 'interactive') processMapper(INTERACTIVE_MAPPER);

  return allStyles.filter(Boolean).join(' ');
}

export function buildVisualStyles(styles?: Record<string, unknown>): string {
  if (!styles) return '';
  const visualStyles: string[] = [];
  
  const processMapper = <T extends object>(mapper: StyleMapper<T>) => {
    (Object.keys(mapper) as Array<keyof T>).forEach(key => {
      const value = styles[key as string];
      const mapFn = mapper[key];
      if (value !== undefined && mapFn) {
        visualStyles.push(resolveValue(value, mapFn));
      }
    });
  };

  processMapper(VISUAL_MAPPER);
  processMapper(EXTERNAL_MAPPER); // External often goes with visual wrapper
  
  return visualStyles.filter(Boolean).join(' ');
}

export function buildLayoutStyles(styles?: Record<string, unknown>): string {
  if (!styles) return '';

  const layoutStyles: string[] = [];
  const processMapper = <T extends object>(mapper: StyleMapper<T>) => {
    (Object.keys(mapper) as Array<keyof T>).forEach(key => {
      const value = styles[key as string];
      const mapFn = mapper[key];
      if (value !== undefined && mapFn) {
        layoutStyles.push(resolveValue(value, mapFn));
      }
    });
  };

  // Only internal layout properties
  processMapper({ display: BASE_MAPPER.display });
  processMapper(PADDING_MAPPER); // Padding affects internal layout space
  processMapper(CONTAINER_LAYOUT_MAPPER);

  return layoutStyles.filter(Boolean).join(' ');
}

/**
 * Génère des styles CSS inline pour les propriétés dynamiques
 * (couleurs, dimensions, etc.) qui ne peuvent pas être générées
 * dynamiquement par Tailwind CSS
 */
export function buildInlineStyles(
  family: ComponentFamily,
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default'
): Record<string, string> {
  if (!styles) return {};

  const inlineStyles: Record<string, string> = {};

  // Helper pour extraire la valeur pour le breakpoint actuel
  const getValue = (val: unknown): unknown => {
    return resolveValueForBreakpoint(val, breakpoint);
  };

  // Couleur de fond
  if (styles.bg) {
    const bgValue = getValue(styles.bg);
    if (typeof bgValue === 'string') {
      if (bgValue.startsWith('#')) {
        inlineStyles.backgroundColor = bgValue;
      } else if (!bgValue.startsWith('bg-')) {
        inlineStyles.backgroundColor = `#${bgValue}`;
      }
    }
  }

  // Helper for formatting dimensions
  const formatInlineDimension = (val: unknown): string | undefined => {
    if (val === 'full') return '100%';
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && !isNaN(Number(val))) return `${val}px`;
    if (typeof val === 'string') return val;
    return undefined;
  };

  // Padding
  if (styles.padding !== undefined) {
    const val = getValue(styles.padding);
    const formatted = formatInlineDimension(val);
    if (formatted) inlineStyles.padding = formatted;
  }

  // Margin Top
  if (styles.marginTop !== undefined) {
    const val = getValue(styles.marginTop);
    const formatted = formatInlineDimension(val);
    if (formatted) inlineStyles.marginTop = formatted;
  }

  // Margin Bottom
  if (styles.marginBottom !== undefined) {
    const val = getValue(styles.marginBottom);
    const formatted = formatInlineDimension(val);
    if (formatted) inlineStyles.marginBottom = formatted;
  }

  // Border Radius (rounded)
  if (styles.rounded !== undefined) {
    const roundedValue = getValue(styles.rounded);
    if (typeof roundedValue === 'number') {
      inlineStyles.borderRadius = `${roundedValue}px`;
    } else if (typeof roundedValue === 'string' && !isNaN(Number(roundedValue))) {
      inlineStyles.borderRadius = `${roundedValue}px`;
    }
  }

  // Individual Corners
  const corners = [
    { key: 'roundedTopLeft', prop: 'borderTopLeftRadius' },
    { key: 'roundedTopRight', prop: 'borderTopRightRadius' },
    { key: 'roundedBottomLeft', prop: 'borderBottomLeftRadius' },
    { key: 'roundedBottomRight', prop: 'borderBottomRightRadius' },
  ];

  corners.forEach(({ key, prop }) => {
    const val = getValue(styles[key]);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inlineStyles[prop] = `${val}px`;
    }
  });

  // Border Width
  if (styles.borderWidth !== undefined) {
    const bwValue = getValue(styles.borderWidth);
    if (typeof bwValue === 'number') {
      inlineStyles.borderWidth = `${bwValue}px`;
    } else if (typeof bwValue === 'string' && !isNaN(Number(bwValue))) {
       inlineStyles.borderWidth = `${bwValue}px`;
    }
  }

  // Border Color
  if (styles.borderColor) {
    const bcValue = getValue(styles.borderColor);
    if (typeof bcValue === 'string') {
      if (bcValue.startsWith('#')) {
        inlineStyles.borderColor = bcValue;
      } else if (!bcValue.startsWith('border-')) {
        inlineStyles.borderColor = `#${bcValue}`;
      }
    }
  }

  // Border Style
  if (styles.borderStyle) {
    const bsValue = getValue(styles.borderStyle);
    if (typeof bsValue === 'string') {
      inlineStyles.borderStyle = bsValue;
    }
  }

  // Opacity
  if (styles.opacity !== undefined) {
    const opacityValue = getValue(styles.opacity);
    if (typeof opacityValue === 'number' || typeof opacityValue === 'string') {
      inlineStyles.opacity = String(opacityValue);
    }
  }

  // Gap (pour les containers)
  if (family === 'container' && styles.gap !== undefined) {
    const gapValue = getValue(styles.gap);
    if (typeof gapValue === 'number') {
      inlineStyles.gap = `${gapValue}px`;
    } else if (typeof gapValue === 'string' && !isNaN(Number(gapValue))) {
      inlineStyles.gap = `${gapValue}px`;
    }
  }

  // Grid Columns (pour GridBuilder via container family)
  if (family === 'container' && styles.columns !== undefined) {
    const colsValue = getValue(styles.columns);
    if (typeof colsValue === 'number' && colsValue > 0) {
      inlineStyles.gridTemplateColumns = `repeat(${colsValue}, minmax(0, 1fr))`;
      inlineStyles.display = 'grid'; // Force display grid if columns are defined
    }
  }

  // Font Size (pour static, input et interactive)
  if (['static', 'input', 'interactive'].includes(family) && styles.fontSize !== undefined) {
    const fontSizeValue = getValue(styles.fontSize);
    if (typeof fontSizeValue === 'number') {
      inlineStyles.fontSize = `${fontSizeValue}px`;
    } else if (typeof fontSizeValue === 'string' && !isNaN(Number(fontSizeValue))) {
      inlineStyles.fontSize = `${fontSizeValue}px`;
    }
  }

  // Text Color (pour static, input et interactive maintenant)
  if (['static', 'input', 'interactive'].includes(family) && styles.textColor) {
    const textColorValue = getValue(styles.textColor);
    if (typeof textColorValue === 'string') {
      if (textColorValue.startsWith('#')) {
        inlineStyles.color = textColorValue;
      } else if (!textColorValue.startsWith('text-')) {
        inlineStyles.color = `#${textColorValue}`;
      }
    }
  }

  return inlineStyles;
}

export function buildLayoutInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default'
): Record<string, string> {
  if (!styles) return {};
  const inlineStyles: Record<string, string> = {};

  const getValue = (val: unknown): unknown => {
    return resolveValueForBreakpoint(val, breakpoint);
  };

  // Helper for formatting dimensions
  const formatInlineDimension = (val: unknown): string | undefined => {
    if (val === 'full') return '100%';
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && !isNaN(Number(val))) return `${val}px`;
    if (typeof val === 'string') return val;
    return undefined;
  };

  // Padding
  if (styles.padding !== undefined) {
    const val = getValue(styles.padding);
    const formatted = formatInlineDimension(val);
    if (formatted) inlineStyles.padding = formatted;
  }

  // Gap
  if (styles.gap !== undefined) {
    const val = getValue(styles.gap);
    const formatted = formatInlineDimension(val);
    if (formatted) inlineStyles.gap = formatted;
  }

  // Grid Columns
  if (styles.columns !== undefined) {
    const colsValue = getValue(styles.columns);
    if (typeof colsValue === 'number' && colsValue > 0) {
      inlineStyles.gridTemplateColumns = `repeat(${colsValue}, minmax(0, 1fr))`;
      inlineStyles.display = 'grid';
    }
  }

  // Flex Direction (si pas grid)
  if (styles.direction && !inlineStyles.display) {
    const dirValue = getValue(styles.direction);
    if (dirValue === 'horizontal') {
      inlineStyles.flexDirection = 'row';
      inlineStyles.display = 'flex';
      inlineStyles.flexWrap = 'wrap'; // Souvent utile pour le layout horizontal
    } else if (dirValue === 'vertical') {
       inlineStyles.flexDirection = 'column';
       inlineStyles.display = 'flex';
    }
  }

  // Justify & Align
  if (styles.justify) {
    const justifyValue = getValue(styles.justify);
    const map: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' };
    if (typeof justifyValue === 'string' && map[justifyValue]) {
      inlineStyles.justifyContent = map[justifyValue];
    }
  }
   if (styles.align) {
    const alignValue = getValue(styles.align);
    const map: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
    if (typeof alignValue === 'string' && map[alignValue]) {
      inlineStyles.alignItems = map[alignValue];
    }
  }

  return inlineStyles;
}

export function buildVisualInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default'
): Record<string, string> {
  if (!styles) return {};
  const inlineStyles: Record<string, string> = {};

  const getValue = (val: unknown): unknown => {
    return resolveValueForBreakpoint(val, breakpoint);
  };

  // Background, Borders, Radius, Opacity, Dimensions, Margins
  
  if (styles.bg) {
    const bgValue = getValue(styles.bg);
    if (typeof bgValue === 'string') {
      if (bgValue.startsWith('#')) inlineStyles.backgroundColor = bgValue;
      else if (!bgValue.startsWith('bg-')) inlineStyles.backgroundColor = `#${bgValue}`;
    }
  }

  // Helper for formatting dimensions
  const formatInlineDimension = (val: unknown, key?: string): string | undefined => {
    if (val === 'full') return '100%';
    if (val === 'screen') {
      if (key && (key.toLowerCase().includes('width') || key.toLowerCase().includes('x'))) return '100vw';
      if (key && (key.toLowerCase().includes('height') || key.toLowerCase().includes('y'))) return '100vh';
      return '100vh'; // Default Fallback
    }
    if (val === 'auto') return 'auto';

    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && !isNaN(Number(val))) return `${val}px`;
    if (typeof val === 'string') return val;
    return undefined;
  };

  // Margins & Dimensions
  ['marginTop', 'marginBottom', 'width', 'height'].forEach(prop => {
    if (styles[prop] !== undefined) {
      const val = getValue(styles[prop]);
      const formatted = formatInlineDimension(val, prop);
      if (formatted) {
        inlineStyles[prop as any] = formatted;
      }
    }
  });

  // Radius
  if (styles.rounded !== undefined) {
    const val = getValue(styles.rounded);
    const formatted = formatInlineDimension(val);
     if (formatted) inlineStyles.borderRadius = formatted;
  }

  const corners = [
    { key: 'roundedTopLeft', prop: 'borderTopLeftRadius' },
    { key: 'roundedTopRight', prop: 'borderTopRightRadius' },
    { key: 'roundedBottomLeft', prop: 'borderBottomLeftRadius' },
    { key: 'roundedBottomRight', prop: 'borderBottomRightRadius' },
  ];
  corners.forEach(({ key, prop }) => {
    const val = getValue(styles[key]);
    const formatted = formatInlineDimension(val);
    if (formatted) inlineStyles[prop] = formatted;
  });

  // Borders
  if (styles.borderWidth !== undefined) {
    const val = getValue(styles.borderWidth);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inlineStyles.borderWidth = `${val}px`;
    }
  }
  if (styles.borderColor) {
    const val = getValue(styles.borderColor);
    if (typeof val === 'string') {
      if (val.startsWith('#')) inlineStyles.borderColor = val;
      else if (!val.startsWith('border-')) inlineStyles.borderColor = `#${val}`;
    }
  }
  if (styles.borderStyle) {
    const val = getValue(styles.borderStyle);
    if (typeof val === 'string') inlineStyles.borderStyle = val;
  }

  // Opacity
  if (styles.opacity !== undefined) {
    const val = getValue(styles.opacity);
    if (typeof val === 'number' || typeof val === 'string') inlineStyles.opacity = String(val);
  }

  // Static/Text styles could go here if needed, but CardBuilder is mostly container
  // For safety, let's include text styles if they leak into Card
  if (styles.textColor) {
    const val = getValue(styles.textColor);
    if (typeof val === 'string') {
      if (val.startsWith('#')) inlineStyles.color = val;
      else if (!val.startsWith('text-')) inlineStyles.color = `#${val}`;
    }
  }

  return inlineStyles;
}