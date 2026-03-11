/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValueForBreakpoint, isNumeric } from './core';

type Breakpoint = 'default' | 'sm' | 'md' | 'lg';

export function buildSliderConfig(styles?: Record<string, unknown>, breakpoint: Breakpoint = 'default', resolver?: (v: unknown) => unknown) {
  if (!styles) return {};
  const getValue = (val: unknown) => resolveValueForBreakpoint<any>(val, breakpoint, resolver);

  const slidesPerView = parseInt(getValue(styles.slidesPerView) as string) || 1;
  const transitionDuration = parseInt(getValue(styles.transitionDuration) as string) || 500;
  const transitionEase = getValue(styles.transitionEase) as string || 'ease-in-out';
  const autoplay = getValue(styles.autoplay) === true;
  const autoplaySpeed = parseInt(getValue(styles.autoplaySpeed) as string) || 3000;

  return {
    slidesPerView,
    transitionDuration,
    transitionEase,
    autoplay,
    autoplaySpeed
  };
}

export function buildSliderArrowStyles(styles?: Record<string, unknown>, breakpoint: Breakpoint = 'default', resolver?: (v: unknown) => unknown): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint<any>(val, breakpoint, resolver);

  const arrowColor = getValue(styles.arrowColor) as string;
  const arrowBg = getValue(styles.arrowBg) as string;
  const arrowSize = getValue(styles.arrowSize);

  if (arrowColor) inline.color = arrowColor.startsWith('#') ? arrowColor : `#${arrowColor}`;
  if (arrowBg) inline.backgroundColor = arrowBg.startsWith('#') ? arrowBg : `#${arrowBg}`;
  if (isNumeric(arrowSize)) inline.fontSize = `${arrowSize}px`;

  return inline;
}

export function buildSliderPaginationStyles(styles?: Record<string, unknown>, breakpoint: Breakpoint = 'default', resolver?: (v: unknown) => unknown) {
  if (!styles) return {};
  const getValue = (val: unknown) => resolveValueForBreakpoint<any>(val, breakpoint, resolver);

  const paginationColor = getValue(styles.paginationColor) as string;
  const paginationActiveColor = getValue(styles.paginationActiveColor) as string;
  const paginationShape = getValue(styles.paginationShape) as string || 'circle';

  let rColor = '#FFFFFF';
  let rActiveColor = '#3b82f6'; // default primary

  if (paginationColor) rColor = paginationColor.startsWith('#') ? paginationColor : `#${paginationColor}`;
  if (paginationActiveColor) rActiveColor = paginationActiveColor.startsWith('#') ? paginationActiveColor : `#${paginationActiveColor}`;

  return {
    color: rColor,
    activeColor: rActiveColor,
    shape: paginationShape
  };
}
