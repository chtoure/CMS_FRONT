<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, computed, inject, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-vue-next';
import SectionBuilder from '../../components/builder/SectionBuilder.vue';
import BlocRender from '../../components/builder/BlocRender.vue';
import ResizerWrapper from '../../components/builder/ResizerWrapper.vue';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import { findComponentById } from '../../lib/treeUtils';

// Injection de l'état global
const builderState = inject<{
  pageTree: { value: AnySectionInstance[] };
  libraryTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  builderMode: { value: 'page' | 'library' };
  selectComponent: (id: string | null) => void;
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
}>('builderState');

// Fallback pour la sécurité
const pageTree = computed({
  get: () => builderState?.pageTree.value || [],
  set: (val) => { if (builderState) builderState.pageTree.value = val; }
});

const selectComponent = (id: string | null) => {
  builderState?.selectComponent(id);
};

const selectedElement = computed(() => {
  if (!builderState?.selectedId.value) return null;
  
  const tree = builderState.builderMode.value === 'page' 
    ? builderState.pageTree.value 
    : builderState.libraryTree?.value;

  if (!tree) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return findComponentById(tree as any, builderState.selectedId.value);
});

// --- Logique de Zoom ---
const scale = ref(1);
const zoomIn = () => { if (scale.value < 2) scale.value += 0.1; };
const zoomOut = () => { if (scale.value > 0.5) scale.value -= 0.1; };
const resetZoom = () => { scale.value = 1; };

const CANVAS_BASE_WIDTH = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const widths = {
    default: 390,
    sm: 640,
    md: 768,
    lg: 1280
  };
  return widths[bp];
});

const CANVAS_BASE_HEIGHT = 1000;

const canvasStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'top center',
}));

// Dimensions "physiques" occupées par le zoom pour forcer le scroll
const scaledAreaStyle = computed(() => ({
  width: `${CANVAS_BASE_WIDTH.value * scale.value}px`,
  height: `${CANVAS_BASE_HEIGHT * scale.value}px`,
}));

// Désélectionner quand on clique dans le vide du canevas
const deselect = () => {
  selectComponent(null);
};

watch(() => pageTree.value, (newVal) => {
  // Uniquement en mode PAGE : forcer les composants dans des sections
  if (builderState?.builderMode.value !== 'page') return;

  const orphanComponents = newVal.filter((item: any) => 'tag' in item);
  
  if (orphanComponents.length > 0) {
    const newTree = [...newVal] as any[];
    orphanComponents.forEach(comp => {
      const idx = newTree.indexOf(comp);
      if (idx !== -1) {
        // Est-ce qu'on a une section vide ?
        const emptySection = newTree.find(s => !('tag' in s) && s.children.length === 0);
        
        if (emptySection) {
          emptySection.children.push(comp);
          newTree.splice(idx, 1);
        } else {
          // Créer une nouvelle section
          const newSection: AnySectionInstance = {
            id: crypto.randomUUID(),
            order: newTree.length,
            family: 'section',
            styles: {},
            children: [comp as unknown as AnyComponentInstance]
          };
          newTree.splice(idx, 1, newSection);
        }
      }
    });
    pageTree.value = newTree as AnySectionInstance[];
  }
  
  // console.log('PageTree updated:', JSON.parse(JSON.stringify(newVal)));
}, { deep: true });
</script>

<template>
  <div class="h-full w-full bg-white relative flex flex-col overflow-hidden" @click="deselect">
    
    <!-- Contrôles de Zoom -->
    <div @click.stop class="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-builder-bar-background border border-border px-3 py-1 rounded shadow-2xl">
      <button @click="zoomOut" class="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
        <ZoomOut class="w-4 h-4" />
      </button>
      <span class="text-xs font-mono text-gray-300 min-w-[40px] text-center">
        {{ Math.round(scale * 100) }}%
      </span>
      <button @click="zoomIn" class="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
        <ZoomIn class="w-4 h-4" />
      </button>
      <div class="w-[1px] h-4 bg-border mx-1"></div>
      <button @click="resetZoom" class="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
        <Maximize class="w-4 h-4" />
      </button>
    </div>

    <!-- Zone de travail avec Overflow -->
    <div class="flex-1 overflow-auto custom-scrollbar p-10 md:p-20">
      
      <!-- Fil d'Ariane / Breadcrumbs (Descendu pour éviter le conflit) -->
      <div 
        class="absolute top-10 left-1/2 -translate-x-1/2 z-40 bg-builder-bar-background backdrop-blur-sm border border-border px-3 py-1 rounded shadow-lg flex items-center gap-2 text-[9px] tracking-wider font-bold"
      >
        <span class="text-gray-500">Projet</span>
        <span class="text-gray-700">/</span>
        <span class="text-gray-300">
          {{ builderState?.builderMode.value === 'page' ? 'Page Actuelle' : 'Bibliothèque' }}
        </span>
        <template v-if="selectedElement">
          <span class="text-gray-700">/</span>
          <span class="text-primary">{{ 'name' in selectedElement ? selectedElement.name : 'Section' }}</span>
        </template>

      </div>

      <!-- Conteneur global de défilement -->
      <div 
        class="w-fit min-w-full min-h-full flex items-start transition-colors duration-500"
        :class="builderState?.builderMode.value === 'library' ? '' : ''"
      >
        
        <!-- Cette div a la taille REELLE occupée par le zoom (width * scale) -->
        <!-- On utilise margin-inline auto pour centrer tout en permettant le scroll -->
        <div :style="scaledAreaStyle" class="relative mx-auto flex justify-center">
          
          <div 
            class="device-wrapper absolute top-0 bg-white border border-dashed border-border origin-top transition-all duration-500 ease-in-out box-border"
            :style="{ 
               ...canvasStyle,
               width: `${CANVAS_BASE_WIDTH}px`
            }"
            @click.stop
          >
              <div 
                v-if="pageTree.length === 0" 
                class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none z-10"
              >
                <MousePointer2 class="w-12 h-12 mb-2 opacity-10" />
                <p class="text-xs uppercase tracking-widest font-bold">Canevas Vide</p>
              </div>

              <VueDraggable
                v-if="builderState?.builderMode.value === 'page'"
                v-model="pageTree"
                :group="{ name: 'blocks', put: true, pull: true }"
                :animation="150"
                ghost-class="ghost-preview"
                class="w-full min-h-[1000px] relative flex flex-col p-0 z-0 bg-white"
              >
                <div 
                  v-for="(section, index) in pageTree" 
                  :key="section.id"
                  class="w-full"
                >
                  <SectionBuilder
                    :section="section"
                    :active="builderState?.selectedId.value === section.id"
                    @select="selectComponent"
                    @update:section="(newVal: AnySectionInstance) => {
                      const newTree = [...pageTree];
                      newTree[index] = newVal;
                      pageTree = newTree;
                    }"
                  />
                </div>
              </VueDraggable>

              <!-- Mode Bibliothèque (SANS Sections) -->
              <VueDraggable
                v-else
                v-model="builderState!.libraryTree.value"
                :group="{ name: 'blocks', put: true, pull: true }"
                :animation="150"
                ghost-class="ghost-preview"
                class="w-full min-h-[1000px] relative flex flex-col p-8 z-0 bg-transparent items-center"
              >
                 <div 
                   v-for="(element, index) in builderState!.libraryTree.value" 
                   :key="element.id"
                   class="relative transition-all outline-none mb-12 w-full max-w-4xl bg-white/5 p-8 rounded-xl border border-white/10 group/lib-item"
                 >
                    <!-- Label du composant custom -->
                    <div class="absolute -top-4 left-4 bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow-lg opacity-80 group-hover/lib-item:opacity-100 transition-opacity">
                      MODÈLE : {{ element.name }}
                    </div>

                    <ResizerWrapper
                      :element="element"
                      :active="builderState?.selectedId.value === element.id" 
                      @click.stop="builderState?.selectComponent(element.id)"
                      @update:element="(newVal: AnyComponentInstance) => {
                        const newTree = [...builderState!.libraryTree.value];
                        newTree[index] = newVal;
                        builderState!.libraryTree.value = newTree;
                      }"
                    >
                      <BlocRender
                        :element="element" 
                        @update:element="(newVal: AnyComponentInstance) => {
                          const newTree = [...builderState!.libraryTree.value];
                          newTree[index] = newVal;
                          builderState!.libraryTree.value = newTree;
                        }"
                      />
                    </ResizerWrapper>
                 </div>
              </VueDraggable>
          </div>
          
          <!-- Indicateur visuel du Mode Isolation (Library) -->
          <div 
            v-if="builderState?.builderMode.value === 'library'"
            class="absolute -inset-10 pointer-events-none"
          >
             <div class="absolute top-2 right-4 text-[10px] text-primary opacity-50 font-mono">LABS / ISOLATION MODE</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-wrapper {
  /* Supprimé au profit du style dynamique */
}
</style>