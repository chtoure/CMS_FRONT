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
const COMMON_MAPPER: StyleMapper<CommonStyles> = {
  marginTop: (v) => `mt-${v}`,
  marginBottom: (v) => `mb-${v}`,
  padding: (v) => `p-${v}`,
  bg: (v) => `bg-${v}`,
  rounded: (v) => `rounded-${v}`,
  shadow: (v) => `shadow-${v}`,
  opacity: (v) => `opacity-${v}`,
  display: (v) => v,
};

const CONTAINER_MAPPER: StyleMapper<ContainerStyles> = {
  columns: (v) => `grid-cols-${v}`,
  gap: (v) => `gap-${v}`,
  direction: (v) => v === 'horizontal' ? 'flex-row' : 'flex-col',
  justify: (v) => `justify-${v}`,
  align: (v) => `items-${v}`,
};

const STATIC_MAPPER: StyleMapper<StaticStyles> = {
  fontSize: (v) => `text-${v}`,
  fontWeight: (v) => `font-${v}`,
  textAlign: (v) => `text-${v}`,
  textColor: (v) => `text-${v}`,
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