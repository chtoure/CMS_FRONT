import * as Icons from 'lucide-vue-next';

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

export interface CommonStyles {
  marginTop?: ResponsiveProp<number | string>;
  marginBottom?: ResponsiveProp<number | string>;
  padding?: ResponsiveProp<number | string>;
  bg?: ResponsiveProp<string>;
  rounded?: ResponsiveProp<string>;
  shadow?: ResponsiveProp<string>;
  opacity?: ResponsiveProp<number>;
  display?: ResponsiveProp<'hidden' | 'block' | 'flex' | 'grid'>;
}

// Famille : Container
export interface ContainerStyles extends CommonStyles {
  columns?: ResponsiveProp<number>;
  gap?: ResponsiveProp<number>;
  direction?: ResponsiveProp<'horizontal' | 'vertical'>;
  justify?: ResponsiveProp<'start' | 'center' | 'end' | 'between'>;
  align?: ResponsiveProp<'start' | 'center' | 'end' | 'between'>;
  border?: ResponsiveProp<string>;
}

// Famille : Static (Texte, etc.)
export interface StaticStyles extends CommonStyles {
  fontSize?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  textAlign?: ResponsiveProp<'left' | 'center' | 'right'>;
  textColor?: ResponsiveProp<string>;
}

// Famille : Interactive (Boutons, liens)
export interface InteractiveStyles extends CommonStyles {
  variant?: string;
  size?: string;
}



type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: JsonValue } 
  | JsonValue[];


interface ComponentProps<T = CommonStyles> {
  styles?: T;
  data?: Record<string, unknown>;
}

interface ComponentDefinition<T = CommonStyles> {
  name: string;
  family: ComponentFamily;
  component: () => Promise<unknown>;
  supportedActions: CliquableAction['action'][];
  defaultProps: ComponentProps<T>;
}






interface Component <T = CommonStyles> {
  name: string;
  tag: string;
  icon: keyof typeof Icons;
  family: ComponentFamily;
  supportedActions: CliquableAction['action'][];
  defaultProps:  ComponentProps<T>;
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
  Component
}

export {
  FAMILY_CAPABILITIES,
  ACTIONS_BY_FAMILY,
}