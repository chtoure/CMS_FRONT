<script setup lang="ts">
import { ref } from 'vue';
import type { AnyComponentInstance } from '../../type/component';

const props = defineProps<{
  element: AnyComponentInstance;
  active: boolean;
}>();

const emit = defineEmits(['update:element', 'select']);

const resizableRef = ref<HTMLElement | null>(null);

const startResize = (e: MouseEvent, direction: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!resizableRef.value) return;
  
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
    
    // Update styles
    const newStyles = { ...props.element.styles };
    
    if (direction.includes('e') || direction.includes('w')) {
      newStyles.width = Math.max(10, Math.round(newWidth)); // Min width 10px
    }
    if (direction.includes('s') || direction.includes('n')) {
      newStyles.height = Math.max(10, Math.round(newHeight)); // Min height 10px
    }
    
    emit('update:element', { ...props.element, styles: newStyles });
  };
  
  const onMouseUp = () => {
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
    class="relative w-full h-full" 
    :class="{ 'ring-2 ring-gray-400 ring-offset-1': active }"
  >
    <slot />
    
    <template v-if="active">
      <!-- Handles -->
      <!-- Corners -->
      <div class="handle cursor-nw-resize top-[-4px] left-[-4px]" @mousedown.stop="startResize($event, 'nw')" />
      <div class="handle cursor-ne-resize top-[-4px] right-[-4px]" @mousedown.stop="startResize($event, 'ne')" />
      <div class="handle cursor-sw-resize bottom-[-4px] left-[-4px]" @mousedown.stop="startResize($event, 'sw')" />
      <div class="handle cursor-se-resize bottom-[-4px] right-[-4px]" @mousedown.stop="startResize($event, 'se')" />
      
      <!-- Sides -->
      <div class="handle-side cursor-n-resize top-[-4px] left-1/2 -translate-x-1/2 w-4" @mousedown.stop="startResize($event, 'n')" />
      <div class="handle-side cursor-s-resize bottom-[-4px] left-1/2 -translate-x-1/2 w-4" @mousedown.stop="startResize($event, 's')" />
      <div class="handle-side cursor-w-resize left-[-4px] top-1/2 -translate-y-1/2 h-4" @mousedown.stop="startResize($event, 'w')" />
      <div class="handle-side cursor-e-resize right-[-4px] top-1/2 -translate-y-1/2 h-4" @mousedown.stop="startResize($event, 'e')" />
    </template>
  </div>
</template>

<style scoped>
.handle {
  @apply absolute w-2.5 h-2.5 bg-white border border-gray-400 rounded-full z-50 transition-transform hover:scale-125;
}
.handle-side {
  @apply absolute bg-primary rounded-full z-50 h-1.5 w-1.5 hover:opacity-50;
}
</style>
