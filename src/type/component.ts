import * as Icons from 'lucide-vue-next';
import type { IComponentParams } from './params';
import type { sectionStyle } from './section';

// Actions (Discriminated Unions)
type NavigateAction = { action: 'NAVIGATE_TO'; action_params: { url: string } };
type AlertAction = { action: 'SHOW_ALERT'; action_params: { message: string } };
type ModalAction = { action: 'OPEN_MODAL'; action_params: { modalId: string } };
type ToggleVisibilityAction = { action: 'TOGGLE_VISIBILITY'; action_params: { targetId: string } };
type CliquableAction = NavigateAction | AlertAction | ModalAction | ToggleVisibilityAction;

// Familles et Capacités
type ComponentFamily = 'static' | 'interactive' | 'container' | 'input' | 'complex';

const FAMILY_CAPABILITIES: Record<ComponentFamily, { canHaveChildren: boolean }> = {
  static: { canHaveChildren: false },
  interactive: { canHaveChildren: false },
  container: { canHaveChildren: true },
  input: { canHaveChildren: false },
  complex: { canHaveChildren: true },
};

const ACTIONS_BY_FAMILY: Record<ComponentFamily, CliquableAction['action'][]> = {
  static: [],
  interactive: ['NAVIGATE_TO', 'SHOW_ALERT', 'OPEN_MODAL', 'TOGGLE_VISIBILITY'],
  container: ['OPEN_MODAL', 'TOGGLE_VISIBILITY'],
  input: ['SHOW_ALERT'],
  complex: ['NAVIGATE_TO', 'OPEN_MODAL', 'TOGGLE_VISIBILITY'],
};

// Support Responsif
type ResponsiveProp<T = string> = T | {
  default: T;
  sm?: T;
  md?: T;
  lg?: T;
};

type VariableProperty<T> = {
  type: 'static';
  value: T;
} | {
  type: 'variable';
  value: number;
};

type MediaProperty = {
  type: 'media';
  mediaId: number;    // ID de l'entité Media en base
  url?: string;       // Résolu par le backend lors du GET, jamais stocké
};

import type {
  BaseStyles,
  ContainerStyles,
  StaticStyles,
  InteractiveStyles,
  InputStyles,
  AllStyles
} from './style';



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
  modelId?: number; // ID du BlocTemplate servant de modèle (si is_custom == false mais basé sur un modèle)
  sectionId?: number; // ID de la section (si is_custom == false mais basé sur un modèle)
  styles: AllStyles;
  params: IComponentParams[];
  data: Record<string, unknown>;
  children: AnyComponentInstance[];
}



export type {
  NavigateAction,
  AlertAction,
  ModalAction,
  ToggleVisibilityAction,
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
  sectionStyle,
  VariableProperty,
  MediaProperty
}

export {
  FAMILY_CAPABILITIES,
  ACTIONS_BY_FAMILY,
}
