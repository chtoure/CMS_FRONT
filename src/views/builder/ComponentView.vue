<script lang="ts" setup>
import * as Icons from 'lucide-vue-next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import CompositionDarkMode from '../../components/composition/CompositionDarkMode.vue';
import { useGetBlocTemplatesComponentCustom, useGetComponents } from '../../hook/component';
import { computed, type ComponentInstance, type Component as VueComponent } from 'vue';
import type { AllStyles, AnyComponentInstance, Component, BaseStyles } from '../../type/component';
import type { BlocTemplate } from '../../type/bloc-template';


const { data: components, isLoading } = useGetComponents();
const { data: customComponents, isLoading: isLoadingCustom } = useGetBlocTemplatesComponentCustom();

import { inject } from 'vue';
const builderState = inject<{
  setClipboard: (item: AnyComponentInstance | null) => void;
  clipboard: { value: AnyComponentInstance | null };
}>('builderState');


const allComponents = computed(() => {
  const base = components.value?.results || [];
  return [...base];
});


type IconName = keyof typeof Icons;

const getIcon = (name: string): VueComponent => {
  if (name in Icons) {
    const maybeIcon = Icons[name as IconName];
    if (typeof maybeIcon === 'function' || typeof maybeIcon === 'object') {
      return (maybeIcon as unknown) as VueComponent;
    }
  }

  return (Icons.HelpCircle as unknown) as VueComponent;
};


const deepCloneInstance = (node: AnyComponentInstance): AnyComponentInstance => {
  let definitionId = node.componentDefinitionId;

  // Si l'ID de définition est manquant (cas des default children), on tente de le trouver par tag
  if (!definitionId && allComponents.value) {
    const componentDef = allComponents.value.find((c: Component<AllStyles>) => c.tag === node.tag);
    if (componentDef) {
      definitionId = componentDef.id;
    }
  }

  return {
    ...node,
    id: crypto.randomUUID(),
    componentDefinitionId: definitionId,
    children: node.children ? node.children.map(deepCloneInstance) : []
  };
};

const onClone = <T extends AllStyles>(element: Component<T>): ComponentInstance<T> => {
  const instance = {
    id: crypto.randomUUID(),
    name: element.name,
    tag: element.tag,
    icon: element.icon,
    family: element.family,
    supportedActions: element.supportedActions,
    componentDefinitionId: element.id, // Stocker l'ID du type de composant pour le backend
    styles: { ...element.defaultProps.styles } as T,
    data: { ...element.defaultProps.data },
    params: element.defaultProps.params ? [...element.defaultProps.params] : [],
    children: element.defaultProps.children
      ? element.defaultProps.children.map(deepCloneInstance)
      : [] as AnyComponentInstance[]
  };
  console.log('Cloning component:', element.tag, 'with children:', instance.children.length);
  // console.log('Created instance:', instance);
  return instance as ComponentInstance<T>;
};

const onCloneCustom = (block: BlocTemplate, isTopLevel = true): AnyComponentInstance => {
  // Extraire les dimensions si elles existent pour un pré-rendu fluide
  const initialStyles: BaseStyles = {};
  if (block.props?.styles?.width) initialStyles.width = block.props.styles.width;
  if (block.props?.styles?.height) initialStyles.height = block.props.styles.height;

  // Le backend peut renvoyer les enfants dans 'children' ou 'customBlocTemplates'
  const backendChildren = (block as BlocTemplate & { children?: BlocTemplate[] }).children || block.customBlocTemplates || [];

  const instance: AnyComponentInstance = {
    id: crypto.randomUUID(),
    name: block.name || block.component?.name || 'Composant',
    tag: block.component?.tag || 'div',
    icon: block.component?.icon || 'Package',
    family: block.component?.family || 'container',
    supportedActions: block.component?.supportedActions || [],
    componentDefinitionId: block.componentId,
    // On conserve le modelId sur tous les nœuds pour permettre
    // le merge de style complet récursif en base.
    modelId: block.modelId || block.id,
    blocTemplateId: undefined, // Nouvelle instance sur la page
    styles: { ...(block.props?.styles || initialStyles) },
    data: { ...(block.props?.data || {}) },
    params: block.props?.params ? [...block.props.params] : [],
    children: Array.isArray(backendChildren) ? backendChildren.map(child => onCloneCustom(child, false)) : []
  };
  return instance;
};

const selectToPlace = (comp: Component<AllStyles>) => {
  const cloned = onClone(comp);
  builderState?.setClipboard(cloned);
};

const selectCustomToPlace = (block: BlocTemplate) => {
  const cloned = onCloneCustom(block);
  builderState?.setClipboard(cloned);
};

const cancelPlace = () => {
  builderState?.setClipboard(null);
};
</script>


<template>
  <div class="w-full text-builder-bar-text h-full flex flex-col">
    <div class="relative h-full overflow-y-auto flex flex-col">
      <div class="sticky top-0 z-10 pb-1 w-full  bg-builder-bar-background">
        <div class="flex items-center justify-end gap-2 p-2">
          <CompositionDarkMode className="hover:bg-transparent !rounded"/>
        </div>
      </div>

      <hr class="border-border">

      <div class="relative flex-1 overflow-y-auto p-2">
        <Tabs default-value="atomic" class="w-full">
          <TabsList class="w-full justify-between grid grid-cols-2 mb-4">
            <TabsTrigger value="atomic" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white !rounded">Atomique</TabsTrigger>
            <TabsTrigger value="custom" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white !rounded">Mes Composants</TabsTrigger>
          </TabsList>

          <TabsContent value="atomic" class="mt-0">
            <div v-if="isLoading || !components" class="flex justify-center p-4">
              <Icons.Loader2 class="animate-spin text-primary" />
            </div>

            <div v-else>
              <!-- Info ClipBoard -->
              <div v-if="builderState?.clipboard.value" class="mb-4 bg-primary/10 border border-primary/20 text-primary p-2 rounded text-xs text-center flex flex-col items-center gap-1">
                <span class="font-bold tracking-wider uppercase text-[9px]">{{ builderState.clipboard.value.name }} sélect.</span>
                <span class="text-[10px] opacity-80">Cliquez sur (+) pour le déposer</span>
                <button @click="cancelPlace" class="mt-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-0.5 rounded uppercase text-[8px] tracking-wider font-bold transition-colors">Annuler</button>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="comp in allComponents"
                  :key="comp.tag"
                  @click="selectToPlace(comp)"
                  class="flex flex-col items-center justify-center p-3 border border-builder-bar-border rounded cursor-pointer transition-all hover:-translate-y-1"
                  :class="{ 'ring-2 ring-primary ring-offset-2 ring-offset-builder-bar-background': builderState?.clipboard.value?.componentDefinitionId === comp.id && !builderState?.clipboard.value?.modelId }"
                >
                  <component
                    :is="getIcon(comp.icon)"
                    class="h-6 w-6 mb-2 text-builder-bar-text"
                    stroke-width="1"
                  />
                  <span class="text-[10px] text-center font-medium leading-tight">
                    {{ comp.name }}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" class="mt-0">
            <div v-if="isLoadingCustom" class="flex justify-center p-4">
              <Icons.Loader2 class="animate-spin text-primary" />
            </div>
            <div v-else-if="!customComponents || customComponents.length === 0" class="text-center p-8 opacity-40">
              <Icons.Package class="w-8 h-8 mx-auto mb-2" stroke-width="1" />
              <p class="text-[10px] tracking-widest font-bold">Aucun composant</p>
            </div>
            <div v-else class="flex flex-col gap-2">
              <!-- Info ClipBoard Custom -->
              <div v-if="builderState?.clipboard.value" class="mb-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2 rounded text-xs text-center flex flex-col items-center gap-1">
                <span class="font-bold tracking-wider uppercase text-[9px]">{{ builderState.clipboard.value.name }} sélect.</span>
                <span class="text-[10px] opacity-80">Cliquez sur (+) pour le déposer</span>
                <button @click="cancelPlace" class="mt-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-0.5 rounded uppercase text-[8px] tracking-wider font-bold transition-colors">Annuler</button>
              </div>

              <div class="grid grid-cols-2 gap-2 col-span-2">
                <div
                  v-for="block in customComponents"
                  :key="block.id"
                  @click="selectCustomToPlace(block)"
                  class="flex flex-col items-center justify-center p-3 border border-builder-bar-border rounded cursor-pointer transition-all hover:-translate-y-1"
                  :class="{ 'ring-2 ring-blue-500 ring-offset-2 ring-offset-builder-bar-background': builderState?.clipboard.value?.modelId === (block.modelId || block.id) }"
                >
                  <component
                    :is="getIcon(block.component?.icon || 'Package')"
                    class="h-6 w-6 mb-2 text-blue-400"
                    stroke-width="1"
                  />
                  <span class="text-[10px] text-center font-medium leading-tight text-text">
                    {{ block.name }}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
