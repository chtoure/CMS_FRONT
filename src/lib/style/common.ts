/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValueForBreakpoint, isNumeric } from "./core";

export const WEIGHT_MAP: Record<string, string> = {
  'light': '300',
  'normal': '400',
  'medium': '500',
  'semibold': '600',
  'bold': '700',
};

const FONT_ALIASES = ['sans', 'heading', 'mono'];

/**
 * Applique les styles de typographie standards
 */
export function applyTypographyInline(
  inline: Record<string, string>,
  styles: Record<string, unknown>,
  getValue: (val: unknown) => any
) {
  if (styles.fontSize !== undefined) {
    const val = getValue(styles.fontSize);
    if (isNumeric(val)) inline.fontSize = `${val}px`;
  }

  if (styles.textColor) {
    const val = getValue(styles.textColor);
    if (typeof val === 'string') inline.color = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.textAlign) {
      const val = getValue(styles.textAlign);
      if (val) inline.textAlign = val as string;
  }

  if (styles.fontWeight) {
      const val = getValue(styles.fontWeight) as string;
      if (val) inline.fontWeight = WEIGHT_MAP[val] || val;
  }

  if (styles.fontFamily) {
      const val = getValue(styles.fontFamily) as string;
      if (val && !FONT_ALIASES.includes(val)) {
          inline.fontFamily = val;
      }
  }

  if (styles.textDecoration) {
      const val = getValue(styles.textDecoration);
      if (val) inline.textDecoration = val as string;
  }

  if (styles.fontStyle) {
      const val = getValue(styles.fontStyle);
      if (val) inline.fontStyle = val as string;
  }
}

/**
 * Applique les styles de layout standards (Dimensions & Espacements)
 */
export function applyLayoutInline(
  inline: Record<string, string>,
  styles: Record<string, unknown>,
  getValue: (val: unknown) => any
) {
  if (styles.width !== undefined) {
    const val = getValue(styles.width);
    if (isNumeric(val)) inline.width = `${val}px`;
    else if (val) inline.width = val as string;
  }

  if (styles.height !== undefined) {
    const val = getValue(styles.height);
    if (isNumeric(val)) inline.height = `${val}px`;
    else if (val) inline.height = val as string;
  }

  if (styles.padding !== undefined) {
    const val = getValue(styles.padding);
    if (isNumeric(val)) inline.padding = `${val}px`;
    else if (val) inline.padding = val as string;
  }

  if (styles.marginTop !== undefined) {
    const val = getValue(styles.marginTop);
    if (isNumeric(val)) inline.marginTop = `${val}px`;
    else if (val) inline.marginTop = val as string;
  }

  if (styles.marginBottom !== undefined) {
    const val = getValue(styles.marginBottom);
    if (isNumeric(val)) inline.marginBottom = `${val}px`;
    else if (val) inline.marginBottom = val as string;
  }
}

/**
 * Applique les styles visuels standards (Fonds, Bordures, etc.)
 */
export function applyVisualInline(
  inline: Record<string, string>,
  styles: Record<string, unknown>,
  getValue: (val: unknown) => any
) {
  if (styles.bg) {
    const val = getValue(styles.bg);
    if (typeof val === 'string') inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.opacity !== undefined) {
    const val = getValue(styles.opacity);
    if (val !== undefined) inline.opacity = String(val);
  }

  if (styles.borderColor) {
    const val = getValue(styles.borderColor);
    if (typeof val === 'string') inline.borderColor = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.borderWidth !== undefined) {
    const val = getValue(styles.borderWidth);
    if (isNumeric(val)) inline.borderWidth = `${val}px`;
    else if (val) inline.borderWidth = val as string;
  }

  if (styles.borderStyle) {
    const val = getValue(styles.borderStyle);
    if (val) inline.borderStyle = val as string;
  }

  if (styles.rounded !== undefined) {
    const val = getValue(styles.rounded);
    if (isNumeric(val)) inline.borderRadius = `${val}px`;
    else if (val) inline.borderRadius = val as string;
  }
}
