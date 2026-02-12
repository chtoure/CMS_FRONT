<script lang="ts" setup>
import { ref, watch, provide, computed } from 'vue';
import CanvaView from './CanvaView.vue';
import ComponentView from './ComponentView.vue';
import PropritiesView from './PropritiesView.vue';
import { X, Menu, Undo, Redo } from 'lucide-vue-next';
import Button from '../../components/ui/button/Button.vue';
import type { AnyComponentInstance } from '../../type/component';

const showComponentView = ref(true);
const showPropertiesView = ref(false);

const pageTree = ref<AnyComponentInstance[]>([]);
const selectedId = ref<string | null>(null);

const selectComponent = (id: string | null) => {
  selectedId.value = id;
};

const deleteComponent = (id: string) => {
  // Fonction récursive pour supprimer un composant de l'arbre
  const removeFromTree = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.filter(node => {
      if (node.id === id) return false;
      if (node.children && node.children.length > 0) {
        node.children = removeFromTree(node.children);
      }
      return true;
    });
  };
  
  pageTree.value = removeFromTree(pageTree.value);
  // Désélectionner après suppression
  selectComponent(null);
};

// Automatisme de la barre de propriétés
watch(selectedId, (newId) => {
  showPropertiesView.value = !!newId;
});

// --- Gestion de l'historique (Undo/Redo) ---
const history = ref<string[]>([JSON.stringify(pageTree.value)]);
const historyIndex = ref(0);
const isTimeTraveling = ref(false); // Flag pour éviter que l'undo/redo ne déclenche le watcher

watch(pageTree, (newVal) => {
  // Si le changement vient d'un undo/redo, on ne l'ajoute pas à l'historique
  if (isTimeTraveling.value) {
    isTimeTraveling.value = false;
    return;
  }

  const newState = JSON.stringify(newVal);
  // Évite les doublons si le watcher se déclenche sans changement réel
  if (history.value[historyIndex.value] === newState) return;

  // Si on a fait des "Undo" et qu'on modifie, on supprime le futur (Redo impossible)
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }

  history.value.push(newState);
  historyIndex.value++;
}, { deep: true });

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    isTimeTraveling.value = true;
    pageTree.value = JSON.parse(history.value[historyIndex.value]!);
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    isTimeTraveling.value = true;
    pageTree.value = JSON.parse(history.value[historyIndex.value]!);
  }
};

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);

provide('builderState', {
  pageTree,
  selectedId,
  selectComponent,
  deleteComponent,
  undo,
  redo,
  canUndo,
  canRedo
});

// Ancien provide pour compatibilité descendante immédiate si nécessaire
provide('builderSelector', {
  selectedId,
  selectComponent
});
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-builder-background">

    <main 
      class="absolute inset-y-0 z-0 transition-all duration-300 ease-in-out"
      :style="{ 
        left: showComponentView ? '16rem' : '0', 
        right: showPropertiesView ? '16rem' : '0' 
      }"
    >
      <CanvaView />
    </main>

    <!-- Sidebar Composants -->
    <aside
      class="absolute top-0 left-0 h-full w-64 bg-builder-bar-background border-r border-border z-10 transform transition-transform duration-300 ease-in-out shadow-xl"
      :class="showComponentView ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="font-bold text-builder-bar-text tracking-wide">Composants</h2>
        <Button @click="showComponentView = false" class="text-white">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-y-auto w-full bg-builder-bar-background px-4 py-2">
        <ComponentView />
      </div>
    </aside>

    <!-- Sidebar Propriétés -->
    <aside
      class="absolute top-0 right-0 h-full w-64 bg-builder-bar-background border-l border-border z-10 transform transition-transform duration-300 ease-in-out shadow-xl"
      :class="showPropertiesView ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="font-bold text-builder-bar-text tracking-wide">Propriétés</h2>
        <Button @click="selectComponent(null)" class="text-white">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-y-auto">
        <PropritiesView />
      </div>
    </aside>

    <!-- Boutons Flottants (Menu & Undo/Redo) -->
    <div class="absolute top-4 left-4 z-20 transition-all duration-300 flex items-center gap-2" :class="{ 'translate-x-64': showComponentView }">
       <Button
        v-if="!showComponentView"
        @click="showComponentView = true"
        class="flex items-center justify-center p-2 text-white shadow-lg transition-all"
        title="Ouvrir les composants"
      >
        <Menu class="h-5 w-5" />
      </Button>

      <!-- Groupe Undo/Redo -->
      <div class="flex items-center gap-1 bg-builder-bar-background rounded-md shadow-lg p-1 border border-border">
        <Button 
          @click="undo" 
          :disabled="!canUndo"
          class="p-1.5 text-white hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Annuler (Ctrl+Z)"
        >
          <Undo class="h-4 w-4" />
        </Button>
        <Button 
          @click="redo" 
          :disabled="!canRedo"
          class="p-1.5 text-white hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Rétablir (Ctrl+Y)"
        >
          <Redo class="h-4 w-4" />
        </Button>
      </div>
    </div>

  </div>
</template>

<style scoped>
aside ::-webkit-scrollbar {
  width: 5px;
}
aside ::-webkit-scrollbar-track {
  background: transparent;
}
aside ::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
aside ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
