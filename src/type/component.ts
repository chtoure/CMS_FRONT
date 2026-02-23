import * as Icons from 'lucide-vue-next';
import type { IComponentParams } from './params';
import type { sectionStyle } from './section';

// Actions (Discriminated Unions)
type NavigateAction = { action: 'NAVIGATE_TO'; action_params: { url: string } };
type AlertAction = { action: 'SHOW_ALERT'; action_params: { message: string } };
type ModalAction = { action: 'OPEN_MODAL'; action_params: { modalId: string } };
type CliquableAction = NavigateAction | AlertAction | ModalAction;

// Familles et Capacités
type ComponentFamily = 'static' | 'interactive' | 'container' | 'input';

const FAMILY_CAPABILITIES: Record<ComponentFamily, { canHaveChildren: boolean }> = {
  static: { canHaveChildren: false },
  interactive: { canHaveChildren: false },
  container: { canHaveChildren: true },
  input: { canHaveChildren: false },
};

const ACTIONS_BY_FAMILY: Record<ComponentFamily, CliquableAction['action'][]> = {
  static: [],
  interactive: ['NAVIGATE_TO', 'SHOW_ALERT', 'OPEN_MODAL'],
  container: ['OPEN_MODAL'],
  input: ['SHOW_ALERT'],
};

// Support Responsif
type ResponsiveProp<T = string> = T | {
  default: T;
  sm?: T;
  md?: T;
  lg?: T;
};

// types/styles.ts

// Interface de base contenant toutes les propriétés communes
interface BaseStyles {
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
interface ContainerStyles extends BaseStyles {
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
interface StaticStyles extends BaseStyles {
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textAlign?: ResponsiveProp<'left' | 'center' | 'right'>;
  textColor?: ResponsiveProp<string>;
}

// Famille : Interactive (Boutons, liens)
interface InteractiveStyles extends BaseStyles {
  variant?: string;
  size?: string;
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textAlign?: ResponsiveProp<'left' | 'center' | 'right'>;
  textColor?: ResponsiveProp<string>;
}

// Famille : Input
interface InputStyles extends BaseStyles {
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textColor?: ResponsiveProp<string>;
}

// types/component.ts
type AllStyles = ContainerStyles | StaticStyles | InteractiveStyles | InputStyles | BaseStyles;



type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];


interface ComponentProps<T = BaseStyles> {
  styles?: T;
  params?: IComponentParams[];
  data?: Record<string, unknown>;
  children?: AnyComponentInstance[];
}

interface ComponentDefinition<T = BaseStyles> {
  id?: number;
  name: string;
  family: ComponentFamily;
  component: () => Promise<unknown>;
  supportedActions: CliquableAction['action'][];
  defaultProps: ComponentProps<T>;
}

interface Component <T = BaseStyles> {
  id?: number; // ID du type de composant venant du backend (pour la création de BlockTemplate)
  name: string;
  tag: string;
  icon: keyof typeof Icons;

  family: ComponentFamily;
  supportedActions: CliquableAction['action'][];
  defaultProps:  ComponentProps<T>;
}

type AnyComponent =
  | Component<ContainerStyles>
  | Component<StaticStyles>
  | Component<InteractiveStyles>
  | Component<BaseStyles>;



interface AnyComponentInstance extends Omit<Component<AllStyles>, 'defaultProps' | 'id'> {
  id: string; // UUID local
  blocTemplateId?: number; // ID backend (BlockTemplate)
  componentDefinitionId?: number; // ID du type de composant (table components)
  styles: AllStyles;
  params: IComponentParams[];
  data: Record<string, unknown>;
  children: AnyComponentInstance[];
}



export type {
  NavigateAction,
  AlertAction,
  ModalAction,
  CliquableAction,
  ComponentFamily,
  ResponsiveProp,
  JsonValue,
  ComponentDefinition,
  Component,
  AnyComponent,
  AnyComponentInstance,
  BaseStyles,
  ContainerStyles,
  StaticStyles,
  InteractiveStyles,
  InputStyles,
  AllStyles,
  ComponentProps,
  sectionStyle
}

export {
  FAMILY_CAPABILITIES,
  ACTIONS_BY_FAMILY,
}
