/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint, formatDimension } from "./core";
import { applyPositioningInline } from "./common";

const BLOC_LAYOUT_MAPPER = {
  columns: (v: any) => `grid-cols-${v}`,
  gap: (v: any) => '', // Géré en inline style (plus fiable)
  direction: (v: any) => {
    const map: Record<string, string> = { horizontal: 'flex-row', vertical: 'flex-col' };
    return typeof v === 'string' ? map[v] || '' : '';
  },
  justify: (v: any) => '', // Géré en inline style
  align: (v: any) => '',   // Géré en inline style
  padding: (v: any) => formatDimension('p', v),
  paddingX: (v: any) => formatDimension('px', v),
  paddingY: (v: any) => formatDimension('py', v),
};

export function buildBlocLayoutStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  // Display
  if (styles.display !== undefined) {
    classes.push(resolveValue(styles.display, (v) => v as string, resolver));
  }

  // Layout Properties (direction only from class mapper)
  (Object.keys(BLOC_LAYOUT_MAPPER) as Array<keyof typeof BLOC_LAYOUT_MAPPER>).forEach(key => {
    const value = styles[key];
    if (value !== undefined) {
      classes.push(resolveValue(value, BLOC_LAYOUT_MAPPER[key], resolver));
    }
  });

  return classes.filter(Boolean).join(' ');
}

export function buildBlocLayoutInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown,
  isBuilderMode: boolean = false
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};

  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  // Padding
  if (styles.padding !== undefined) {
    const val = getValue(styles.padding);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.padding = `${val}px`;
    }
  }

  // Padding Horizontal/Vertical
  if (styles.paddingX !== undefined) {
    const val = getValue(styles.paddingX);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.paddingLeft = `${val}px`;
      inline.paddingRight = `${val}px`;
    }
  }
  if (styles.paddingY !== undefined) {
    const val = getValue(styles.paddingY);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.paddingTop = `${val}px`;
      inline.paddingBottom = `${val}px`;
    }
  }

  // Gap inline (les classes arbitraires Tailwind ne fonctionnent pas avec valeurs dynamiques)
  if (styles.gap !== undefined) {
    const val = getValue(styles.gap);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.gap = `${val}px`;
    }
  }

  // Justify Content inline
  const justify = getValue(styles.justify);
  if (justify) {
    const justifyMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end',
      between: 'space-between', around: 'space-around', evenly: 'space-evenly'
    };
    if (typeof justify === 'string' && justifyMap[justify]) inline.justifyContent = justifyMap[justify];
  }

  // Align Items inline
  const align = getValue(styles.align);
  if (align) {
    const alignMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch'
    };
    if (typeof align === 'string' && alignMap[align]) inline.alignItems = alignMap[align];
  }

  if (styles.bgRepeat) {
    const val = getValue(styles.bgRepeat);
    if (val) inline.backgroundRepeat = val as string;
  }

  return inline;
}
