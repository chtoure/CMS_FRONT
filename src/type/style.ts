import type { ResponsiveProp } from './component';

// Interface de base contenant toutes les propriétés communes
export interface BaseStyles {
  // Propriétés de mise en page
  marginTop?: ResponsiveProp<number | string>;
  marginBottom?: ResponsiveProp<number | string>;
  padding?: ResponsiveProp<number | string>;
  
  // Propriétés d'apparence
  bg?: ResponsiveProp<string>;
  rounded?: ResponsiveProp<string | number>;
  roundedTopLeft?: ResponsiveProp<string | number>;
  roundedTopRight?: ResponsiveProp<string | number>;
  roundedBottomLeft?: ResponsiveProp<string | number>;
  roundedBottomRight?: ResponsiveProp<string | number>;
  shadow?: ResponsiveProp<string | number>;
  opacity?: ResponsiveProp<number>;
  display?: ResponsiveProp<'hidden' | 'block' | 'flex' | 'grid'>;
  width?: ResponsiveProp<string | number>;
  height?: ResponsiveProp<string | number>;
}

// Famille : Container
export interface ContainerStyles extends BaseStyles {
  columns?: ResponsiveProp<number>;
  gap?: ResponsiveProp<number>;
  direction?: ResponsiveProp<'horizontal' | 'vertical'>;
  justify?: ResponsiveProp<'start' | 'center' | 'end' | 'between'>;
  align?: ResponsiveProp<'start' | 'center' | 'end' | 'between'>;
  border?: ResponsiveProp<string>;
  borderWidth?: ResponsiveProp<number | string>;
  borderColor?: ResponsiveProp<string>;
  borderStyle?: ResponsiveProp<'solid' | 'dashed' | 'dotted' | 'double' | 'hidden'>;
}

// Famille : Static (Texte, etc.)
export interface StaticStyles extends BaseStyles {
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textAlign?: ResponsiveProp<'left' | 'center' | 'right' | 'justify'>;
  fontFamily?: ResponsiveProp<'sans' | 'serif' | 'mono' | 'heading'>;
  textColor?: ResponsiveProp<string>;
  textDecoration?: ResponsiveProp<'none' | 'underline'>;
}

// Famille : Interactive (Boutons, liens)
export interface InteractiveStyles extends BaseStyles {
  variant?: string;
  size?: string;
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textAlign?: ResponsiveProp<'left' | 'center' | 'right' | 'justify'>;
  fontFamily?: ResponsiveProp<'sans' | 'serif' | 'mono' | 'heading'>;
  textColor?: ResponsiveProp<string>;
  textDecoration?: ResponsiveProp<'none' | 'underline'>;
}

// Famille : Input
export interface InputStyles extends BaseStyles {
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textColor?: ResponsiveProp<string>;
}

// Famille : Complex / Spécifiques
export interface SliderStyles extends ContainerStyles {
  slidesPerView?: ResponsiveProp<number>;
  transitionDuration?: ResponsiveProp<number>;
  transitionEase?: ResponsiveProp<string>;
  arrowColor?: ResponsiveProp<string>;
  arrowBg?: ResponsiveProp<string>;
  arrowSize?: ResponsiveProp<number>;
  paginationColor?: ResponsiveProp<string>;
  paginationActiveColor?: ResponsiveProp<string>;
  paginationShape?: ResponsiveProp<'circle' | 'line' | 'square'>;
}

export interface AccordionStyles extends BaseStyles {
  // Styles spécifiques à l'Accordéon
}

// Famille : Link
export interface LinkStyles extends StaticStyles {
  // Possibilité d'ajouter des styles au survol (hover) plus tard
}

// Union de tous les styles possibles
export type AllStyles = 
  | ContainerStyles 
  | StaticStyles 
  | InteractiveStyles 
  | InputStyles 
  | SliderStyles 
  | AccordionStyles 
  | LinkStyles
  | BaseStyles;
