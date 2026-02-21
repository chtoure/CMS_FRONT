<script lang="ts" setup>
import { ref, watch, provide, computed } from 'vue';
import CanvaView from './CanvaView.vue';
import ComponentView from './ComponentView.vue';
import PropritiesView from './PropritiesView.vue';
import { X, Menu, Undo, Redo, RefreshCw, Cloud } from 'lucide-vue-next';
import Button from '../../components/ui/button/Button.vue';
import type { AnyComponentInstance } from '../../type/component';

const router = useRouter();

const pageRevisionId = computed(() => {
    return (router.currentRoute.value.params.id as unknown) as number
})

const showComponentView = ref(true);
const showPropertiesView = ref(false);

const pageTree = ref<AnySectionInstance[]>([]);
const selectedId = ref<string | null>(null);
const selectedSectionId = ref<string | null>(null);

const selectComponent = (id: string | null) => {
  selectedId.value = id;
};

const deleteComponent = async (id: string) => {
  let blocTemplateIdToDelete: number | null = null;
  let sectionIdToDelete: number | null = null;
  let isSection = false;
  
  // Supprimer une section
  const sectionIndex = pageTree.value.findIndex(s => s.id === id);
  if (sectionIndex !== -1) {
    const section = pageTree.value[sectionIndex]!;
    if (section.sectionId) sectionIdToDelete = section.sectionId;
    pageTree.value.splice(sectionIndex, 1);
    isSection = true;
  } else {
    // Supprimer un bloc à l'intérieur des sections
    const removeFromSections = (sections: AnySectionInstance[]): AnySectionInstance[] => {
      return sections.map(section => ({
        ...section,
        children: removeFromTree(section.children)
      }));
    };

    const removeFromTree = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
      return nodes.filter(node => {
        if (node.id === id) {
          if (node.blocTemplateId) blocTemplateIdToDelete = node.blocTemplateId;
          return false;
        }
        if (node.children && node.children.length > 0) {
          node.children = removeFromTree(node.children);
        }
        return true;
      });
    };
    
    pageTree.value = removeFromSections(pageTree.value);
  }

  // Désélectionner après suppression
  selectComponent(null);
  selectedSectionId.value = null;

  // Appels Backend
  if (isSection && sectionIdToDelete) {
    try {
      await useDeleteSection(sectionIdToDelete);
      console.log('Section deleted from backend');
    } catch (error) {
      console.error('Failed to delete section from backend', error);
    }
  } else if (blocTemplateIdToDelete) {
    try {
      await deleteBlockTemplate(blocTemplateIdToDelete);
      console.log('Block deleted from backend');
    } catch (error) {
      console.error('Failed to delete block from backend', error);
    }
  }
};

// Automatisme de la barre de propriétés
watch(selectedId, (newId) => {
  showPropertiesView.value = !!newId;
});

// Gestion de la suppression via touche clavier
import { onMounted, onUnmounted } from 'vue';

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // Vérifier si l'utilisateur n'est pas en train d'écrire
    const activeElement = document.activeElement;
    const isInput = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.getAttribute('contenteditable') === 'true'
    );
    
    if (!isInput && selectedId.value) {
      deleteComponent(selectedId.value);
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// --- Auto-Save Integration ---
import { useBlockTemplate } from '../../hook/bloc-template';
import type { AnySectionInstance } from '../../type/section';
import { useRouter } from 'vue-router';
const { autoSave, isSaving, fetchAll, deleteBlockTemplate, useDeleteSection } = useBlockTemplate();

// --- Gestion de l'historique et de la Sauvegarde ---
const history = ref<string[]>([JSON.stringify(pageTree.value)]);
const historyIndex = ref(0);
const isInternalChange = ref(false); 

const loadInitialData = async () => {
  if (!pageRevisionId.value) return;
  isInternalChange.value = true;
  const initialTree = await fetchAll(pageRevisionId.value);
  pageTree.value = initialTree;
  history.value = [JSON.stringify(initialTree)];
  historyIndex.value = 0;
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  loadInitialData();
});

// Un seul watcher pour tout
watch(pageTree, async (newVal) => {
  if (isInternalChange.value) {
    isInternalChange.value = false;
    return;
  }

  const newState = JSON.stringify(newVal);
  if (history.value[historyIndex.value] === newState) return;

  // 1. Gérer l'historique
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  history.value.push(newState);
  historyIndex.value++;

  // 2. Déclencher l'auto-save
  const syncedTree = await autoSave(newVal, pageRevisionId.value);
  if (syncedTree) {
    // Vérifier si l'état actuel est toujours le même que celui envoyé (newState) 
    // pour éviter d'écraser des changements (comme une suppression) survenus pendant la sauvegarde
    if (JSON.stringify(pageTree.value) === newState) {
      isInternalChange.value = true;
      pageTree.value = syncedTree;
    }
  }
}, { deep: true });


const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    isInternalChange.value = true;
    pageTree.value = JSON.parse(history.value[historyIndex.value]!);
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    isInternalChange.value = true;
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
        
        <!-- Indicateur de sauvegarde -->
        <div class="flex items-center px-2 text-xs text-gray-400 border-r border-gray-700 mr-1" title="Statut de sauvegarde">
             <RefreshCw v-if="isSaving" class="h-3 w-3 animate-spin text-blue-400" />
             <Cloud v-else class="h-3 w-3 text-green-400" />
        </div>

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
