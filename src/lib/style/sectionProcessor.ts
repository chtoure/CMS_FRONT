/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint, formatColor, formatDimension } from "./core";
import { VISUAL_MAPPER } from "./shared";

const SECTION_LAYOUT_MAPPER = {
  direction: (v: any) => v === 'vertical' ? 'flex-col' : 'flex-row',
  justify: (v: any) => `justify-${v}`,
  align: (v: any) => `items-${v}`,
  gap: (v: any) => formatDimension('gap', v),
  columns: (v: any) => `grid-cols-${v}`,
};

export function buildSectionStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  // Display
  if (styles.display !== undefined) {
    classes.push(resolveValue(styles.display, (v) => v as string, resolver));
  } else {
    classes.push('flex'); // Default
  }

  // Layout
  (Object.keys(SECTION_LAYOUT_MAPPER) as Array<keyof typeof SECTION_LAYOUT_MAPPER>).forEach(key => {
    const value = styles[key];
    if (value !== undefined) {
      classes.push(resolveValue(value, SECTION_LAYOUT_MAPPER[key], resolver));
    }
  });

  // Visual (Partial)
  if (styles.shadow) classes.push(resolveValue(styles.shadow, (v) => v === 'none' ? 'shadow-none' : `shadow-${v}`, resolver));

  return classes.filter(Boolean).join(' ');
}

export function buildSectionInlineStyles(
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

  // Background Media (Image)
  if (styles.bgImage !== undefined) {
    const val = getValue(styles.bgImage);
    if (typeof val === 'string') {
        inline.backgroundImage = `url('${val}')`;
    } else if (val && typeof val === 'object' && 'url' in val) {
        inline.backgroundImage = `url('${(val as any).url}')`;
    }
  }

  if (styles.bgSize !== undefined) {
    const val = getValue(styles.bgSize);
    if (val) inline.backgroundSize = val as string;
  }

  if (styles.bgPosition !== undefined) {
    const val = getValue(styles.bgPosition);
    if (val) inline.backgroundPosition = val as string;
  }

  if (styles.bgRepeat !== undefined) {
    const val = getValue(styles.bgRepeat);
    if (val) inline.backgroundRepeat = val as string;
  }

  // Padding
  if (styles.padding !== undefined) {
    const val = getValue(styles.padding);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
      inline.padding = `${val}px`;
    } else if (typeof val === 'string') {
      inline.padding = val;
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
    }
  }

  // Borders
  if (styles.borderWidth !== undefined) {
    const val = getValue(styles.borderWidth);
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) inline.borderWidth = `${val}px`;
  }
  if (styles.borderColor) {
    const val = getValue(styles.borderColor);
    if (typeof val === 'string') inline.borderColor = val.startsWith('#') ? val : `#${val}`;
  }
  if (styles.borderStyle) {
    const val = getValue(styles.borderStyle);
    if (typeof val === 'string') inline.borderStyle = val;
  }

  // Opacity
  if (styles.opacity !== undefined) {
    const val = getValue(styles.opacity);
    if (val !== undefined) inline.opacity = String(val);
  }

  return inline;
}
