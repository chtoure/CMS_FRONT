<script lang="ts" setup>
import * as Icons from 'lucide-vue-next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import CompositionDarkMode from '../../components/composition/CompositionDarkMode.vue';
import { useGetComponents } from '../../hook/component';
import { type ComponentInstance, type Component as VueComponent } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { AllStyles, AnyComponentInstance, Component } from '../../type/component';

const { data: components, isLoading } = useGetComponents();

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
    styles: { ...element.defaultProps.styles } as T,
    data: { ...element.defaultProps.data },
    children: [] as AnyComponentInstance[],
    params: element.defaultProps.params,
  };
  console.log('Cloning component:', element);
  console.log('Created instance:', instance);
  return instance as ComponentInstance<T>;
};
</script>

<template>
  <div class="w-full text-builder-bar-text h-full flex flex-col">
    <div class="relative h-full overflow-y-auto flex flex-col">
      <div class="sticky top-0 z-10 pb-1 w-full border-b border-border bg-builder-bar-background">
        <div class="flex items-center justify-end gap-2 p-2">
          <CompositionDarkMode className="hover:bg-transparent"/>
        </div>
      </div>

      <div class="relative flex-1 overflow-y-auto p-2">
        <Tabs default-value="atomic" class="w-full">
          <TabsList class="w-full justify-between grid grid-cols-2 mb-4">
            <TabsTrigger value="atomic" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white">Atomique</TabsTrigger>
            <TabsTrigger value="complex" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white">Complexe</TabsTrigger>
          </TabsList>

          <TabsContent value="atomic" class="mt-0">
            <div v-if="isLoading" class="flex justify-center p-4">
              <Icons.Loader2 class="animate-spin text-primary" />
            </div>

            <div v-else >
              <VueDraggable
                v-model="components!"
                :animation="150"
                :group="{ name: 'blocks', pull: 'clone', put: false }"
                :sort="false"
                :clone="onClone"
                class="grid grid-cols-2 gap-2"
              >
                <div
                  v-for="comp in components"
                  :key="comp.tag"
                  class="flex flex-col items-center justify-center p-3 border border-builder-bar-border rounded-md cursor-grab hover:-translate-y-1 transition-all group"
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

          <TabsContent value="complex">
            <p class="text-xs text-text">liste des composants complexes</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
