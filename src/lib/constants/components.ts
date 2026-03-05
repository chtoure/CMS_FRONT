import { ACTIONS_BY_FAMILY, type AnyComponent } from "../../type/component";

export const INJECTED_COMPONENTS: AnyComponent[] = [
  {
    id: 998,
    name: "Lien",
    tag: "LinkBuilder",
    icon: "ExternalLink",
    family: "static",
    supportedActions: ACTIONS_BY_FAMILY['static'],
    defaultProps: {
      styles: {
        textColor: "#3b82f6",
        textAlign: "left"
      },
      data: {
        text: "Lien personnalisé",
        url: "",
        target: "_self"
      },
      children: []
    }
  } as AnyComponent,
  {
    id: 999,
    name: "Navbar",
    tag: "NavbarBuilder",
    icon: "LayoutTemplate",
    family: "container",
    supportedActions: ACTIONS_BY_FAMILY['container'],
    defaultProps: {
      styles: {
        width: "100%",
        padding: "4",
        bg: "#ffffff",
        display: "flex",
        direction: "horizontal",
        justify: "space-between",
        align: "center",
        shadow: "sm"
      },
      data: {
        isSticky: true,
        responsiveToggle: true
      },
      children: [
        {
          id: 'nav-left-tmp',
          name: "Zone Gauche",
          tag: "CardBuilder",
          icon: "Square",
          family: "container",
          supportedActions: ACTIONS_BY_FAMILY['container'],
          styles: { padding: "2", display: "flex", align: "center", width: "auto" },
          data: { slot: 'left', isMovable: false },
          children: []
        },
        {
          id: 'nav-right-tmp',
          name: "Zone Droite",
          tag: "CardBuilder",
          icon: "Square",
          family: "container",
          supportedActions: ACTIONS_BY_FAMILY['container'],
          styles: { padding: "2", display: "flex", align: "center", width: "auto" },
          data: { slot: 'right', isMovable: false },
          children: []
        }
      ]
    }
  } as AnyComponent
];

export const isTemporalComponent = (id: number | undefined) => id && id >= 998;
