import { useQuery } from "@tanstack/vue-query";
import { ACTIONS_BY_FAMILY, type Component, type ContainerStyles, type InteractiveStyles, type StaticStyles } from "../type/component";

type AnyStyle = ContainerStyles | StaticStyles | InteractiveStyles;

type AnyComponent = 
  | Component<ContainerStyles>
  | Component<StaticStyles>
  | Component<InteractiveStyles>;


const mockComponents: AnyComponent[] = [
  {
    name: "Grille",
    tag: "GridBuilder",
    icon: "Grid",
    family: "container",
    supportedActions: ACTIONS_BY_FAMILY['container'],
    defaultProps: {
      styles: {
        padding: 10,
        bg: "#CA2C2C",
        direction: "vertical"
      },
      data: {}
    }
  },
  {
    name: "Bouton d'action",
    tag: "ButtonBuilder",
    icon: "MousePointer2",
    family: "interactive",
    supportedActions: ACTIONS_BY_FAMILY['interactive'],
    defaultProps: {
      styles: {
        variant: "default",
        rounded: "md",
        bg: "#BDACAC",
        padding: 10,
      },
      data: {
        content: "Cliquez ici",
        cliquable: {
          action: "NAVIGATE_TO",
          action_params: { url: "/" }
        }
      }
    }
  },
  {
    name: "Carte",
    tag: "CardBuilder",
    icon: "Square",
    family: "container",
    supportedActions: ACTIONS_BY_FAMILY['container'],
    defaultProps: {
      styles: {
        padding: 6,
        rounded: "xl",
        shadow: "md",
        bg: "#CA2C2C",
        border: "#CA2C2C",
        display:"flex",
        align: "center",
        justify: "between"
      },
      data: {}
    }
  },
  {
    name: "Texte",
    tag: "TextBuilder",
    icon: "Type",
    family: "static",
    supportedActions: ACTIONS_BY_FAMILY['static'],
    defaultProps: {
      styles: {
        fontSize: { default: "base", md: "lg" },
        textColor: "#060505",
        textAlign: "left",
        marginBottom: 4
      },
      data: {
        content: "Ceci est un texte par défaut",
        tag: "p"
      }
    }
  },
  {
    name: "Image",
    tag: "ImageBuilder",
    icon: "Image",
    family: "static",
    supportedActions: ACTIONS_BY_FAMILY['static'],
    defaultProps: {
      styles: {
        rounded: "lg",
        shadow: "sm",
        display: "block",
        marginBottom: 4
      },
      data: {
        src: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2912&auto=format&fit=crop",
        alt: "Image de démonstration",
        width: "100%",
        height: 300,
        objectFit: "cover"
      }
    }
  },
  {
    name: "Icône",
    tag: "IconBuilder",
    icon: "Sparkles",
    family: "static",
    supportedActions: ACTIONS_BY_FAMILY['static'],
    defaultProps: {
      styles: {
        textColor: "#CA2C2C",
        marginBottom: 2
      },
      data: {
        icon: "Star",
        size: 32,
        strokeWidth: 2
      }
    }
  },
  {
    name: "Champ Saisie",
    tag: "InputBuilder",
    icon: "FormInput",
    family: "input",
    supportedActions: ACTIONS_BY_FAMILY['input'],
    defaultProps: {
      styles: {
        marginBottom: 4,
        border: "#CA2C2C",
        rounded: "md",
        padding: 2
      },
      data: {
        type: "text",
        label: "Votre nom",
        placeholder: "Entrez votre nom...",
        name: "username",
        required: true
      }
    }
  }
];

export const useGetComponents = () => {
  return useQuery({
    queryKey: ['builder-components'],
    queryFn: async (): Promise<AnyComponent[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockComponents;
    }
  });
};


