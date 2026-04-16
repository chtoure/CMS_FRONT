<script setup lang="ts" generic="T">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, inject } from 'vue';
import { Webhook, Link2, Link2Off } from 'lucide-vue-next';
import type { VariableProperty } from '../../../type/component';
import { useGetVariables } from '../../../hook/variable';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem 
} from '../../ui/dropdown-menu';

const props = defineProps<{
  modelValue: VariableProperty<T> | T | undefined;
  variableType?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: VariableProperty<T> | undefined): void;
}>();

const builderState = inject<{ currentBreakpoint: { value: string } }>('builderState');

const { data: variables, isLoading } = useGetVariables();

const rawNode = computed(() => {
  const prop = props.modelValue as any;
  if (!prop) return undefined;

  let valueToProcess = prop;
  // Déballer les variables racines si le modèle était buggé/statique
  if (typeof prop === 'object' && prop !== null && 'type' in prop && 'value' in prop) {
      if (prop.type === 'variable') return prop;
      valueToProcess = prop.value;
  }

  const bp = builderState?.currentBreakpoint?.value || 'default';
  const isResponsiveObj = typeof valueToProcess === 'object' && valueToProcess !== null && 
                          ('default' in valueToProcess || 'sm' in valueToProcess || 'md' in valueToProcess || 'lg' in valueToProcess);

  if (isResponsiveObj) {
    if (valueToProcess[bp] !== undefined) return valueToProcess[bp];
    if (bp === 'lg' && valueToProcess.md !== undefined) return valueToProcess.md;
    if ((bp === 'lg' || bp === 'md') && valueToProcess.sm !== undefined) return valueToProcess.sm;
    return valueToProcess.default;
  }
  return valueToProcess;
});

const isVariableMode = computed(() => {
  if (typeof rawNode.value === 'object' && rawNode.value !== null && 'type' in rawNode.value) {
    return (rawNode.value as VariableProperty<T>).type === 'variable';
  }
  return false;
});

const variableName = computed(() => {
  if (isVariableMode.value) {
    const val = (rawNode.value as VariableProperty<T>).value;
    if (variables.value) {
        // Recherche seulement par ID (nouveau système strict)
        const found = variables.value.find(v => Number(v.id) === Number(val));
        if (found) return found.name;
    }
    return val;
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

function selectVariable(vId: number) {
  emit('update:modelValue', { type: 'variable', value: vId });
}

function detachVariable() {
  emit('update:modelValue', undefined);
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
              ? 'shadow-sm' 
              : ' text-builder-bar-text hover:text-primary',
            $slots.default ? 'absolute right-1 top-1/2 -translate-y-1/2' : ''
          ]"
          :title="isVariableMode ? `Linked to ${variableName}` : 'Link to variable'"
        >
          <Link2 v-if="!isVariableMode" :size="10" />
          <Webhook v-else :size="10" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" class="min-w-[180px] bg-builder-bar-background border-builder-bar-border text-builder-bar-text shadow-xl p-1">
        <DropdownMenuLabel class="text-[10px] tracking-widest text-builder-bar-text px-2 py-1.5 italic">
          {{ isVariableMode ? 'Variable liée' : 'Connecter une variable' }}
        </DropdownMenuLabel>
        
        <div v-if="isVariableMode" class="p-1 mb-1 border border-primary rounded-[3px]">
          <div class="flex items-center justify-between gap-3">
             <div class="flex items-center gap-2 overflow-hidden">
               <Webhook :size="12" class="text-primary shrink-0" />
               <span class="text-xs font-medium truncate text-primary italic">{{ variableName }}</span>
             </div>
             <button @click="detachVariable" class="text-secondary hover:text-accent transition-colors">
               <Link2Off :size="12" />
             </button>
          </div>
        </div>

        <DropdownMenuSeparator v-if="isVariableMode" class="bg-builder-bar-border/50" />
        
        <div class="max-h-48 overflow-y-auto custom-scrollbar p-1">
            <div v-if="isLoading" class="text-[10px] text-center py-2 text-builder-bar-text/40 italic">Chargement des variables...</div>
            
            <DropdownMenuItem 
              v-for="variable in filteredVariables" 
              :key="variable.id" 
              @click="selectVariable(variable.id)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-none cursor-pointer hover:!bg-gray-500 !p-1 italic"
            >
              <div v-if="variable.collection?.type == 'COLOR'"  class="w-2 h-2 rounded-full" :style="{ backgroundColor: variable.collection?.type === 'COLOR' ? `#${variable.value}` : 'transparent', border: variable.collection?.type === 'COLOR' ? '1px solid rgba(255,255,255,0.1)' : 'none' }">
                <div v-if="variable.collection?.type !== 'COLOR'" class="w-full h-full bg-primary/40 rounded-full" />
              </div>
              <span class="text-[9px] flex-1 truncate">{{ variable.name }}</span>
              <span class="text-[9px] text-builder-bar-text/30 group-hover:text-builder-bar-text/60 font-mono">{{ variable.value }}</span>
            </DropdownMenuItem>

            <div v-if="!isLoading && filteredVariables.length === 0" class="text-[10px] text-center py-4 text-builder-bar-text/30">
                Aucune variable {{ variableType?.toLowerCase() }} trouvée
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