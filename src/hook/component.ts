import { useQuery } from "@tanstack/vue-query";
import { ACTIONS_BY_FAMILY, type AnyComponent, type Component, type ContainerStyles, type InteractiveStyles, type StaticStyles } from "../type/component";
import api, { handleResponse } from "../api/fetchConfig";
import type { Pagination } from "../type/pagination";
import type { BlocTemplate } from "../type/bloc-template";

type AnyStyle = ContainerStyles | StaticStyles | InteractiveStyles;



const useGetComponents = () => {
  return useQuery({
    queryKey: ['builder-components'],
    queryFn: async () => {
      const response = await handleResponse<Pagination<AnyComponent>>(
        await api(`/components`, {
          method: 'GET'
        })
      );

      // Injection dynamique du composant Link si absent (en attendant le backend)
      if (response && response.results) {
        const hasLink = response.results.find(c => c.tag === 'LinkBuilder');
        if (!hasLink) {
          response.results.push({
            id: 'link-builder-id', // ID temporaire
            name: "Lien",
            tag: "LinkBuilder",
            icon: "ExternalLink",
            family: "static",
            supportedActions: ACTIONS_BY_FAMILY['static'],
            defaultProps: {
              styles: {
                textColor: "#3b82f6", // Bleu par défaut
                textAlign: "left"
              },
              data: {
                text: "Lien personnalisé",
                url: "",
                target: "_self"
              },
              children: []
            }
          } as AnyComponent);
        }
      }

      return response;
    }
  });
};

const useGetBlocTemplatesComponentCustom = () => {
  return useQuery({
    queryKey: ['builder-bloc-templates-custom'],
    queryFn: async () => {
      return handleResponse<BlocTemplate[]>(
        await api(`/bloc-templates-components-custom`, {
          method: 'GET'
        })
      );
    }
  });
};

export {
  useGetComponents,
  useGetBlocTemplatesComponentCustom
}




// const mockComponents: AnyComponent[] = [

//   {
//     name: "Bouton d'action",
//     tag: "ButtonBuilder",
//     icon: "MousePointer2",
//     family: "interactive",
//     supportedActions: ACTIONS_BY_FAMILY['interactive'],
//     defaultProps: {
//       styles: {
//         variant: "default",
//         rounded: "md",
//         bg: "#BDACAC",
//         padding: 10,
//       },
//       data: {
//         content: "Cliquez ici",
//         cliquable: {
//           action: "NAVIGATE_TO",
//           action_params: { url: "/" }
//         }
//       },
//       children: []
//     }
//   },
//   {
//     name: "Carte",
//     tag: "CardBuilder",
//     icon: "Square",
//     family: "container",
//     supportedActions: ACTIONS_BY_FAMILY['container'],
//     defaultProps: {
//       styles: {
//         padding: 6,
//         rounded: "xl",
//         shadow: "md",
//         bg: "",
//         border: "#CA2C2C",
//         display:"block",
//         align: "center",
//         justify: "between"
//       },
//       data: {},
//       children: []
//     }
//   },
//   {
//     name: "Texte",
//     tag: "TextBuilder",
//     icon: "Type",
//     family: "static",
//     supportedActions: ACTIONS_BY_FAMILY['static'],
//     defaultProps: {
//       styles: {
//         fontSize: { default: "10", md: "20" },
//         textColor: "#060505",
//         textAlign: "left",
//         marginBottom: 4
//       },
//       data: {
//         content: "Ceci est un texte par défaut",
//         tag: "p"
//       },
//       children: []
//     }
//   },
//   {
//     name: "Image",
//     tag: "ImageBuilder",
//     icon: "Image",
//     family: "static",
//     supportedActions: ACTIONS_BY_FAMILY['static'],
//     defaultProps: {
//       styles: {
//         rounded: "lg",
//         shadow: "sm",
//         display: "block",
//         marginBottom: 4
//       },
//       data: {
//         src: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2912&auto=format&fit=crop",
//         alt: "Image de démonstration",
//         width: "100%",
//         height: 300,
//         objectFit: "cover"
//       },
//       children: []
//     }
//   },
//   {
//     name: "Icône",
//     tag: "IconBuilder",
//     icon: "Sparkles",
//     family: "static",
//     supportedActions: ACTIONS_BY_FAMILY['static'],
//     defaultProps: {
//       styles: {
//         textColor: "#CA2C2C",
//         marginBottom: 2
//       },
//       data: {
//         icon: "Star",
//         size: 32,
//         strokeWidth: 2
//       },
//       children: []
//     }
//   },
//   {
//     name: "Champ Saisie",
//     tag: "InputBuilder",
//     icon: "FormInput",
//     family: "input",
//     supportedActions: ACTIONS_BY_FAMILY['input'],
//     defaultProps: {
//       styles: {
//         marginBottom: 4,
//         border: "#CA2C2C",
//         rounded: "md",
//         padding: 2
//       },
//       data: {
//         type: "text",
//         label: "Votre nom",
//         placeholder: "Entrez votre nom...",
//         name: "username",
//         required: true
//       },
//       children: []
//     }
//   }
// ];

