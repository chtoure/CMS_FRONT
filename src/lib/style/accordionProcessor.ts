/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveValueForBreakpoint, isNumeric } from './core';
import { applyLayoutInline, applyVisualInline, WEIGHT_MAP } from './common';

type Breakpoint = 'default' | 'sm' | 'md' | 'lg';

/**
 * Styles inline pour le container de l'accordéon (bg, padding, border, shadow…)
 */
export function buildAccordionContainerInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: Breakpoint = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint(val, breakpoint, resolver);

  applyLayoutInline(inline, styles, getValue);
  applyVisualInline(inline, styles, getValue);

  return inline;
}

/**
 * Styles inline pour la question (header du bouton)
 */
export function buildAccordionQuestionInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: Breakpoint = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint<any>(val, breakpoint, resolver);

  if (styles.questionFontSize !== undefined) {
    const val = getValue(styles.questionFontSize);
    if (isNumeric(val)) inline.fontSize = `${val}px`;
  }

  if (styles.questionFontWeight) {
    const val = getValue(styles.questionFontWeight) as string;
    if (val) inline.fontWeight = WEIGHT_MAP[val] || val;
  }

  if (styles.questionColor) {
    const val = getValue(styles.questionColor) as string;
    if (val) inline.color = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.questionBg) {
    const val = getValue(styles.questionBg) as string;
    if (val) inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.questionPadding !== undefined) {
    const val = getValue(styles.questionPadding);
    if (isNumeric(val)) inline.padding = `${val}px`;
    else if (val) inline.padding = val as string;
  }

  if (styles.questionTextAlign) {
    const val = getValue(styles.questionTextAlign) as string;
    if (val) inline.textAlign = val;
  }

  return inline;
}

/**
 * Styles inline pour la réponse (body)
 */
export function buildAccordionAnswerInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: Breakpoint = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint<any>(val, breakpoint, resolver);

  if (styles.answerFontSize !== undefined) {
    const val = getValue(styles.answerFontSize);
    if (isNumeric(val)) inline.fontSize = `${val}px`;
  }

  if (styles.answerFontWeight) {
    const val = getValue(styles.answerFontWeight) as string;
    if (val) inline.fontWeight = WEIGHT_MAP[val] || val;
  }

  if (styles.answerColor) {
    const val = getValue(styles.answerColor) as string;
    if (val) inline.color = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.answerBg) {
    const val = getValue(styles.answerBg) as string;
    if (val) inline.backgroundColor = val.startsWith('#') ? val : `#${val}`;
  }

  if (styles.answerPadding !== undefined) {
    const val = getValue(styles.answerPadding);
    if (isNumeric(val)) inline.padding = `${val}px`;
    else if (val) inline.padding = val as string;
  }

  return inline;
}

/**
 * Styles inline pour la ligne de séparation
 */
export function buildAccordionDividerInlineStyles(
  styles?: Record<string, unknown>,
  breakpoint: Breakpoint = 'default',
  resolver?: (v: unknown) => unknown
): Record<string, string> {
  if (!styles) return {};
  const inline: Record<string, string> = {};
  const getValue = (val: unknown) => resolveValueForBreakpoint<any>(val, breakpoint, resolver);

  const dividerWidth = getValue(styles.dividerWidth);
  const dividerColor = getValue(styles.dividerColor) as string | undefined;

  const width = isNumeric(dividerWidth) ? `${dividerWidth}px` : '1px';
  const color = dividerColor
    ? dividerColor.startsWith('#') ? dividerColor : `#${dividerColor}`
    : '#e5e7eb';

  inline.borderBottomWidth = width;
  inline.borderBottomColor = color;
  inline.borderBottomStyle = 'solid';

  return inline;
}
