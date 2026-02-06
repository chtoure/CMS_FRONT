import { 
  ACTIONS_BY_FAMILY, 
  type ComponentDefinition,
  type ContainerStyles,
  type InteractiveStyles,
  type StaticStyles,
  type CommonStyles
} from '../type/component';

// 1. On définit un type qui regroupe toutes les variantes possibles
type AnyComponentDefinition = 
  | ComponentDefinition<ContainerStyles>
  | ComponentDefinition<InteractiveStyles>
  | ComponentDefinition<StaticStyles>
  | ComponentDefinition<CommonStyles>;

// 2. On utilise ce type pour le registre
export const COMPONENT_REGISTRY: Record<string, AnyComponentDefinition> = {
  ButtonBuilder: {
    name: "Bouton",
    family: 'interactive',
    component: () => import('@/components/builder/ButtonBuilder.vue'),
    supportedActions: ACTIONS_BY_FAMILY['interactive'],
    defaultProps: {
      data: {
        content: "Cliquez ici",
        cliquable: {
          action: "NAVIGATE_TO",
          action_params: { url: "/" },
        },
      },
      styles: {
        marginTop: 2,
        padding: 4,
        bg: "blue-600",
        rounded: "md",
        variant: "default", // Valide car c'est une InteractiveStyles
      }
    }
  },

  CardBuilder: {
    name: "Conteneur Carte",
    family: 'container', 
    component: () => import('@/components/builder/CardBuilder.vue'),
    supportedActions: ACTIONS_BY_FAMILY['container'],
    defaultProps: {
      data: {},
      styles: {
        padding: { default: 4, lg: 8 },
        gap: { default: 2, lg: 4 },
        columns: { default: 1, md: 2 },
        direction: "vertical", // Valide car c'est une ContainerStyles
        bg: "white",
      },
    }
  }
};