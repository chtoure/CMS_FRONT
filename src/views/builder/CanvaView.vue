<script lang="ts" setup>
import { ref, computed, inject, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { type AnyComponentInstance } from '../../type/component';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-vue-next';
import BlocRender from '../../components/builder/BlocRender.vue';

// Injection de l'état global
const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  selectComponent: (id: string | null) => void;
}>('builderState');

// Fallback pour la sécurité
const pageTree = computed({
  get: () => builderState?.pageTree.value || [],
  set: (val) => { if (builderState) builderState.pageTree.value = val; }
});

const selectComponent = (id: string | null) => {
  builderState?.selectComponent(id);
};

// --- Logique de Zoom ---
const scale = ref(1);
const zoomIn = () => { if (scale.value < 2) scale.value += 0.1; };
const zoomOut = () => { if (scale.value > 0.5) scale.value -= 0.1; };
const resetZoom = () => { scale.value = 1; };

const CANVAS_BASE_WIDTH = 800;
const CANVAS_BASE_HEIGHT = 1000;

const canvasStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'top center',
}));

// Dimensions "physiques" occupées par le zoom pour forcer le scroll
const scaledAreaStyle = computed(() => ({
  width: `${CANVAS_BASE_WIDTH * scale.value}px`,
  height: `${CANVAS_BASE_HEIGHT * scale.value}px`,
}));

// Désélectionner quand on clique dans le vide du canevas
const deselect = () => {
  selectComponent(null);
};

watch(() => pageTree.value, (newVal) => {
  console.log('PageTree updated:', JSON.parse(JSON.stringify(newVal)));
}, { deep: true });
</script>

<template>
  <div class="h-full w-full bg-builder-background relative flex flex-col overflow-hidden" @click="deselect">
    
    <!-- Contrôles de Zoom -->
    <div @click.stop class="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-builder-bar-background border border-border px-3 py-2 rounded-full shadow-2xl">
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
      
      <!-- Conteneur global de défilement -->
      <div class="w-fit min-w-full min-h-full flex items-start">
        
        <!-- Cette div a la taille REELLE occupée par le zoom (width * scale) -->
        <!-- On utilise margin-inline auto pour centrer tout en permettant le scroll -->
        <div :style="scaledAreaStyle" class="relative mx-auto flex justify-center">
          
          <div 
            class="device-wrapper absolute top-0 bg-white border border-dashed border-border origin-top transition-transform duration-200 ease-out box-border"
            :style="canvasStyle"
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
                v-model="pageTree"
                :group="{ name: 'blocks', put: true }"
                :animation="150"
                ghost-class="ghost-preview"
                class="w-full min-h-[1000px] relative flex flex-col p-0 z-0 bg-white"
              >
                <div 
                  v-for="(element, index) in pageTree" 
                  :key="element.id"
                  class="relative transition-all outline-none"
                >
                  <BlocRender
                    :element="element" 
                    @update:element="(newVal: AnyComponentInstance) => {
                      const newTree = [...pageTree];
                      newTree[index] = newVal;
                      pageTree = newTree;
                    }"
                  />
                </div>
              </VueDraggable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-wrapper {
  width: 800px;
}
</style>