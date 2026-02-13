<script lang="ts" setup>
import { computed, inject } from 'vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import { cn } from '../../lib/utils';
import { findComponentById } from '../../lib/treeUtils';
import type { AnyComponentInstance } from '../../type/component';
import StyleEditor from '../../components/builder/StyleEditor.vue';
import DataEditor from '../../components/builder/DataEditor.vue';
import { MousePointer2, Trash2 } from 'lucide-vue-next';

// Injection de l'état global
const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  deleteComponent: (id: string) => void;
}>('builderState');

// Calcul de l'élément sélectionné
const selectedElement = computed(() => {
  if (!builderState?.selectedId.value || !builderState?.pageTree.value) return null;
  return findComponentById(builderState.pageTree.value, builderState.selectedId.value);
});

const handleDelete = () => {
  if (!selectedElement.value) return;
  
  // if (confirm(`Êtes-vous sûr de vouloir supprimer "${selectedElement.value.name}" ?`)) {
    builderState?.deleteComponent(selectedElement.value.id);
  // }
};
</script>

<template>
  <div :class="cn(['w-full', 'p-2', 'text-text', 'font-bold', 'h-full', 'flex', 'flex-col', 'bg-builder-bar-background'])">
    <div class="relative h-full w-full overflow-y-auto flex flex-col">
      
      <!-- État sélectionné -->
      <div v-if="selectedElement" class="relative p-4 flex-1 overflow-y-auto">
        <div class="mb-6 flex items-start justify-between">
          <div>
            <!-- <p class="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Composant</p> -->
            <h3 class="text-lg font-bold text-white">{{ selectedElement.name }}</h3>
            <p class="text-xs text-gray-500 font-mono">{{ selectedElement.tag }}</p>
          </div>
          <button 
            @click="handleDelete"
            class="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400 hover:text-red-300"
            title="Supprimer le composant"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <Tabs default-value="style" class="w-full">
          <TabsList class="w-full justify-between grid grid-cols-2 mb-4">
            <TabsTrigger value="style" class=" h-8 data-[state=active]:bg-primary data-[state=active]:text-white">Style</TabsTrigger>
            <TabsTrigger value="rules" class=" h-8 data-[state=active]:bg-primary data-[state=active]:text-white">Paramétrages</TabsTrigger>
          </TabsList>

          <TabsContent value="style" class="mt-0 border-none p-0 outline-none">
            <StyleEditor :element="selectedElement" />
          </TabsContent>

          <TabsContent value="rules" class="mt-0 border-none p-0 outline-none">
            <DataEditor :element="selectedElement" />
          </TabsContent>
        </Tabs>
      </div>

      <!-- État vide -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <MousePointer2 class="text-gray-500 w-6 h-6" />
        </div>
        <p class="text-sm text-gray-400">Sélectionnez un composant sur le canevas pour modifier ses propriétés.</p>
      </div>

    </div>
  </div>
</template>
