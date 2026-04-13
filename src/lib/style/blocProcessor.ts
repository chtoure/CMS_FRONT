/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint, formatDimension } from "./core";
import { applyPositioningInline } from "./common";

const BLOC_LAYOUT_MAPPER = {
  columns: (v: any) => `grid-cols-${v}`, // Usually grid-cols-1, grid-cols-2 are safelisted or you might need a map
  gap: (v: any) => '',
  direction: (v: any) => {
    const map: Record<string, string> = { horizontal: 'flex-row', vertical: 'flex-col' };
    return typeof v === 'string' ? map[v] || '' : '';
  },
  justify: (v: any) => {
    const map: Record<string, string> = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' };
    return typeof v === 'string' ? map[v] || '' : '';
  },
  align: (v: any) => {
    const map: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
    return typeof v === 'string' ? map[v] || '' : '';
  },
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

  // Gap
  if (styles.gap !== undefined) {
    const val = getValue(styles.gap);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.gap = `${val}px`;
    }
  }

  if (styles.bgRepeat) {
    const val = getValue(styles.bgRepeat);
    if (val) inline.backgroundRepeat = val as string;
  }

  return inline;
}
