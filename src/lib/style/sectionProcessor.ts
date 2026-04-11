/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValue, resolveValueForBreakpoint, formatColor, formatDimension } from "./core";
import { VISUAL_MAPPER } from "./shared";
import { applyPositioningInline } from "./common";

const SECTION_LAYOUT_MAPPER = {
  direction: (v: any) => v === 'vertical' ? 'flex-col' : 'flex-row',
  justify: (v: any) => `justify-${v}`,
  align: (v: any) => `items-${v}`,
  gap: (v: any) => formatDimension('gap', v),
  columns: (v: any) => `grid-cols-${v}`,
  paddingX: (v: any) => formatDimension('px', v),
  paddingY: (v: any) => formatDimension('py', v),
};

export function buildSectionStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
  if (!styles) return '';
  const classes: string[] = [];

  // Visual (Partial)
  if (styles.shadow) classes.push(resolveValue(styles.shadow, (v) => v === 'none' ? 'shadow-none' : `shadow-${v}`, resolver));

  return classes.filter(Boolean).join(' ');
}

export function buildSectionLayoutStyles(styles?: Record<string, unknown>, resolver?: (v: unknown) => unknown): string {
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

  return classes.filter(Boolean).join(' ');
}

export function buildSectionInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: 'default' | 'sm' | 'md' | 'lg' = 'default',
  resolver?: (v: unknown) => unknown,
  isBuilderMode: boolean = false
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

  if (isBuilderMode) {
    const displayOverride = getValue(styles.display);
    if (displayOverride !== undefined) {
        inline.display = displayOverride === 'hidden' ? 'none' : displayOverride as string;
    }
    // Grid
    if (styles.display === 'grid' || displayOverride === 'grid') {
      const cols = getValue(styles.columns);
      if (typeof cols === 'number' && cols > 0) {
        inline.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        inline.display = 'grid';
      }
    }
    // Sections default to flex in buildSectionLayoutStyles if undefined.
    // We only enforce override direction inline if we are in builder.
    const dir = getValue(styles.direction);
    if (dir && inline.display !== 'grid' && inline.display !== 'none') {
      inline.display = inline.display || 'flex';
      inline.flexDirection = dir === 'vertical' ? 'column' : 'row';
      if (dir === 'horizontal') inline.flexWrap = 'wrap';
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

  // Positioning only (to avoid layout breakage)
  applyPositioningInline(inline, styles, getValue);

  const positionVal = getValue(styles.position);

  if ((positionVal === 'sticky' || positionVal === 'fixed' || positionVal === 'absolute') && !inline.zIndex) {
    inline.zIndex = '10';
  }

  // When position is fixed or absolute, sections normally shrink to content width.
  // Apply width: 100% by default unless the user has explicitly set a width.
  if ((positionVal === 'fixed' || positionVal === 'absolute') && !styles.width) {
    inline.width = '100%';
  }

  return inline;
}
