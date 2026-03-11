<script setup lang="ts" generic="T">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed } from 'vue';
import { Webhook, Link2, Link2Off } from 'lucide-vue-next';
import type { VariableProperty } from './component';
import { useGetVariables } from '../hook/variable';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem 
} from '../components/ui/dropdown-menu';

const props = defineProps<{
  modelValue: VariableProperty<T> | T | undefined;
  variableType?: string; // e.g. 'COLOR', 'NUMBER', 'STRING'
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: VariableProperty<T>): void;
}>();

const { data: variables, isLoading } = useGetVariables();

const isVariableMode = computed(() => {
  if (typeof props.modelValue === 'object' && props.modelValue !== null && 'type' in props.modelValue) {
    return (props.modelValue as VariableProperty<T>).type === 'variable';
  }
  return false;
});

const variableName = computed(() => {
  if (isVariableMode.value) {
    return (props.modelValue as VariableProperty<T>).value;
  }
  return null;
});

const filteredVariables = computed(() => {
  if (!variables.value) return [];
  if (!props.variableType) return variables.value;
  
  const typeMap: Record<string, string> = {
    'COLOR': 'COLOR',
    'NUMBER': 'NUMBER',
    'STRING': 'STRING',
    'BOOLEAN': 'BOOLEAN'
  };

  const targetType = typeMap[props.variableType] || props.variableType;

  return variables.value.filter(v => 
    v.collection?.type === targetType
  );
});

function selectVariable(vName: string) {
  emit('update:modelValue', { type: 'variable', value: vName });
}

function detachVariable() {
  // Logic to keep the current value if possible or set to static
  // Since we don't have the resolved value here easily without passing it as prop,
  // we'll just emit a "static" with the name to let useStyleEditor handle it if possible, 
  // or just reset. 
  emit('update:modelValue', { type: 'static', value: '' as any });
}
</script>

<template>
  <div class="relative group/var flex items-center" :class="{ 'w-full': $slots.default }">
    <div v-if="$slots.default" class="flex-1" :class="{ 'pointer-events-none opacity-80': isVariableMode }">
      <slot></slot>
    </div>
    
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button 
          class="w-5 h-5 flex items-center justify-center transition-all rounded-sm z-20"
          :class="[
            isVariableMode 
              ? 'bg-primary text-white shadow-sm' 
              : 'bg-builder-bar-border text-builder-bar-text hover:text-primary',
            $slots.default ? 'absolute right-1 top-1/2 -translate-y-1/2' : ''
          ]"
          :title="isVariableMode ? `Linked to ${variableName}` : 'Link to variable'"
        >
          <Link2 v-if="!isVariableMode" :size="10" />
          <Webhook v-else :size="10" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" class="min-w-[180px] bg-builder-bar-background border-builder-bar-border text-builder-bar-text shadow-xl p-1">
        <DropdownMenuLabel class="text-[10px] font-bold uppercase tracking-widest text-builder-bar-text/40 px-2 py-1.5">
          {{ isVariableMode ? 'Linked Variable' : 'Connect Variable' }}
        </DropdownMenuLabel>
        
        <div v-if="isVariableMode" class="px-2 py-2 mb-1 bg-primary/10 border border-primary/20 rounded-sm">
          <div class="flex items-center justify-between gap-3">
             <div class="flex items-center gap-2 overflow-hidden">
               <Webhook :size="12" class="text-primary shrink-0" />
               <span class="text-xs font-medium truncate text-primary">{{ variableName }}</span>
             </div>
             <button @click="detachVariable" class="text-builder-bar-text/40 hover:text-red-400 transition-colors">
               <Link2Off :size="12" />
             </button>
          </div>
        </div>

        <DropdownMenuSeparator v-if="isVariableMode" class="bg-builder-bar-border/50" />
        
        <div class="max-h-48 overflow-y-auto custom-scrollbar p-1">
            <div v-if="isLoading" class="text-[10px] text-center py-2 text-builder-bar-text/40 italic">Loading variables...</div>
            
            <DropdownMenuItem 
              v-for="variable in filteredVariables" 
              :key="variable.id" 
              @click="selectVariable(variable.name)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: variable.collection?.type === 'COLOR' ? variable.value : 'transparent', border: variable.collection?.type === 'COLOR' ? '1px solid rgba(255,255,255,0.1)' : 'none' }">
                <div v-if="variable.collection?.type !== 'COLOR'" class="w-full h-full bg-primary/40 rounded-full" />
              </div>
              <span class="text-xs flex-1 truncate">{{ variable.name }}</span>
              <span class="text-[9px] text-builder-bar-text/30 group-hover:text-builder-bar-text/60 font-mono">{{ variable.value }}</span>
            </DropdownMenuItem>

            <div v-if="!isLoading && filteredVariables.length === 0" class="text-[10px] text-center py-4 text-builder-bar-text/30">
                No {{ variableType?.toLowerCase() }} variables found
            </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-builder-bar-border rounded-full;
}
</style>