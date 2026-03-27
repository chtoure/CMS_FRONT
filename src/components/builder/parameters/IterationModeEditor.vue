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
  <div class="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6 shadow-sm">
    <div class="flex items-center gap-2">
      <div class="p-1.5 bg-primary/20 rounded-md">
        <Repeat class="h-4 w-4 text-primary" />
      </div>
      <div>
        <p class="text-[10px] font-mono font-bold text-primary uppercase tracking-tighter">Mode Itération</p>
        <p class="text-[10px] text-primary/70 font-medium">Répéter ce bloc pour chaque item de la liste</p>
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
