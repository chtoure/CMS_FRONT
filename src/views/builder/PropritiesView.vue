<script lang="ts" setup>
import { computed, inject } from 'vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import { cn } from '../../lib/utils';
import { findComponentById } from '../../lib/treeUtils';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import StyleEditor from '../../components/builder/StyleEditor.vue';
import DataEditor from '../../components/builder/DataEditor.vue';
import { MousePointer2 } from 'lucide-vue-next';

// Injection de l'état global
const builderState = inject<{
  pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
  selectedId: { value: string | null };
  deleteComponent: (id: string) => void;
}>('builderState');

// Calcul de l'élément sélectionné
const selectedElement = computed(() => {
  if (!builderState?.selectedId.value || !builderState?.pageTree.value) return null;
  return findComponentById(builderState.pageTree.value as any, builderState.selectedId.value);
});

// const handleDelete = () => {
//   if (!selectedElement.value) return;
  
//   // if (confirm(`Êtes-vous sûr de vouloir supprimer "${selectedElement.value.name}" ?`)) {
//     builderState?.deleteComponent(selectedElement.value.id);
//   // }
// };
</script>

<template>
  <div :class="cn(['w-full', 'p-2', 'text-builder-bar-text', 'font-bold', 'h-full', 'flex', 'flex-col', 'bg-builder-bar-background'])">
    <div class="relative h-full w-full overflow-y-auto flex flex-col">
      
      <div v-if="selectedElement" class="relative p-4 flex-1 overflow-y-auto">
        <div class="mb-6 flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-builder-bar-text">
              {{ 'name' in selectedElement ? selectedElement.name : 'Section' }}
            </h3>
            <p v-if="'tag' in selectedElement" class="text-xs text-gray-500 font-mono">{{ selectedElement.tag }}</p>
            <p v-else class="text-xs text-gray-500 font-mono">Layout Section</p>
          </div>
        </div>

        <Tabs default-value="style" class="w-full">
          <TabsList class="w-full justify-between grid grid-cols-2 mb-4">
            <TabsTrigger value="style" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white">Style</TabsTrigger>
            <TabsTrigger value="rules" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white">Paramétrages</TabsTrigger>
          </TabsList>

          <TabsContent value="style" class="mt-0 border-none p-0 outline-none">
            <StyleEditor :element="selectedElement as any" />
          </TabsContent>

          <TabsContent value="rules" class="mt-0 border-none p-0 outline-none">
            <DataEditor v-if="'family' in selectedElement && selectedElement.family !== 'section'" :element="selectedElement as any" />
            <div v-else class="p-4 text-center text-xs text-gray-500 italic">
              Pas de paramétrages de données pour les sections.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <MousePointer2 class="text-builder-bar-text w-6 h-6" />
        </div>
        <p class="text-sm text-builder-bar-text font-mono">Sélectionnez un composant sur le canevas pour modifier ses propriétés.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.input-custom {
  @apply h-9 w-full !rounded px-3 py-1 text-[11px] shadow-sm transition-all outline-none font-mono;
  
  background-color: var(--builder-input-bg);
  border: 1px solid var(--builder-input-border);
  color: var(--builder-input-text);
  
  @apply focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:border-transparent;

  --tw-ring-color: #3B82F6;
}

.input-custom::placeholder {
  color: var(--builder-input-placeholder);
}

.select-item-custom {
  @apply cursor-pointer transition-colors px-2 py-1.5 rounded-sm font-mono;
  color: var(--builder-bar-text);
}

.select-item-custom[data-highlighted] {
  background-color: var(--primary) !important;
  color: #F8FAFC !important;
  outline: none !important;
}
</style>
