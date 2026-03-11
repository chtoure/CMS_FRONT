<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, inject } from 'vue';
import type { AnyComponentInstance } from '../../type/component';

const props = defineProps<{
  element: AnyComponentInstance;
  active: boolean;
}>();

const emit = defineEmits(['update:element', 'select']);

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
  isDragging?: { value: boolean }
}>('builderState');

const resizableRef = ref<HTMLElement | null>(null);
const isResizing = ref(false);

const startResize = (e: MouseEvent, direction: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!resizableRef.value || !builderState) return;
  
  isResizing.value = true;
  const bp = builderState.currentBreakpoint.value;
  const startX = e.clientX;
  const startY = e.clientY;
  
  const rect = resizableRef.value.getBoundingClientRect();
  const startWidth = rect.width;
  const startHeight = rect.height;
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX;
    const deltaY = moveEvent.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    if (direction.includes('e')) newWidth = startWidth + deltaX;
    if (direction.includes('w')) newWidth = startWidth - deltaX;
    if (direction.includes('s')) newHeight = startHeight + deltaY;
    if (direction.includes('n')) newHeight = startHeight - deltaY;
    
    // Minimum dimensions
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);
    
    // Update styles responsively
    const newStyles = { ...props.element.styles } as any;
    
    const updateResponsiveStyle = (key: string, value: number) => {
      const currentVal = newStyles[key];
      if (typeof currentVal === 'object' && currentVal !== null && 'default' in currentVal) {
        newStyles[key] = { ...currentVal, [bp]: value };
      } else if (bp === 'default') {
        newStyles[key] = value;
      } else {
        newStyles[key] = { default: currentVal, [bp]: value };
      }
    };

    if (direction.includes('e') || direction.includes('w')) {
      updateResponsiveStyle('width', Math.round(newWidth));
    }
    if (direction.includes('s') || direction.includes('n')) {
      updateResponsiveStyle('height', Math.round(newHeight));
    }
    
    emit('update:element', { ...props.element, styles: newStyles });
  };
  
  const onMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

</script>

<template>
  <div 
    ref="resizableRef"
    class="relative w-full h-full group/resizer" 
    :class="{ 
      'ring-2 ring-inset ring-blue-500': active,
      'rescaling': isResizing
    }"
  >
    <div class="w-full h-full overflow-hidden">
      <slot />
    </div>
    
    <!-- Resize Handles - Visible quand actif -->
    <template v-if="active">
      <div 
        class="absolute inset-0 z-40 transition-all pointer-events-none"
        :class="{ 
          'opacity-0': builderState?.isDragging?.value
        }"
      >
      <!-- Coins (8px) -->
      <div 
        class="resize-handle resize-handle-nw cursor-nw-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'nw')" 
        title="Redimensionner (haut-gauche)"
      />
      <div 
        class="resize-handle resize-handle-ne cursor-ne-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'ne')" 
        title="Redimensionner (haut-droit)"
      />
      <div 
        class="resize-handle resize-handle-sw cursor-sw-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'sw')" 
        title="Redimensionner (bas-gauche)"
      />
      <div 
        class="resize-handle resize-handle-se cursor-se-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'se')" 
        title="Redimensionner (bas-droit)"
      />
      
      <!-- Côtés (6px height/width) -->
      <div 
        class="resize-handle-side resize-handle-n cursor-n-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'n')" 
        title="Redimensionner haut"
      />
      <div 
        class="resize-handle-side resize-handle-s cursor-s-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 's')" 
        title="Redimensionner bas"
      />
      <div 
        class="resize-handle-side resize-handle-w cursor-w-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'w')" 
        title="Redimensionner gauche"
      />
      <div 
        class="resize-handle-side resize-handle-e cursor-e-resize pointer-events-auto" 
        @mousedown.stop="startResize($event, 'e')" 
        title="Redimensionner droit"
      />
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Handle principal aux coins */
.resize-handle {
  @apply absolute w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full z-50 transition-all shadow-lg;
  @apply hover:scale-125 hover:bg-blue-500/50 active:bg-blue-500;
}

.resize-handle-nw { @apply top-[-5px] left-[-5px]; }
.resize-handle-ne { @apply top-[-5px] right-[-5px]; }
.resize-handle-sw { @apply bottom-[-5px] left-[-5px]; }
.resize-handle-se { @apply bottom-[-5px] right-[-5px]; }

/* Handles latéraux */
.resize-handle-side {
  @apply absolute bg-blue-500 z-40 transition-all shadow-md;
  @apply hover:bg-blue-600 active:bg-blue-700;
}

.resize-handle-n { @apply top-[-3px] left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full; }
.resize-handle-s { @apply bottom-[-3px] left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full; }
.resize-handle-w { @apply left-[-3px] top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full; }
.resize-handle-e { @apply right-[-3px] top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full; }

.rescaling {
  @apply opacity-90;
}
</style>
