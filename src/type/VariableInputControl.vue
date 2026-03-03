<script setup lang="ts" generic="T">
import { computed } from 'vue';
import { Webhook } from 'lucide-vue-next';
import type { VariableProperty } from './component';
import { useGetVariables } from '../hook/variable';
import { DropdownMenu } from '../components/ui/dropdown-menu';
import DropdownMenuTrigger from '../components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../components/ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '../components/ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../components/ui/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuItem from '../components/ui/dropdown-menu/DropdownMenuItem.vue';


const props = defineProps<{
  modelValue: VariableProperty<T>;
  variableType?: string; // e.g. 'COLOR', 'SIZE', 'TEXT'
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: VariableProperty<T>): void;
}>();

const { data: variables, isLoading } = useGetVariables();

const isVariableMode = computed(() => props.modelValue?.type === 'variable');

const filteredVariables = computed(() => {
  if (!variables.value) return [];
  if (!props.variableType) return variables.value;
  // Filtre les variables par type (nom de la collection)
  return variables.value.filter(v => 
    v.collection?.name?.toUpperCase() === props.variableType?.toUpperCase()
  );
});

function selectVariable(variableName: string) {
  emit('update:modelValue', { type: 'variable', value: variableName });
}

function detachVariable() {
  // En détachant, on repasse en mode statique.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit('update:modelValue', { type: 'static', value: '' as any });
}

</script>

<template>
  <div class="relative w-full flex items-center">
    <!-- Le slot permet d'insérer n'importe quel input (texte, nombre, couleur...) -->
    <div class="flex-1" :class="{ 'opacity-50 pointer-events-none': isVariableMode }">
      <slot></slot>
    </div>
    
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button 
          class="absolute right-0 top-0 h-full px-2 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-r-md z-10"
          :class="isVariableMode ? 'bg-primary/20 text-primary' : 'hover:bg-white/10'"
          title="Gérer la liaison de variable"
        >
          <Webhook :size="14" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="bg-builder-bar-background border-border text-builder-bar-text z-50">
        <DropdownMenuLabel class="text-xs">
          {{ isVariableMode ? `Lié à : ${modelValue.value}` : 'Non lié' }}
        </DropdownMenuLabel>
        <DropdownMenuSeparator class="bg-border" />
        
        <DropdownMenuItem v-if="isVariableMode" @click="detachVariable" class="select-item-custom cursor-pointer">
          Détacher la variable
        </DropdownMenuItem>
        
        <DropdownMenuLabel class="text-xs text-gray-400 pt-2">Lier à...</DropdownMenuLabel>
        <div class="max-h-48 overflow-y-auto">
            <DropdownMenuItem v-if="isLoading" disabled class="select-item-custom">Chargement...</DropdownMenuItem>
            <DropdownMenuItem v-for="variable in filteredVariables" :key="variable.id" @click="selectVariable(variable.name)" class="select-item-custom cursor-pointer">
              {{ variable.name }}
            </DropdownMenuItem>
            <DropdownMenuItem v-if="!isLoading && filteredVariables.length === 0" disabled class="select-item-custom">
                Aucune variable trouvée
            </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>