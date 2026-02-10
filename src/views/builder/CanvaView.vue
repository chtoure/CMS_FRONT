<script lang="ts" setup>
import { ref, computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { type AnyComponentInstance } from '../../type/component';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-vue-next';
import BlocRender from '../../components/builder/BlocRender.vue';

const pageTree = ref<AnyComponentInstance[]>([]);
const selectedId = ref<string | null>(null);

// --- Logique de Zoom ---
const scale = ref(1);
const zoomIn = () => { if (scale.value < 2) scale.value += 0.1; };
const zoomOut = () => { if (scale.value > 0.5) scale.value -= 0.1; };
const resetZoom = () => { scale.value = 1; };

const canvasStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'top center',
  transition: 'transform 0.2s ease-out'
}));

const selectComponent = (id: string) => {
  selectedId.value = id;
};

// Désélectionner quand on clique dans le vide du canevas
const deselect = () => {
  selectedId.value = null;
};
</script>

<template>
  <div class="h-full w-full bg-builder-background relative flex flex-col overflow-hidden" @click="deselect">
    
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

    <div class="flex-1 overflow-auto custom-scrollbar bg-[radial-gradient(#2e2e33_1px,transparent_1px)] [background-size:24px_24px]">
      
      <div 
        class="min-h-full py-20 flex justify-center items-start"
        :style="canvasStyle"
      >
        <div class="device-wrapper shadow-2xl overflow-hidden rounded-sm bg-white">
            <div class="w-[800px] bg-gray-100 border-b border-gray-200 py-2 px-4 flex gap-1.5">
                <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                <div class="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>

            <VueDraggable
              v-model="pageTree"
              group="blocks"
              :animation="150"
              ghost-class="ghost-preview"
              class="w-[800px] min-h-[1000px] relative flex flex-col p-0"
            >
              <div 
                v-if="pageTree.length === 0" 
                class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none"
              >
                <MousePointer2 class="w-12 h-12 mb-2 opacity-10" />
                <p class="text-xs uppercase tracking-widest font-bold">Canevas Vide</p>
              </div>

              <div 
                v-for="(element, index) in pageTree" 
                :key="element.id"
                @click.stop="selectComponent(element.id)"
                class="relative group/item border border-transparent transition-all outline-none"
                :class="{ 'ring-2 ring-primary ring-inset z-10': selectedId === element.id }"
              >
                <div 
                  v-if="selectedId === element.id"
                  class="absolute -top-5 left-0 bg-primary text-white text-[9px] px-2 py-0.5 rounded-t-sm font-bold uppercase z-20"
                >
                  {{ element.name }}
                </div>

                <BlocRender
                  :element="element" 
                  @update:element="(newVal: AnyComponentInstance) => pageTree[index] = newVal"
                />
              </div>
            </VueDraggable>
        </div>
      </div>
    </div>
  </div>
</template>