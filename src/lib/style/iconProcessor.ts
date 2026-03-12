/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyTypographyInline } from "./common";
import { resolveValue, resolveValueForBreakpoint } from "./core";
import { VISUAL_MAPPER } from "./shared";

export function buildIconStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
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

export function buildIconInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  if (styles.bg) {
    const val = getValue(styles.bg);
    if (typeof val === 'string') inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }
  if (styles.color) {
    const val = getValue(styles.color);
    if (typeof val === 'string') inline.color = val.startsWith('#') ? val : `#${val}`;
  }
  applyTypographyInline(inline, styles, getValue);
  return inline;
}
