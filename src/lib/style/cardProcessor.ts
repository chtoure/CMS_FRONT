/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint, isNumeric } from "./core";
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

const RADIUS_MAP: Record<string, string> = {
  'sm': '2px', 'md': '4px', 'lg': '8px', 'xl': '12px', '2xl': '16px', 'full': '9999px', 'none': '0px'
};

const SHADOW_MAP: Record<string, string> = {
  'sm':      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'default': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md':      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg':      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl':      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl':     '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'inner':   'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

export function buildCardInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  // Background color
  if (styles.bg) {
    const val = getValue(styles.bg);
    if (typeof val === 'string') inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }

  // Rounded — supporte numériques ET noms (sm, md, lg, full)
  const corners = [
    { key: 'rounded',            prop: 'borderRadius' },
    { key: 'roundedTopLeft',     prop: 'borderTopLeftRadius' },
    { key: 'roundedTopRight',    prop: 'borderTopRightRadius' },
    { key: 'roundedBottomLeft',  prop: 'borderBottomLeftRadius' },
    { key: 'roundedBottomRight', prop: 'borderBottomRightRadius' },
  ];
  corners.forEach(({ key, prop }) => {
    const val = getValue(styles[key]);
    if (val === undefined || val === null) return;
    if (isNumeric(val)) inline[prop as any] = `${val}px`;
    else if (typeof val === 'string' && val !== '') inline[prop as any] = RADIUS_MAP[val] || val;
  });

  // Bordures
  if (styles.borderWidth !== undefined) {
    const val = getValue(styles.borderWidth);
    if (isNumeric(val)) inline.borderWidth = `${val}px`;
    else if (val) inline.borderWidth = val as string;
  }
  if (styles.borderColor) {
    const val = getValue(styles.borderColor);
    if (typeof val === 'string') inline.borderColor = val.startsWith('#') ? val : `#${val}`;
  }
  if (styles.borderStyle) {
    const val = getValue(styles.borderStyle);
    if (val) inline.borderStyle = val as string;
  } else if (styles.borderColor || styles.borderWidth) {
    inline.borderStyle = 'solid';
  }

  // Padding
  if (styles.padding !== undefined) {
    const val = getValue(styles.padding);
    if (isNumeric(val)) inline.padding = `${val}px`;
    else if (val) inline.padding = val as string;
  }
  if (styles.paddingX !== undefined) {
    const val = getValue(styles.paddingX);
    if (isNumeric(val)) { inline.paddingLeft = `${val}px`; inline.paddingRight = `${val}px`; }
  }
  if (styles.paddingY !== undefined) {
    const val = getValue(styles.paddingY);
    if (isNumeric(val)) { inline.paddingTop = `${val}px`; inline.paddingBottom = `${val}px`; }
  }

  // Opacity
  if (styles.opacity !== undefined) {
    const val = getValue(styles.opacity);
    if (val !== undefined) inline.opacity = String(val);
  }

  // Ombre
  if (styles.shadow) {
    const val = getValue(styles.shadow);
    if (val && val !== 'none') inline.boxShadow = SHADOW_MAP[val as string] || val as string;
  }

  // Background Media (Image)
  const bgImageVal = getValue(styles.bgImage);
  if (bgImageVal) {
    let imageUrl: string | null = null;
    if (typeof bgImageVal === 'string') imageUrl = bgImageVal;
    else if (typeof bgImageVal === 'object' && bgImageVal !== null && 'url' in (bgImageVal as any)) imageUrl = (bgImageVal as any).url;
    if (imageUrl) inline.backgroundImage = `url('${imageUrl}')`;
  }
  if (styles.bgSize)     { const val = getValue(styles.bgSize);     if (val) inline.backgroundSize     = val as string; }
  if (styles.bgPosition) { const val = getValue(styles.bgPosition); if (val) inline.backgroundPosition = val as string; }
  if (styles.bgRepeat)   { const val = getValue(styles.bgRepeat);   if (val) inline.backgroundRepeat   = val as string; }

  return inline;
}
