<script lang="ts" setup>
import * as Icons from 'lucide-vue-next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import CompositionDarkMode from '../../components/composition/CompositionDarkMode.vue';
import { useGetBlocTemplatesComponentCustom, useGetComponents } from '../../hook/component';
import {watch, type ComponentInstance, type Component as VueComponent } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { AllStyles, AnyComponentInstance, Component } from '../../type/component';
import type { BlocTemplate } from '../../type/bloc-template';


const { data: components, isLoading } = useGetComponents();
const { data: customComponents, isLoading: isLoadingCustom } = useGetBlocTemplatesComponentCustom();

watch(components, () => {
  console.log(components.value);
})

console.log('custom components', customComponents.value);


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
    children: [] as AnyComponentInstance[]
  };
  console.log('Cloning component:', element);
  console.log('Created instance:', instance);
  return instance as ComponentInstance<T>;
};

const onCloneCustom = (block: BlocTemplate): AnyComponentInstance => {
  // On transforme le BlocTemplate stocké en instance active pour le builder
  // Note: Si le bloc a des enfants, il faudra une logique récursive plus complexe plus tard.
  const instance: AnyComponentInstance = {
    id: crypto.randomUUID(),
    name: block.name,
    tag: block.component?.tag || 'div',
    icon: block.component?.icon || 'Package',
    family: block.component?.family || 'container',
    supportedActions: block.component?.supportedActions || [],
    componentDefinitionId: block.componentId,
    blocTemplateId: undefined, // Nouvelle instance sur la page
    styles: block.props?.styles || {},
    data: block.props?.data || {},
    children: [] // TODO: Récupérer les enfants si c'est un bloc complexe stocké
  };
  return instance;
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

            <div v-else >
              <VueDraggable
                v-model="components.results!"
                :animation="150"
                :group="{ name: 'blocks', pull: 'clone', put: false }"
                :sort="false"
                :clone="onClone" 
                class="grid grid-cols-2 gap-2"
              >
                <div 
                  v-for="comp in components?.results" 
                  :key="comp.tag"
                  class="flex flex-col items-center justify-center p-3 border border-builder-bar-border rounded cursor-grab hover:-translate-y-1 transition-all group"
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
              </VueDraggable>
              
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
            <div v-else class="grid grid-cols-2 gap-2">
               <VueDraggable
                v-model="customComponents"
                :animation="150"
                :group="{ name: 'blocks', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneCustom" 
                class="grid grid-cols-2 gap-2 col-span-2"
              >
                <div 
                  v-for="block in customComponents" 
                  :key="block.id"
                  class="flex flex-col items-center justify-center p-3 border border-builder-bar-border rounded cursor-grab hover:-translate-y-1 transition-all group bg-blue-500/5 border-blue-500/20"
                >
                  <component 
                    :is="getIcon(block.component?.icon || 'Package')" 
                    class="h-6 w-6 mb-2 text-blue-400" 
                    stroke-width="1"
                  />
                  <span class="text-[10px] text-center font-medium leading-tight text-white">
                    {{ block.name }}
                  </span>
                </div>
              </VueDraggable>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>