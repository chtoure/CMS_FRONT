/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDimension, formatColor, isNumeric } from "./core";

export type StyleMapper<T> = { [K in keyof T]?: (v: any) => string };

export const EXTERNAL_MAPPER: StyleMapper<any> = {
  marginTop: (v) => formatDimension('mt', v),
  marginBottom: (v) => formatDimension('mb', v),
  width: (v) => `w-[${v}px]`,
  height: (v) => `h-[${v}px]`,
};

export const VISUAL_MAPPER: StyleMapper<any> = {
  bg: (v) => formatColor('bg', v),
  rounded: (v) => formatDimension('rounded', v),
  roundedTopLeft: (v) => formatDimension('rounded-tl', v),
  roundedTopRight: (v) => formatDimension('rounded-tr', v),
  roundedBottomLeft: (v) => formatDimension('rounded-bl', v),
  roundedBottomRight: (v) => formatDimension('rounded-br', v),
  shadow: (v) => (v === 'none' || v === 'default') ? (v === 'none' ? 'shadow-none' : 'shadow') : `shadow-${v}`,
  opacity: (v) => isNumeric(v) ? `opacity-[${v}]` : `opacity-${v}`,
  borderWidth: (v) => formatDimension('border', v),
  borderColor: (v) => formatColor('border', v),
  borderStyle: (v) => `border-${v}`,
};

export const TYPOGRAPHY_MAPPER: StyleMapper<any> = {
  fontFamily: (v) => `font-${v}`,
  fontSize: (v) => formatDimension('text', v),
  fontWeight: (v) => `font-${v}`,
  textAlign: (v) => `text-${v}`,
  textColor: (v) => formatColor('text', v),
  textDecoration: (v) => v === 'underline' ? 'underline' : 'no-underline',
  fontStyle: (v) => v === 'italic' ? 'italic' : '',
};
