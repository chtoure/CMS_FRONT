/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint } from "./core";
import { VISUAL_MAPPER } from "./shared";

export function buildImageStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  Object.keys(VISUAL_MAPPER).forEach(key => {
    const value = styles[key];
    if (value !== undefined) {
      classes.push(resolveValue(value, (VISUAL_MAPPER as any)[key], resolver));
    }
  });

  return classes.filter(Boolean).join(' ');
}

export function buildImageInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  // Borders, radius, opacity...
  if (styles.rounded !== undefined) {
    const val = getValue(styles.rounded);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.borderRadius = `${val}px`;
    }
  }

  return inline;
}
