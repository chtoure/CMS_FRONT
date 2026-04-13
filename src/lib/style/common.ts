/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValueForBreakpoint, isNumeric } from "./core";

export const WEIGHT_MAP: Record<string, string> = {
  'light': '300',
  'normal': '400',
  'medium': '500',
  'semibold': '600',
  'bold': '700',
};

export const SHADOW_MAP: Record<string, string> = {
  'none': 'none',
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'default': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
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

  if (styles.paddingX !== undefined) {
    const val = getValue(styles.paddingX);
    if (isNumeric(val)) {
      inline.paddingLeft = `${val}px`;
      inline.paddingRight = `${val}px`;
    } else if (val) {
      inline.paddingLeft = val as string;
      inline.paddingRight = val as string;
    }
  }

  if (styles.paddingY !== undefined) {
    const val = getValue(styles.paddingY);
    if (isNumeric(val)) {
      inline.paddingTop = `${val}px`;
      inline.paddingBottom = `${val}px`;
    } else if (val) {
      inline.paddingTop = val as string;
      inline.paddingBottom = val as string;
    }
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
 * Applique uniquement les styles de positionnement
 */
export function applyPositioningInline(
  inline: Record<string, string>,
  styles: Record<string, unknown>,
  getValue: (val: unknown) => any
) {
  if (styles.position !== undefined) {
    const val = getValue(styles.position);
    if (val) inline.position = val as string;
  }

  ['top', 'right', 'bottom', 'left'].forEach((prop) => {
    if (styles[prop] !== undefined) {
      const val = getValue(styles[prop]);
      if (isNumeric(val)) inline[prop] = `${val}px`;
      else if (val) inline[prop] = val as string;
    }
  });

  if (styles.zIndex !== undefined) {
    const val = parseInt(getValue(styles.zIndex) as string);
    if (!isNaN(val)) inline.zIndex = String(val);
  }
}

/**
 * Calcule et retourne uniquement les styles inline de positionnement
 * destinés à être appliqués sur le wrapper d'un composant (pour que sticky/fixed
 * fonctionnent correctement par rapport au conteneur parent).
 */
export function getWrapperPositionStyles(
  styles: Record<string, unknown> | undefined,
  breakpoint: 'default' | 'sm' | 'md' | 'lg',
  resolver: (v: unknown) => unknown
): Record<string, string> {
  const inline: Record<string, string> = {};
  if (!styles) return inline;
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);
  applyPositioningInline(inline, styles, getValue);
  
  // Si le wrapper est absolute, sticky ou fixed, il doit avoir un z-index par défaut
  if (inline.position && inline.position !== 'static' && !inline.zIndex) {
    inline.zIndex = '10';
  }

  // Correction cruciale pour "sticky" dans les conteneurs Flex (Sections / Blocs).
  // Si le composant est sticky et que son parent est en display:flex (par défaut),
  // l'align-items:stretch va forcer sa hauteur à 100%, l'empêchant de glisser.
  // On force align-self: flex-start pour qu'il garde sa propre hauteur.
  if (inline.position === 'sticky') {
    inline.alignSelf = 'flex-start';
  }
  
  return inline;
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
  } else if (styles.borderColor || styles.borderWidth) {
    // Par défaut 'solid' si on a une bordure mais pas de style défini
    inline.borderStyle = 'solid';
  }

  if (styles.rounded !== undefined) {
    const val = getValue(styles.rounded);
    if (isNumeric(val)) inline.borderRadius = `${val}px`;
    else if (val && val !== 'none') {
        const map: Record<string, string> = { 'sm': '2px', 'md': '4px', 'lg': '8px', 'full': '9999px' };
        inline.borderRadius = map[val as string] || val as string;
    }
  }

  // Arrondis individuels
  const corners = {
    roundedTopLeft: 'borderTopLeftRadius',
    roundedTopRight: 'borderTopRightRadius',
    roundedBottomLeft: 'borderBottomLeftRadius',
    roundedBottomRight: 'borderBottomRightRadius'
  };

  Object.entries(corners).forEach(([prop, styleKey]) => {
    if (styles[prop] !== undefined) {
      const val = getValue(styles[prop]);
      if (isNumeric(val)) inline[styleKey] = `${val}px`;
      else if (val) inline[styleKey] = val as string;
    }
  });

  if (styles.shadow) {
    const val = getValue(styles.shadow);
    if (val && val !== 'none') {
      inline.boxShadow = SHADOW_MAP[val as string] || val as string;
    }
  }

  // --- Background Media (Image) ---
  if (styles.bgImage !== undefined) {
    const val = getValue(styles.bgImage);
    if (typeof val === 'string') {
        inline.backgroundImage = `url('${val}')`;
    } else if (val && typeof val === 'object' && 'url' in val) {
        // Handle MediaProperty
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
}
