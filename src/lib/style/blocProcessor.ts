/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint, formatDimension } from "./core";
import { applyPositioningInline } from "./common";

const BLOC_LAYOUT_MAPPER = {
  columns: (v: any) => `grid-cols-${v}`,
  gap: (v: any) => formatDimension('gap', v),
  direction: (v: any) => v === 'horizontal' ? 'flex-row' : 'flex-col',
  justify: (v: any) => `justify-${v}`,
  align: (v: any) => `items-${v}`,
  padding: (v: any) => formatDimension('p', v),
};

export function buildBlocLayoutStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  // Display
  if (styles.display !== undefined) {
    classes.push(resolveValue(styles.display, (v) => v as string, resolver));
  }

  // Layout Properties
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
  resolver?: (v: unknown) => unknown
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

  // Gap
  if (styles.gap !== undefined) {
    const val = getValue(styles.gap);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.gap = `${val}px`;
    }
  }

  // Grid
  if (styles.display === 'grid' || getValue(styles.display) === 'grid') {
    const cols = getValue(styles.columns);
    if (typeof cols === 'number' && cols > 0) {
      inline.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      inline.display = 'grid';
    }
  }

  // Flex Direction
  const dir = getValue(styles.direction);
  if (dir) {
    inline.display = inline.display || 'flex';
    inline.flexDirection = dir === 'horizontal' ? 'row' : 'column';
    if (dir === 'horizontal') inline.flexWrap = 'wrap';
  }

  // Justify & Align
  const justify = getValue(styles.justify);
  if (justify) {
    const map: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' };
    if (typeof justify === 'string' && map[justify]) inline.justifyContent = map[justify];
  }
  
  const align = getValue(styles.align);
  if (align) {
    const map: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
    if (typeof align === 'string' && map[align]) inline.alignItems = map[align];
  }

  if (styles.bgRepeat) {
    const val = getValue(styles.bgRepeat);
    if (val) inline.backgroundRepeat = val as string;
  }

  return inline;
}
