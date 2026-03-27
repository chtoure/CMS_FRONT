/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint } from "./core";
import { TYPOGRAPHY_MAPPER, VISUAL_MAPPER } from "./shared";
import { applyTypographyInline, applyLayoutInline, applyVisualInline, } from "./common";

export function buildLinkStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  const mappers = { ...TYPOGRAPHY_MAPPER, ...VISUAL_MAPPER };

  Object.keys(mappers).forEach(key => {
    const value = styles[key];
    if (value !== undefined) {
      classes.push(resolveValue(value, (mappers as any)[key], resolver));
    }
  });

  return classes.filter(Boolean).join(' ');
}

export function buildLinkInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  applyTypographyInline(inline, styles, getValue);
  applyLayoutInline(inline, styles, getValue);
  applyVisualInline(inline, styles, getValue);

  return inline;
}
