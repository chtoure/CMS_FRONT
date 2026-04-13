import { formatDimension, formatColor, isNumeric } from "./core";

export type StyleMapper<T> = { [K in keyof T]?: (v: unknown) => string };

export const EXTERNAL_MAPPER: StyleMapper<Record<string, unknown>> = {
  marginTop: (v) => '', // Handled inline to support dynamic JIT strings
  marginBottom: (v) => '',
  width: (v) => '',
  height: (v) => '',
  padding: (v) => '',
  paddingX: (v) => '',
  paddingY: (v) => '',
};

export const VISUAL_MAPPER: StyleMapper<Record<string, unknown>> = {
  bg: (v) => formatColor('bg', v),
  rounded: (v) => formatDimension('rounded', v),
  roundedTopLeft: (v) => formatDimension('rounded-tl', v),
  roundedTopRight: (v) => formatDimension('rounded-tr', v),
  roundedBottomLeft: (v) => formatDimension('rounded-bl', v),
  roundedBottomRight: (v) => formatDimension('rounded-br', v),
  opacity: (v) => isNumeric(v) ? `opacity-[${v}]` : `opacity-${v}`,
  borderWidth: (v) => formatDimension('border', v),
  borderColor: (v) => formatColor('border', v),
  border: (v) => formatColor('border', v), // Fallback for old properties
  borderStyle: (v) => `border-${v}`,
};

export const TYPOGRAPHY_MAPPER: StyleMapper<Record<string, unknown>> = {
  fontFamily: (v) => `font-${v}`,
  fontSize: (v) => formatDimension('text', v),
  fontWeight: (v) => `font-${v}`,
  textAlign: (v) => `text-${v}`,
  textColor: (v) => formatColor('text', v),
  textDecoration: (v) => v === 'underline' ? 'underline' : 'no-underline',
  fontStyle: (v) => v === 'italic' ? 'italic' : '',
};
