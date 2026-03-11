<script setup lang="ts" generic="T">
import { computed, watch } from 'vue';
import { Webhook } from 'lucide-vue-next';
import DropdownMenu from '../ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '../ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue';
import type { VariableProperty } from '../../type/component';
import { useGetVariables } from '../../hook/variable';


const props = defineProps<{
  modelValue: VariableProperty<T>;
  variableType?: 'COLOR' | 'NUMBER' | 'STRING' | 'BOOLEAN'; // e.g. 'COLOR', 'SIZE', 'TEXT'
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: VariableProperty<T>): void;
}>();

const { data: variables, isLoading } = useGetVariables();
console.log('tttttttttttttttttt', variables.value);

watch(variables, ()=>{
  console.log('ttttttttttttttttttttttttttt',variables.value);
})


const isVariableMode = computed(() => props.modelValue?.type === 'variable');

const filteredVariables = computed(() => {
  if (!variables.value) return [];
  if (!props.variableType) return variables.value;
  // Filtre les variables par type (nom de la collection)
  // Assurez-vous que vos collections ont des noms comme 'COLOR', 'SIZE', etc.
  // ou adaptez cette logique selon vos besoins.
  return variables.value.filter(v => 
    v.collection?.type?.toUpperCase() === props.variableType?.toUpperCase()
  );
});

function selectVariable(variableName: string) {
  emit('update:modelValue', { type: 'variable', value: variableName });
}

function detachVariable() {
  // En détachant, on repasse en mode statique.
  // On émet une valeur vide ou par défaut. Le composant parent (via le hook useStyleEditor)
  // gérera la valeur par défaut si nécessaire.
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