import type { ResponsiveProp } from "../type/component";

export function cnResponsive(prop: ResponsiveProp | undefined): string {
  if (!prop) return '';
  if (typeof prop === 'string') return prop;

  const classes: string[] = [];
  
  if (prop.default) classes.push(prop.default);
  if (prop.sm) classes.push(`sm:${prop.sm}`);
  if (prop.md) classes.push(`md:${prop.md}`);
  if (prop.lg) classes.push(`lg:${prop.lg}`);

  return classes.join(' ');
}