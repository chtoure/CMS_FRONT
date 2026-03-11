/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint } from "./core";
import { TYPOGRAPHY_MAPPER, VISUAL_MAPPER } from "./shared";
import { applyTypographyInline, applyLayoutInline, applyVisualInline } from "./common";

const BUTTON_STYLE_MAPPER = {
  ...TYPOGRAPHY_MAPPER,
  ...VISUAL_MAPPER,
  variant: (v: any) => `btn-${v}`,
  size: (v: any) => `btn-sz-${v}`,
};

export function buildButtonStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];
  
  (Object.keys(BUTTON_STYLE_MAPPER) as Array<keyof typeof BUTTON_STYLE_MAPPER>).forEach(key => {
    const value = styles[key];
    if (value !== undefined) {
      classes.push(resolveValue(value, BUTTON_STYLE_MAPPER[key], resolver));
    }
  });

  return classes.filter(Boolean).join(' ');
}

export function buildButtonInlineStyles(
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
