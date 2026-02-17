import { useQuery } from "@tanstack/vue-query";
import { ACTIONS_BY_FAMILY, type Component, type ContainerStyles, type InteractiveStyles, type StaticStyles } from "../type/component";
import { ValueSource } from "../type/params";

type AnyStyle = ContainerStyles | StaticStyles | InteractiveStyles;

type AnyComponent =
  | Component<ContainerStyles>
  | Component<StaticStyles>
  | Component<InteractiveStyles>;


const mockComponents: AnyComponent[] = [

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
      params: [
        {
          name: "content",
          label: "Contenu",
          type: {
            source: ValueSource.STATIC,
            value: "Cliquez ici"
          },
          required: true,
        }
      ],
      data: {
        content: "Cliquez ici",
        cliquable: {
          action: "NAVIGATE_TO",
          action_params: { url: "/" }
        }
      },
      children: []
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
        bg: "",
        border: "#CA2C2C",
        display:"block",
        align: "center",
        justify: "between"
      },
      params: [],
      data: {},
      children: []
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
        fontSize: { default: "10", md: "20" },
        textColor: "#060505",
        textAlign: "left",
        marginBottom: 4
      },
      params: [
        {
          name: "content",
          label: "Contenu",
          type: {
            source: ValueSource.STATIC,
            value: "Ceci est un texte par défaut"
          },
          required: true,
        }
      ],
      data: {
        content: "Ceci est un texte par défaut",
        tag: "p"
      },
      children: []
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
      params: [
        {
          name: "src",
          label: "Source",
          type: {
            source: ValueSource.IMAGE,
            imageId:1
          },
          required: true,
        }
      ],
      data: {
        src: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2912&auto=format&fit=crop",
        alt: "Image de démonstration",
        width: "100%",
        height: 300,
        objectFit: "cover"
      },
      children: []
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
      params: [
        {
          name: "icon",
          label: "Icône",
          type: {
            source: ValueSource.STATIC,
            value: "Star"
          },
          required: true,
        }
      ],
      data: {
        icon: "Star",
        size: 32,
        strokeWidth: 2
      },
      children: []
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
      params: [
        {
          name: "label",
          label: "Label",
          type: {
            source: ValueSource.STATIC,
            value: "Votre nom"
          },
          required: true,
        },
        {
          name: "placeholder",
          label: "Placeholder",
          type: {
            source: ValueSource.STATIC,
            value: "Entrez votre nom..."
          },
          required: true,
        },
        {
          name: "name",
          label: "Name",
          type: {
            source: ValueSource.STATIC,
            value: "username"
          },
          required: true,
        }
      ],
      data: {
        type: "text",
        label: "Votre nom",
        placeholder: "Entrez votre nom...",
        name: "username",
        required: true
      },
      children: []
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


