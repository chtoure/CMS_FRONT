<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import Popover from '../../../components/ui/popover/Popover.vue';
import PopoverTrigger from '../../../components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '../../../components/ui/popover/PopoverContent.vue';
import Command from '../../../components/ui/command/Command.vue';
import CommandInput from '../../../components/ui/command/CommandInput.vue';
import CommandEmpty from '../../../components/ui/command/CommandEmpty.vue';
import CommandList from '../../../components/ui/command/CommandList.vue';
import CommandGroup from '../../../components/ui/command/CommandGroup.vue';
import CommandItem from '../../../components/ui/command/CommandItem.vue';
import { X, Check } from 'lucide-vue-next';
import { useElementSize } from '@vueuse/core';

interface Props {
  modelValue?: string | null;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Choisir une icône...',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const open = ref(false);
const triggerRef = ref(null);
const { width: triggerWidth } = useElementSize(triggerRef);

// Extraire tous les noms d'icônes Lucide valides (composants Vue)
const allIconNames = Object.keys(LucideIcons).filter(
  (name) => /^[A-Z]/.test(name) && name !== 'LucideProps' && name !== 'IconNode' && name !== 'default'
);

const search = ref('');

const filteredIcons = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return allIconNames.slice(0, 80); // Limit pour la performance
  return allIconNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 80);
});

const selectedIcon = computed(() =>
  props.modelValue && props.modelValue in LucideIcons
    ? (LucideIcons as any)[props.modelValue]
    : null
);

const selectIcon = (name: string | null) => {
  emit('update:modelValue', name);
  nextTick(() => {
    open.value = false;
    search.value = '';
  });
};
</script>

<template>
  <div ref="triggerRef">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
          class="flex items-center gap-1.5 w-full h-7 px-2 rounded border border-builder-bar-border bg-builder-input-bg text-[10px] text-builder-bar-text hover:border-primary focus:outline-none focus:border-primary transition-colors"
        >
          <component
            v-if="selectedIcon"
            :is="selectedIcon"
            :size="12"
            class="shrink-0 text-primary"
          />
          <span v-else class="text-builder-bar-text/40">Aucune</span>
          <span v-if="modelValue" class="truncate text-left flex-1">{{ modelValue }}</span>
          <span v-else class="truncate text-left flex-1 text-builder-bar-text/40">{{ placeholder }}</span>
          <button
            v-if="modelValue"
            class="ml-auto shrink-0 text-builder-bar-text/30 hover:text-red-400 transition-colors"
            @click.stop="selectIcon(null)"
            title="Supprimer l'icône"
          >
            <X :size="10" />
          </button>
        </button>
      </PopoverTrigger>

      <PopoverContent
        :style="{ width: `${Math.max(triggerWidth, 220)}px` }"
        class="p-0 border-builder-bar-border bg-builder-bar-background shadow-2xl"
      >
        <Command class="bg-builder-bar-background">
          <CommandInput
            v-model="search"
            placeholder="Rechercher une icône..."
            class="h-8 text-[10px] text-builder-bar-text"
          />
          <CommandEmpty class="py-2 text-[10px] text-center text-builder-bar-text/40 italic">
            Aucune icône trouvée.
          </CommandEmpty>
          <CommandList class="custom-scrollbar max-h-[240px] overflow-y-auto p-1">
            <!-- Option "Aucune icône" -->
            <CommandGroup>
              <CommandItem
                value="__none__"
                class="text-[10px] text-builder-bar-text/50 data-[highlighted]:bg-builder-bar-border/30 data-[highlighted]:text-builder-bar-text hover:bg-builder-bar-border/30 cursor-pointer px-2 py-1.5 flex items-center gap-2 rounded-none italic"
                @select="() => selectIcon(null)"
              >
                <X :size="12" class="opacity-40" />
                <span>Aucune icône</span>
                <Check v-if="!modelValue" :size="10" class="ml-auto text-primary" />
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Icônes disponibles" class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">
              <CommandItem
                v-for="name in filteredIcons"
                :key="name"
                :value="name"
                class="text-[10px] text-builder-bar-text data-[highlighted]:bg-primary/20 data-[highlighted]:text-primary hover:bg-primary hover:text-destructive-foreground cursor-pointer px-2 py-1.5 flex items-center gap-2 rounded-none transition-colors"
                @select="() => selectIcon(name)"
              >
                <component
                  :is="(LucideIcons as any)[name]"
                  :size="13"
                  class="shrink-0"
                />
                <span class="truncate font-medium">{{ name }}</span>
                <Check v-if="modelValue === name" :size="10" class="ml-auto text-primary" />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
