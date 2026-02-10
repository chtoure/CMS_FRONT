

import { ACTIONS_BY_FAMILY } from "../../type/component.ts";




export const componentsConfig = [
  {
    name: "Grille",
    tag: "GridBuilder",
    icon: "Grid",
    family: "container",
    supportedActions: ACTIONS_BY_FAMILY['container'],
    default_props: {
      styles: {
        padding: 10,
        bg: "white",
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
    default_props: {
      styles: {
        variant: "default",
        rounded: "md",
        bg: "indigo-600"
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
    name: "Card",
    tag: "CardBuilder",
    icon: "Square",
    family: "container",
    supportedActions: ACTIONS_BY_FAMILY['container'],
    default_props: {
      styles: {
        padding: 6,
        rounded: "xl",
        shadow: "md",
        bg: "white",
        border: "slate-200"
      },
      data: {}
    }
  }
]
