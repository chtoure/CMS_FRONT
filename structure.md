graph TB
    subgraph "🎯 Vue Principale"
        BV["BuilderView.vue<br/>(Orchestrateur)"]
        BV -->|provide| BS["🔄 builderState<br/>(Contexte Global)"]
    end

    subgraph "📊 Trois Panneaux"
        CV["CanvaView.vue<br/>(Canvas Drag-Drop)"]
        PV["PropritiesView.vue<br/>(Propriétés)"]
        COMPV["ComponentView.vue<br/>(Arborescence)"]
    end

    BS -->|inject| CV
    BS -->|inject| PV
    BS -->|inject| COMPV

    CV --> BR["BlocRender.vue<br/>(Moteur Rendu)"]

    subgraph "⚛️ Composants Atomiques"
        subgraph "Static (Texte/Contenu)"
            TB["TextBuilder"]
            IB["ImageBuilder"]
            ICON["IconBuilder"]
        end

        subgraph "Interactive (Actions)"
            BTN["ButtonBuilder"]
            LINK["LinkBuilder"]
        end

        subgraph "Input (Formulaires)"
            INPUT["InputBuilder"]
        end

        subgraph "Complex (Avancés)"
            SLIDER["SliderBuilder"]
            ACC["AccordionBuilder"]
            NAV["NavbarBuilder"]
            CARD["CardBuilder"]
        end

        subgraph "Container (Conteneurs)"
            CONT["CardBuilder"]
        end
    end

    BR -->|dynamique| TB
    BR -->|dynamique| IB
    BR -->|dynamique| ICON
    BR -->|dynamique| BTN
    BR -->|dynamique| LINK
    BR -->|dynamique| INPUT
    BR -->|dynamique| SLIDER
    BR -->|dynamique| ACC
    BR -->|dynamique| NAV
    BR -->|dynamique| CARD

    subgraph "🎨 Éditeurs de Style"
        SE["StyleEditor.vue<br/>(Dispatcher)"]
        subgraph "Style Editors"
            BSE["BaseStyleEditor"]
            TSE["TextStyleEditor"]
            BUSE["ButtonStyleEditor"]
            LSE["LayoutStyleEditor"]
            LISE["LinkStyleEditor"]
            SLISE["SliderStyleEditor"]
            AISE["AccordionStyleEditor"]
            NISE["NavbarStyleEditor"]
        end
    end

    PV --> SE
    SE -->|tag check| BSE
    SE -->|TextBuilder| TSE
    SE -->|ButtonBuilder| BUSE
    SE -->|container| LSE
    SE -->|LinkBuilder| LISE
    SE -->|SliderBuilder| SLISE
    SE -->|AccordionBuilder| AISE
    SE -->|NavbarBuilder| NISE

    subgraph "📝 Éditeur de Données"
        DE["DataEditor.vue"]
    end

    PV --> DE

    subgraph "🔧 Système de Styles"
        SP["styleProcessor.ts<br/>(Mappers & Conversions)"]
        BM["buildStyles()"]
        BIS["buildInlineStyles()"]
        BLS["buildLayoutStyles()"]
        RVB["resolveValueForBreakpoint()"]
    end

    BSE --> SP
    TSE --> SP
    TB --> SP
    IB --> SP

    SP --> BM
    SP --> BIS
    SP --> BLS
    SP --> RVB

    subgraph "🛠️ Système Backend"
        HT["useBlockTemplate()"]
        SEC["useSection()"]
        AS["autoSave()"]
    end

    BS -->|save| HT
    BS -->|save| SEC
    HT --> AS

    subgraph "📋 Types & Modèles"
        CS["style.ts<br/>BaseStyles<br/>ContainerStyles<br/>StaticStyles<br/>InteractiveStyles<br/>InputStyles"]
        CT["component.ts<br/>AnyComponentInstance<br/>CliquableAction<br/>ResponsiveProp"]
        SS["section.ts<br/>AnySectionInstance"]
    end

    subgraph "🗂️ Registry"
        CR["component_registry.ts<br/>(COMPONENT_MAP)"]
    end

    BR --> CR
    CR -->|lookup| TB
    CR -->|lookup| BTN

    style BV fill:#4a5568,stroke:#63b3ed
    style BS fill:#2d3748,stroke:#63b3ed
    style BR fill:#2d3748,stroke:#81e6d9
    style SE fill:#2d3748,stroke:#fbd38d
    style SP fill:#2d3748,stroke:#9f7aea