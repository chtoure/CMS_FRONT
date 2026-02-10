import type { 
  CommonStyles, 
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

const COMMON_MAPPER: StyleMapper<CommonStyles> = {
  marginTop: (v) => formatDimension('mt', v),
  marginBottom: (v) => formatDimension('mb', v),
  padding: (v) => formatDimension('p', v),
  bg: (v) => formatColor('bg', v),
  rounded: (v) => formatDimension('rounded', v),
  shadow: (v) => (v === 'none' || v === 'default') ? (v === 'none' ? 'shadow-none' : 'shadow') : `shadow-${v}`,
  opacity: (v) => isNumeric(v) ? `opacity-[${v}]` : `opacity-${v}`,
  display: (v) => v,
};

const CONTAINER_MAPPER: StyleMapper<ContainerStyles> = {
  columns: (v) => `grid-cols-${v}`,
  gap: (v) => formatDimension('gap', v),
  direction: (v) => v === 'horizontal' ? 'flex-row' : 'flex-col',
  justify: (v) => `justify-${v}`,
  align: (v) => `items-${v}`,
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
  if (isResponsiveObject<T>(value)) {
    const classes: string[] = [];
    if (value.default !== undefined) classes.push(mapFn(value.default));
    if (value.sm !== undefined) classes.push(`sm:${mapFn(value.sm)}`);
    if (value.md !== undefined) classes.push(`md:${mapFn(value.md)}`);
    if (value.lg !== undefined) classes.push(`lg:${mapFn(value.lg)}`);
    return classes.join(' ');
  }
  return value !== undefined ? mapFn(value as T) : '';
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

  // Traitement séquentiel : Commun + Spécifique à la famille
  processMapper(COMMON_MAPPER);

  if (family === 'container') processMapper(CONTAINER_MAPPER);
  else if (family === 'static') processMapper(STATIC_MAPPER);
  else if (family === 'interactive') processMapper(INTERACTIVE_MAPPER);

  return allStyles.filter(Boolean).join(' ');
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

  // Only layout properties
  processMapper({
    display: COMMON_MAPPER.display
  });
  processMapper(CONTAINER_MAPPER);

  return layoutStyles.filter(Boolean).join(' ');
}

/**
 * Génère des styles CSS inline pour les propriétés dynamiques
 * (couleurs, dimensions, etc.) qui ne peuvent pas être générées
 * dynamiquement par Tailwind CSS
 */
export function buildInlineStyles(
  family: ComponentFamily,
  styles?: Record<string, unknown>
): Record<string, string> {
  if (!styles) return {};

  const inlineStyles: Record<string, string> = {};

  // Helper pour extraire la valeur par défaut d'une propriété responsive
  const getValue = (val: unknown): unknown => {
    if (val && typeof val === 'object' && 'default' in val) {
      return (val as { default: unknown }).default;
    }
    return val;
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

  // Padding
  if (styles.padding !== undefined) {
    const paddingValue = getValue(styles.padding);
    if (typeof paddingValue === 'number') {
      inlineStyles.padding = `${paddingValue}px`;
    } else if (typeof paddingValue === 'string' && !isNaN(Number(paddingValue))) {
      inlineStyles.padding = `${paddingValue}px`;
    }
  }

  // Margin Top
  if (styles.marginTop !== undefined) {
    const mtValue = getValue(styles.marginTop);
    if (typeof mtValue === 'number') {
      inlineStyles.marginTop = `${mtValue}px`;
    } else if (typeof mtValue === 'string' && !isNaN(Number(mtValue))) {
      inlineStyles.marginTop = `${mtValue}px`;
    }
  }

  // Margin Bottom
  if (styles.marginBottom !== undefined) {
    const mbValue = getValue(styles.marginBottom);
    if (typeof mbValue === 'number') {
      inlineStyles.marginBottom = `${mbValue}px`;
    } else if (typeof mbValue === 'string' && !isNaN(Number(mbValue))) {
      inlineStyles.marginBottom = `${mbValue}px`;
    }
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

  // Font Size (pour les static)
  if (family === 'static' && styles.fontSize !== undefined) {
    const fontSizeValue = getValue(styles.fontSize);
    if (typeof fontSizeValue === 'number') {
      inlineStyles.fontSize = `${fontSizeValue}px`;
    } else if (typeof fontSizeValue === 'string' && !isNaN(Number(fontSizeValue))) {
      inlineStyles.fontSize = `${fontSizeValue}px`;
    }
  }

  // Text Color (pour les static)
  if (family === 'static' && styles.textColor) {
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