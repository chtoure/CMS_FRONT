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
    defaultProps: {
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
        bg: "white",
        border: "slate-200"
      },
      data: {}
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




// import { useQuery } from "@tanstack/vue-query";

// // Simulation de la structure que Prisma retournerait (BlocTemplate[])
// const mockData = [
//   {
//     id: "section-1",
//     name: "Hero Section",
//     family: "container",
//     tag: "SectionBuilder",
//     styles: {
//       padding: 10,
//       bg: "slate-50",
//       marginTop: 0,
//     },
//     data: {},
//     children: [
//       {
//         id: "grid-1",
//         name: "Main Grid",
//         family: "container",
//         tag: "GridBuilder",
//         styles: {
//           columns: { default: 1, md: 3 },
//           gap: 6,
//           padding: 4
//         },
//         data: {},
//         children: [
//           // Colonne 1 : Une Card avec un bouton
//           {
//             id: "card-1",
//             tag: "CardBuilder",
//             family: "container",
//             styles: {
//               bg: "white",
//               shadow: "xl",
//               rounded: "2xl",
//               padding: 6,
//               border: "slate-100"
//             },
//             data: {},
//             children: [
//               {
//                 id: "btn-1",
//                 tag: "ButtonBuilder",
//                 family: "interactive",
//                 styles: {
//                   variant: "default",
//                   rounded: "full",
//                   bg: "indigo-600"
//                 },
//                 data: {
//                   content: "Démarrer l'aventure",
//                   cliquable: {
//                     action: "SHOW_ALERT",
//                     action_params: { message: "Bienvenue dans le Builder !" }
//                   }
//                 }
//               }
//             ]
//           },
//           {
//             id: "card-2",
//             tag: "CardBuilder",
//             family: "container",
//             styles: {
//               bg: "indigo-50",
//               padding: 6,
//               rounded: "xl"
//             },
//             data: {},
//             children: [] 
//           }
//         ]
//       }
//     ]
//   }
// ];

// export const useGetComponents = () => {
//   return useQuery({
//     queryKey: ['page-blocks'],
//     queryFn: async () => {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       return mockData;
//     }
//   });
// };