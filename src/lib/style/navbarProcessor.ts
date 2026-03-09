/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint } from "./core";
import { VISUAL_MAPPER, EXTERNAL_MAPPER } from "./shared";

export function buildNavbarStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  const processMapper = (mapper: any) => {
    Object.keys(mapper).forEach(key => {
      const value = styles[key];
      if (value !== undefined) {
        classes.push(resolveValue(value, mapper[key], resolver));
      }
    });
  };

  processMapper(VISUAL_MAPPER);
  processMapper(EXTERNAL_MAPPER);

  return classes.filter(Boolean).join(' ');
}

export function buildNavbarInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  // Background
  if (styles.bg) {
    const val = getValue(styles.bg);
    if (typeof val === 'string') inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }

  // Dimensions & Margins
  ['marginTop', 'marginBottom', 'width', 'height'].forEach(prop => {
    const val = getValue(styles[prop]);
    if (typeof val === 'number') inline[prop as any] = `${val}px`;
    else if (typeof val === 'string') inline[prop as any] = val.includes('px') || val.includes('%') ? val : `${val}px`;
  });

  return inline;
}
