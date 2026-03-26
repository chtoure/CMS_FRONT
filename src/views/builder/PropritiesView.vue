<script lang="ts" setup>
import { computed, inject } from 'vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import { cn } from '../../lib/utils';
import { findComponentById, removeFromTree } from '../../lib/treeUtils';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import StyleEditor from '../../components/builder/StyleEditor.vue';
import DataEditor from '../../components/builder/DataEditor.vue';
import BgImageParam from '../../components/builder/parameters/BgImageParam.vue';
import { MousePointer2, Webhook } from 'lucide-vue-next';

// Injection de l'état global
const { hasPermission } = usePermission();

const builderState = inject<{
  pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
  libraryTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  builderMode: { value: 'page' | 'library' };
  deleteComponent: (id: string) => void;
}>('builderState');

import { useBlockTemplate } from '../../hook/bloc-template';
import { Save } from 'lucide-vue-next';
import CompositionModal from '../../components/composition/CompositionModal.vue';
import VariableListView from '../variable/VariableListView.vue';
import { usePermission } from '../../hook/usePermission';

const { useSaveAsCustom } = useBlockTemplate();
const saveAsCustomMut = useSaveAsCustom();

const handleSaveAsCustom = async () => {
    if (!selectedElement.value || !('tag' in selectedElement.value)) return;
    try {
        const idToRemove = selectedElement.value.id;
        await saveAsCustomMut.mutateAsync(selectedElement.value as AnyComponentInstance);

        // Suppression locale pour éviter d'avoir à rafraîchir
        if (builderState) {
            builderState.pageTree.value = removeFromTree(builderState.pageTree.value, idToRemove) as AnySectionInstance[];
            builderState.selectedId.value = null;
        }
    } catch (error) {
        console.error('Failed to save as custom:', error);
    }
};

// Calcul de l'élément sélectionné
const selectedElement = computed(() => {
  if (!builderState?.selectedId.value) return null;

  const tree = builderState.builderMode.value === 'page'
    ? builderState.pageTree.value
    : builderState.libraryTree?.value;

  if (!tree) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return findComponentById(tree as any, builderState.selectedId.value);
});

</script>

<template>
  <div :class="cn(['w-full', 'p-2', 'text-builder-bar-text', 'font-bold', 'h-full', 'flex', 'flex-col', 'bg-builder-bar-background'])">
    <div class="relative h-full w-full overflow-y-auto flex flex-col">

      <div v-if="selectedElement" class="relative p-2 flex-1 overflow-y-auto">
        <div class=" flex flex-col gap-2 items-start justify-between pb-3">
          <div class="flex flex-row gap-4 items-center w-full">
            <p v-if="'tag' in selectedElement" class="text-xs text-gray-500 font-mono">{{ selectedElement.tag }}</p>
            <p v-else class="text-xs text-gray-500 font-mono">Layout Section</p>
            <CompositionModal v-if="hasPermission(['read_collection', 'read_variable'])" title="Variables">
              <template #trigger>
                <button class="hover:text-primary">
                  <Webhook class="w-3.5 h-3.5" />
                </button>
              </template>
              <template #content>
                <VariableListView />
              </template>
            </CompositionModal>
          </div>

          <!-- Save as Custom Button -->
          <button
            v-if="'tag' in selectedElement && builderState?.builderMode.value === 'page'"
            @click="handleSaveAsCustom"
            class="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 rounded transition-all text-[10px] uppercase font-bold"
            title="Enregistrer comme composant réutilisable"
          >
            <Save class="w-3.5 h-3.5" />
            Designer
          </button>
        </div>

        <hr class="border-border">

        <Tabs default-value="style" class="w-full pt-2">
          <TabsList class="w-full justify-between grid grid-cols-2 mb-4">
            <TabsTrigger value="style" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white !rounded">Style</TabsTrigger>
            <TabsTrigger value="rules" class="text-xs h-8 data-[state=active]:bg-primary data-[state=active]:text-white !rounded">Paramétrages</TabsTrigger>
          </TabsList>

          <TabsContent value="style" class="mt-0 border-none !p-0 outline-none">
            <StyleEditor :element="selectedElement as any" />
          </TabsContent>

          <TabsContent value="rules" class="mt-0 border-none p-0 outline-none">
            <DataEditor v-if="'family' in selectedElement && selectedElement.family !== 'section'" :element="selectedElement as any" />
            <!-- Sections : raccourci Arrière-plan uniquement -->
            <div v-else class="space-y-4 p-2">
              <BgImageParam :element="selectedElement as any" />
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
