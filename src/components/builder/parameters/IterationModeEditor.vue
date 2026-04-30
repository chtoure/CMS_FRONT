<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import { Button } from '../../../components/ui/button';
import { Repeat } from 'lucide-vue-next';

defineProps<{
  element: AnyComponentInstance;
}>();

const emit = defineEmits(['update-data']);
</script>

<template>
  <div class="flex items-center justify-between bg-builder-input-bg border border-builder-bar-border/20 rounded-md p-2 mb-6">
    <div class="flex items-center gap-2">
      <div class="p-1.5 bg-primary/10 rounded">
        <Repeat class="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p class="text-[10px] font-mono font-bold text-builder-bar-text/80 uppercase tracking-tighter">Mode Itération</p>
        <p class="text-[9px] text-builder-bar-text/40 font-mono">Répéter ce bloc par item</p>
      </div>
    </div>
    <Button
      size="sm"
      :variant="element.data.isIterated ? 'default' : 'outline'"
      class="h-7 text-[10px] px-4 font-bold transition-all"
      :class="{ 'bg-primary text-black hover:bg-primary/90': element.data.isIterated }"
      @click="emit('update-data', 'isIterated', !element.data.isIterated)"
    >
      {{ element.data.isIterated ? 'ACTIVÉ' : 'DÉSACTIVÉ' }}
    </Button>
  </div>
</template>
