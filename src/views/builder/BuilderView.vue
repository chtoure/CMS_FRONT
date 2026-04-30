<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { generateUUID } from '@/lib/utils';

import { ref, watch, provide, computed } from 'vue';
import CanvaView from './CanvaView.vue';
import ComponentView from './ComponentView.vue';
import PropritiesView from './PropritiesView.vue';
import { X, Menu, Undo, Redo, RefreshCw, Cloud, Monitor, Tablet, Smartphone } from 'lucide-vue-next';
import Button from '../../components/ui/button/Button.vue';
import type { AnyComponentInstance } from '../../type/component';
import { useQueryClient } from '@tanstack/vue-query';
import { useBlockTemplate } from '../../hook/bloc-template';
import type { AnySectionInstance } from '../../type/section';
import { useRouter } from 'vue-router';
import { findComponentById, removeFromTree, insertIntoTree, moveInTree } from '../../lib/treeUtils';
import { FAMILY_CAPABILITIES } from '../../type/component';

const router = useRouter();
const queryClient = useQueryClient();

const pageRevisionId = computed(() => {
    return (router.currentRoute.value.params.id as unknown) as number
})

const showComponentView = ref(true);
const showPropertiesView = ref(false);

const pageTree = ref<AnySectionInstance[]>([]);
const libraryTree = ref<AnyComponentInstance[]>([]); // Arbre pour les composants customs (sans sections)
const selectedId = ref<string | null>(null);
const selectedSectionId = ref<string | null>(null);
const builderMode = ref<'page' | 'library'>('page');
const currentBreakpoint = ref<'default' | 'sm' | 'md' | 'lg'>('default');
const isDragging = ref(false);
const xRayMode = ref(false);
const toggleStates = ref<Record<string, boolean>>({});
const cmsCache = ref<Record<string, any>>({});

const toggleVisibility = (id: string | number) => {
  const key = id.toString();
  const wasVisible = toggleStates.value[key] !== false;

  // On crée un nouvel objet pour forcer la réactivité de Vue
  toggleStates.value = {
    ...toggleStates.value,
    [key]: !wasVisible
  };

  console.log(`[TOGGLE ACTION] Target: ${key} | Was Visible: ${wasVisible} | Now Visible: ${!wasVisible}`);
};

const isVisible = (id: string, backendId?: number | null) => {
  const isLocalHidden = toggleStates.value[id] === false;
  const isBackendHidden = backendId != null && toggleStates.value[backendId.toString()] === false;

  const finalVisible = !isLocalHidden && !isBackendHidden;
  return finalVisible;
};

const clipboard = ref<AnyComponentInstance | null>(null);

const selectComponent = (id: string | null) => {
  if (clipboard.value) {
    if (!id) {
       // Clic sur le canvas vide = ajout à la racine
       const item = JSON.parse(JSON.stringify(clipboard.value));
       if (builderMode.value === 'page') {
         let newEntry: any = item;
         if ('tag' in item) {
           newEntry = {
             id: generateUUID(),
             order: pageTree.value.length,
             family: 'section',
             styles: {},
             children: [item]
           };
         }
         pageTree.value = insertIntoTree(pageTree.value, null, newEntry, 'append') as AnySectionInstance[];
       } else {
         libraryTree.value = insertIntoTree(libraryTree.value, null, item, 'append') as AnyComponentInstance[];
       }
       clipboard.value = null;
       return;
    }

    const tree = builderMode.value === 'page' ? pageTree.value : libraryTree.value;
    const target = findComponentById(tree, id);
    if (!target) return;

    const item = JSON.parse(JSON.stringify(clipboard.value));
    const isContainer = target.family === 'section' || FAMILY_CAPABILITIES[target.family]?.canHaveChildren;

    if ('family' in item && item.family === 'section' && target.family === 'section') {
        alert("Impossible d'insérer une section dans un autre composant.");
        return;
    }

    if (builderMode.value === 'page') {
       pageTree.value = insertIntoTree(pageTree.value, id, item, isContainer ? 'append' : 'after') as AnySectionInstance[];
    } else {
       libraryTree.value = insertIntoTree(libraryTree.value, id, item, isContainer ? 'append' : 'after') as AnyComponentInstance[];
    }

    clipboard.value = null;
    return;
  }

  selectedId.value = id;
};

const setClipboard = (item: AnyComponentInstance | null) => {
  clipboard.value = item ? JSON.parse(JSON.stringify(item)) : null;
};
const clearClipboard = () => {
  clipboard.value = null;
};

const moveComponent = (id: string, direction: 'up' | 'down') => {
  if (builderMode.value === 'page') {
    pageTree.value = moveInTree(pageTree.value, id, direction) as AnySectionInstance[];
  } else {
    libraryTree.value = moveInTree(libraryTree.value, id, direction) as AnyComponentInstance[];
  }
};

const setIsDragging = (val: boolean) => {
  isDragging.value = val;
};

const deleteComponent = async (id: string) => {
  let blocTemplateIdToDelete: number | null = null;
  let sectionIdToDelete: number | null = null;
  let isSection = false;

  // Trouver le nœud pour identifier les IDs backend
  const tree = [...pageTree.value, ...libraryTree.value];
  const node = findComponentById(tree as any[], id);

  if (node) {
    if ('sectionId' in node && node.sectionId && node.family === 'section') {
      sectionIdToDelete = node.sectionId;
      isSection = true;
    } else if ('blocTemplateId' in node && node.blocTemplateId) {
      blocTemplateIdToDelete = node.blocTemplateId;
    }
  }

  // Suppression locale
  if (builderMode.value === 'page') {
    pageTree.value = removeFromTree(pageTree.value, id) as AnySectionInstance[];
  } else {
    libraryTree.value = removeFromTree(libraryTree.value, id) as AnyComponentInstance[];
  }

  // Désélectionner après suppression
  selectComponent(null);
  selectedSectionId.value = null;

  // Appels Backend
  try {
    if (isSection && sectionIdToDelete) {
      await useDeleteSection(sectionIdToDelete);
    } else if (blocTemplateIdToDelete) {
      await deleteBlockTemplateMut.mutateAsync(blocTemplateIdToDelete);
    }
  } catch (error) {
    console.error('Failed to delete from backend', error);
  }
};

// Automatisme de la barre de propriétés
watch(selectedId, (newId) => {
  showPropertiesView.value = !!newId;
});

// Gestion de la suppression via touche clavier
import { onMounted, onUnmounted } from 'vue';

// Clone profond avec nouveaux IDs pour la copie (même logique que PropritiesView)
const deepCloneWithNewIds = (node: any): any => {
  return {
    ...node,
    id: generateUUID(),
    blocTemplateId: undefined,
    modelId: undefined,
    children: node.children ? node.children.map((child: any) => deepCloneWithNewIds(child)) : []
  };
};

const handleKeyDown = (e: KeyboardEvent) => {
  // Vérifier si l'utilisateur n'est pas en train d'écrire
  const activeElement = document.activeElement;
  const isInput = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.getAttribute('contenteditable') === 'true'
  );

  if (isInput) return;

  // Supprimer (Delete / Backspace)
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) {
      deleteComponent(selectedId.value);
    }
    return;
  }

  // Ctrl+C : Copier le composant sélectionné
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    if (!selectedId.value) return;
    const tree = builderMode.value === 'page' ? pageTree.value : libraryTree.value;
    const node = findComponentById(tree as any[], selectedId.value);
    if (!node || !('tag' in node)) return;
    e.preventDefault();
    const clone = deepCloneWithNewIds(JSON.parse(JSON.stringify(node)));
    setClipboard(clone);
    return;
  }

  // Ctrl+X : Couper le composant sélectionné
  if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
    if (!selectedId.value) return;
    const tree = builderMode.value === 'page' ? pageTree.value : libraryTree.value;
    const node = findComponentById(tree as any[], selectedId.value);
    if (!node || !('tag' in node)) return;
    e.preventDefault();
    // On régénère les IDs pour que le backend crée de nouveaux nœuds au collage.
    // (les anciens sont supprimés par deleteComponent → ils n'existent plus en DB)
    const clone = deepCloneWithNewIds(JSON.parse(JSON.stringify(node)));
    deleteComponent(selectedId.value);
    setClipboard(clone);
    return;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});


const { useAutoSave, useAutoSaveLibrary, isSaving, fetchAll, useDeleteBlockTemplate, useDeleteSection, fetchCustomTree } = useBlockTemplate();
const autoSaveMut = useAutoSave();
const autoSaveLibraryMut = useAutoSaveLibrary();
const deleteBlockTemplateMut = useDeleteBlockTemplate();

// --- Gestion de l'historique et de la Sauvegarde ---
const history = ref<string[]>([JSON.stringify(pageTree.value)]);
const historyIndex = ref(0);
const isInternalChange = ref(false);

/**
 * Merge uniquement les blocTemplateId depuis l'arbre synced vers l'arbre courant.
 * Cela permet de propager les IDs backend des nouveaux noeuds
 * sans écraser les données/styles de l'arbre courant.
 */
const mergeBlocTemplateIds = (
  currentNodes: (AnyComponentInstance | AnySectionInstance)[],
  syncedNodes: (AnyComponentInstance | AnySectionInstance)[]
) => {
  if (!currentNodes || !syncedNodes) return;

  const currentById = new Map();
  const unmatchedCurrents: any[] = [];

  for(const cur of currentNodes) {
     if('blocTemplateId' in cur && cur.blocTemplateId) {
        currentById.set(cur.blocTemplateId, cur);
     } else {
        unmatchedCurrents.push(cur);
     }
  }

  let unmatchedIndex = 0;

  for (let i = 0; i < syncedNodes.length; i++) {
    const synced = syncedNodes[i] as any;
    if (!synced) continue;

    let current = null;

    if ('blocTemplateId' in synced && synced.blocTemplateId && currentById.has(synced.blocTemplateId)) {
       current = currentById.get(synced.blocTemplateId);
    } else if (unmatchedIndex < unmatchedCurrents.length) {
       current = unmatchedCurrents[unmatchedIndex];
       unmatchedIndex++;
    }

    if (!current) continue;

    // Propager le blocTemplateId si ce noeud vient d'être créé
    if (!current.blocTemplateId && synced.blocTemplateId) {
      current.blocTemplateId = synced.blocTemplateId;
    }
    // Même chose pour sectionId (si c'est une section)
    if (!current.sectionId && synced.sectionId) {
      current.sectionId = synced.sectionId;
    }

    // Propager récursivement dans les enfants
    if (current.children && synced.children) {
      mergeBlocTemplateIds(current.children, synced.children);
    }
  }
};

const loadInitialData = async () => {
  if (!pageRevisionId.value) return;
  isInternalChange.value = true;

  // Charger la page par défaut
  const initialTree = await fetchAll(pageRevisionId.value);
  pageTree.value = initialTree;

  // Charger les composants de la bibliothèque
  const customs = await fetchCustomTree();
  libraryTree.value = customs as any;

  history.value = [JSON.stringify(initialTree)];
  historyIndex.value = 0;
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  loadInitialData();
});

// Watcher pour le Mode Page
watch(pageTree, async (newVal) => {
  if (builderMode.value !== 'page' || isInternalChange.value) {
    isInternalChange.value = false;
    return;
  }

  const newState = JSON.stringify(newVal);
  if (history.value[historyIndex.value] === newState) return;

  history.value = [...history.value.slice(0, historyIndex.value + 1), newState];
  historyIndex.value++;

  const syncedTree = await autoSaveMut.mutateAsync({ sections: newVal, pageRevisionId: pageRevisionId.value });
  if (syncedTree) {
    isInternalChange.value = true;
    const jsonBefore = JSON.stringify(pageTree.value);
    mergeBlocTemplateIds(pageTree.value, syncedTree);
    const jsonAfter = JSON.stringify(pageTree.value);

    if (history.value[historyIndex.value] !== jsonAfter) {
      history.value[historyIndex.value] = jsonAfter;
    }

    // Si mergeBlocTemplateIds n'a rien changé, le watcher profond ne se redéclenchera
    // pas pour remettre isInternalChange à false. On le fait manuellement pour éviter
    // de bloquer la prochaine sauvegarde (ex: après un coller).
    if (jsonBefore === jsonAfter) {
      isInternalChange.value = false;
    }
  }
}, { deep: true });

// Watcher pour le Mode Bibliothèque
watch(libraryTree, async (newVal) => {
  if (builderMode.value !== 'library' || isInternalChange.value) {
    isInternalChange.value = false;
    return;
  }

  const newState = JSON.stringify(newVal);
  if (history.value[historyIndex.value] === newState) return;

  history.value = [...history.value.slice(0, historyIndex.value + 1), newState];
  historyIndex.value++;

  const syncedTree = await autoSaveLibraryMut.mutateAsync(newVal);
  if (syncedTree) {
    const jsonBefore = JSON.stringify(libraryTree.value);
    mergeBlocTemplateIds(libraryTree.value, syncedTree);
    const jsonAfter = JSON.stringify(libraryTree.value);

    if (jsonBefore !== jsonAfter) {
      history.value[historyIndex.value] = jsonAfter;
    }
    // Invalider le cache pour que le Panel Latéral (Sidebar) ait la dernière version du Modèle
    queryClient.invalidateQueries({ queryKey: ['builder-bloc-templates-custom'] });
  }
}, { deep: true });

// Réinitialiser l'historique lors du changement de mode
watch(builderMode, async (newMode) => {
  isInternalChange.value = true;

  if (newMode === 'library') {
    const customs = await fetchCustomTree();
    libraryTree.value = customs as any;
  } else if (newMode === 'page') {
    // Recharger la page depuis le Backend pour hériter des modifications (styles) faites sur les modèles dans la Bibliothèque
    if (pageRevisionId.value) {
      const initialTree = await fetchAll(pageRevisionId.value);
      pageTree.value = initialTree;
    }
  }

  const targetTree = newMode === 'page' ? pageTree.value : libraryTree.value;
  history.value = [JSON.stringify(targetTree)];
  historyIndex.value = 0;
  selectComponent(null);
});

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    isInternalChange.value = true;
    const state = JSON.parse(history.value[historyIndex.value]!);
    if (builderMode.value === 'page') pageTree.value = state;
    else libraryTree.value = state;
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    isInternalChange.value = true;
    const state = JSON.parse(history.value[historyIndex.value]!);
    if (builderMode.value === 'page') pageTree.value = state;
    else libraryTree.value = state;
  }
};

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);

provide('isBuilder', true);
provide('builderState', {
  pageTree,
  libraryTree,
  selectedId,
  builderMode,
  selectComponent,
  deleteComponent,
  undo,
  redo,
  canUndo,
  canRedo,
  currentBreakpoint,
  clipboard,
  setClipboard,
  clearClipboard,
  moveComponent,
  isDragging,
  setIsDragging,
  xRayMode,
  toggleStates,
  toggleVisibility,
  isVisible,
  cmsCache
});
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-builder-background">

    <main
      class="absolute inset-y-0 z-0 flex"
      :style="{
        left: showComponentView ? '16rem' : '0',
        right: showPropertiesView ? '16rem' : '0'
      }"
    >
      <!-- Barre d'outils (Mode & Breakpoint) -->
      <div class="absolute top-0.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 scale-90">

        <div class="p-1 scale-90 bg-builder-bar-background backdrop-blur-sm border border-border px-2 py-1 rounded shadow-lg flex items-center gap-2 text-[9px] tracking-wider font-bold">
          <button
            @click="xRayMode = !xRayMode"
            class="px-3 py-1 rounded flex items-center gap-1"
            :class="xRayMode ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50' : 'text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'"
            title="Mode Structure (Rayon X) pour mieux voir les conteneurs imbriqués"
          >
            <!-- Icône d'arborescence simple -->
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            STRUCTURE
          </button>
        </div>

        <div class="p-1 scale-90 bg-builder-bar-background backdrop-blur-sm border border-border px-2 py-1 rounded shadow-lg flex items-center gap-2 text-[9px] tracking-wider font-bold">
          <button
            @click="builderMode = 'page'"
            class="px-4 py-1 rounded text-[10px] font-bold"
            :class="builderMode === 'page' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'"
          >
            Page
          </button>
          <button
            @click="builderMode = 'library'"
            class="px-4 py-1 rounded text-[10px] font-bold"
            :class="builderMode === 'library' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'"
          >
            Bibliothèque
          </button>
        </div>

        <!-- Séparateur -->
        <!-- <div class="w-[1px] h-4 bg-border/50"></div> -->

        <div class="scale-90 bg-builder-bar-background backdrop-blur-sm border border-border px-3 p-2 rounded shadow-lg flex items-center gap-2 text-[9px] tracking-wider font-bold">

          <button
            @click="currentBreakpoint = 'default'"
            :class="currentBreakpoint === 'default' ? 'text-primary' : 'text-gray-500 hover:opacity-70'"
            title="Mobile (par défaut)"
          >
            <Smartphone class="h-4 w-4" />
          </button>
          <button
            @click="currentBreakpoint = 'sm'"
            :class="currentBreakpoint === 'sm' ? 'text-primary' : 'text-gray-500 hover:opacity-70'"
            title="Tablette (SM)"
          >
            <Tablet class="h-4 w-4" />
          </button>
          <button
            @click="currentBreakpoint = 'md'"
            :class="currentBreakpoint === 'md' ? 'text-primary' : 'text-gray-500 hover:opacity-70'"
            title="Tablette large (MD)"
          >
            <div class="relative">
              <Tablet class="h-4 w-4" />
              <div class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-gray-500 rounded-full border border-builder-bar-background"></div>
            </div>
          </button>
          <button
            @click="currentBreakpoint = 'lg'"
            :class="currentBreakpoint === 'lg' ? 'text-primary' : 'text-gray-500 hover:opacity-70'"
            title="Desktop (LG)"
          >
            <Monitor class="h-4 w-4" />
          </button>
        </div>
      </div>

      <CanvaView />
    </main>

    <!-- Sidebar Composants -->
    <aside
      class="absolute top-0 left-0 h-full w-64 bg-builder-bar-background border-r border-border z-10 transform shadow-xl custom-scrollbar"
      :class="showComponentView ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="font-bold text-builder-bar-text tracking-wide">Composants</h2>
        <Button @click="showComponentView = false" class="text-white !rounded">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-y-auto w-full bg-builder-bar-background px-4 py-2">
        <ComponentView />
      </div>
    </aside>

    <!-- Sidebar Propriétés -->
    <aside
      class="absolute top-0 right-0 h-full w-64 bg-builder-bar-background border-l border-border z-10 transform shadow-xl"
      :class="showPropertiesView ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="font-bold text-builder-bar-text tracking-wide">Propriétés</h2>
        <Button @click="selectComponent(null)" class="text-white !rounded">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-y-auto">
        <PropritiesView />
      </div>
    </aside>

    <!-- Boutons Flottants (Menu & Undo/Redo) -->
    <div class="absolute top-4 left-4 z-20 flex items-center gap-2" :class="{ 'translate-x-64': showComponentView }">
       <Button
        v-if="!showComponentView"
        @click="showComponentView = true"
        class="flex items-center justify-center p-2 text-white shadow-lg !rounded"
        title="Ouvrir les composants"
      >
        <Menu class="h-5 w-5" />
      </Button>

      <!-- Groupe Undo/Redo -->
      <div class="flex items-center gap-1 bg-builder-bar-background rounded shadow-lg p-1 border border-border">

        <!-- Indicateur de sauvegarde -->
        <div class="flex items-center px-2 text-xs text-gray-400 border-r border-gray-700 mr-1" title="Statut de sauvegarde">
             <RefreshCw v-if="isSaving" class="h-3 w-3 animate-spin text-blue-400" />
             <Cloud v-else class="h-3 w-3 text-green-400" />
        </div>

        <Button
          @click="undo"
          :disabled="!canUndo"
          class="p-1.5 text-white hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Annuler (Ctrl+Z)"
        >
          <Undo class="h-4 w-4" />
        </Button>
        <Button
          @click="redo"
          :disabled="!canRedo"
          class="p-1.5 text-white hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
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
