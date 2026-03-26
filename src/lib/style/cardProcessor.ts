/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint } from "./core";
import { VISUAL_MAPPER, EXTERNAL_MAPPER } from "./shared";
import { applyPositioningInline } from "./common";

export function buildCardStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
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

export function buildCardInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  // Background, radius, opacity...
  if (styles.bg) {
    const val = getValue(styles.bg);
    if (typeof val === 'string') inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }

  // Rounded
  const corners = [
    { key: 'rounded', prop: 'borderRadius' },
    { key: 'roundedTopLeft', prop: 'borderTopLeftRadius' },
    { key: 'roundedTopRight', prop: 'borderTopRightRadius' },
    { key: 'roundedBottomLeft', prop: 'borderBottomLeftRadius' },
    { key: 'roundedBottomRight', prop: 'borderBottomRightRadius' },
  ];
  corners.forEach(({ key, prop }) => {
    const val = getValue(styles[key]);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline[prop as any] = `${val}px`;
    }
  });

  // --- Background Media (Image / Video) ---
  const bgImageVal = getValue(styles.bgImage);
  if (bgImageVal) {
    let imageUrl: string | null = null;
    if (typeof bgImageVal === 'string') {
      imageUrl = bgImageVal;
    } else if (typeof bgImageVal === 'object' && bgImageVal !== null && 'url' in (bgImageVal as any)) {
      imageUrl = (bgImageVal as any).url;
    }
    if (imageUrl) {
      inline.backgroundImage = `url('${imageUrl}')`;
    }
  }

  if (styles.bgSize) {
    const val = getValue(styles.bgSize);
    if (val) inline.backgroundSize = val as string;
  }
  if (styles.bgPosition) {
    const val = getValue(styles.bgPosition);
    if (val) inline.backgroundPosition = val as string;
  }
  if (styles.bgRepeat) {
    const val = getValue(styles.bgRepeat);
    if (val) inline.backgroundRepeat = val as string;
  }

  return inline;
}
