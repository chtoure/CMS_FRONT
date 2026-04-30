<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { AnyComponentInstance, CliquableAction } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import CompositionMediaPicker from '../../composition/CompositionMediaPicker.vue';
import Popover from '../../../components/ui/popover/Popover.vue';
import PopoverTrigger from '../../../components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '../../../components/ui/popover/PopoverContent.vue';
import Command from '../../../components/ui/command/Command.vue';
import CommandInput from '../../../components/ui/command/CommandInput.vue';
import CommandEmpty from '../../../components/ui/command/CommandEmpty.vue';
import CommandList from '../../../components/ui/command/CommandList.vue';
import CommandGroup from '../../../components/ui/command/CommandGroup.vue';
import CommandItem from '../../../components/ui/command/CommandItem.vue';
import CommandSeparator from '../../../components/ui/command/CommandSeparator.vue';
import { Button } from '../../../components/ui/button';
import { MousePointer2, ChevronsUpDown, Check } from 'lucide-vue-next';
import { useGetNavItems } from '../../../hook/page';
import { useElementSize } from '@vueuse/core';
import { cn } from '../../../lib/utils';

const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateData = (key: string, value: any) => emit('update-data', key, value);

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
}>('builderState');

const { data: navItems } = useGetNavItems();
const urlSearchOpen = ref(false);
const urlSearchRef = ref(null);
const { width: urlSearchWidth } = useElementSize(urlSearchRef);
const navItemsResults = computed(() => navItems.value || []);

const allComponents = computed(() => {
  const list: { stableId: string; name: string; tag: string }[] = [];
  const traverse = (elements: AnyComponentInstance[]) => {
    for (const el of elements) {
      if (el.id !== props.element.id) {
        const stableId = el.blocTemplateId ? el.blocTemplateId.toString() : el.id;
        list.push({ stableId, name: el.name, tag: el.tag });
      }
      if (el.children) traverse(el.children);
    }
  };
  if (builderState?.pageTree.value) {
    traverse(builderState.pageTree.value);
  }
  return list;
});
</script>

<template>
  <div v-if="element.family === 'interactive'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Actions & Liens" :icon="MousePointer2" :open="true">
      <div v-if="element.data.cliquable && typeof element.data.cliquable === 'object'" class="space-y-4">
        <div class="space-y-1 flex flex-col">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Action au clic</label>
          <select
            :value="((element.data.cliquable as CliquableAction).action)"
            @change="(e) => updateData('cliquable', { ...(element.data.cliquable as object), action: (e.target as HTMLSelectElement).value as CliquableAction['action'] })"
            class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
          >
            <option value="NAVIGATE_TO">Naviguer vers URL</option>
            <option value="SHOW_ALERT">Afficher Alerte</option>
            <option value="DOWNLOAD_MEDIA">Télécharger Média</option>
            <option value="TOGGLE_VISIBILITY">Toggle Visibilité</option>
          </select>
        </div>

        <div v-if="(element.data.cliquable as CliquableAction).action === 'NAVIGATE_TO'" class="space-y-1">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">URL de destination</label>
          <div class="relative">
            <Popover v-model:open="urlSearchOpen">
              <PopoverTrigger as-child>
                <Button
                  ref="urlSearchRef"
                  variant="outline"
                  role="combobox"
                  class="input-custom justify-between w-full font-normal h-7 px-2 text-[10px] bg-builder-input-bg border-builder-bar-border !text-builder-bar-text hover:!border-primary transition-colors"
                >
                  <span class="truncate">
                    {{ (element.data.cliquable as any).action_params?.url || "Saisir ou choisir une page..." }}
                  </span>
                  <ChevronsUpDown class="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent :style="{ width: `${urlSearchWidth}px` }" class="p-0 border-builder-bar-border bg-builder-bar-background shadow-2xl">
                <Command class="bg-builder-bar-background">
                  <CommandInput placeholder="Rechercher une page..." class="h-8 text-[10px] text-builder-bar-text" />
                  <CommandEmpty class="py-2 text-[10px] text-center text-builder-bar-text/40 italic">Aucune page trouvée.</CommandEmpty>
                  <CommandList class="custom-scrollbar max-h-[200px] overflow-y-auto p-1">
                    <CommandGroup heading="Pages existantes" class="text-[9px] text-primary uppercase font-bold px-1 py-1 tracking-widest">
                      <CommandItem
                        v-for="item in navItemsResults"
                        :key="item.value"
                        :value="item.label"
                        class="text-[10px] text-builder-bar-text hover:bg-primary/20 hover:text-primary cursor-pointer px-2 py-1.5 flex items-center gap-2 rounded-none transition-colors"
                        @select="() => {
                          updateData('cliquable', { ...(element.data.cliquable as object), action_params: { url: item.value } });
                          urlSearchOpen = false;
                        }"
                      >
                        <Check
                          :class="cn(
                            'h-3 w-3',
                            (element.data.cliquable as any).action_params?.url === item.value ? 'opacity-100' : 'opacity-0'
                          )"
                        />
                        {{ item.label }}
                        <span class="text-[8px] opacity-40 italic ml-auto">{{ item.value }}</span>
                      </CommandItem>
                    </CommandGroup>

                    <CommandSeparator class="bg-builder-bar-border/30 mx-1" />
                    <CommandGroup heading="Saisie personnalisée" class="text-[9px] text-primary uppercase font-bold px-1 py-1 tracking-widest">
                       <div class="p-2">
                         <input
                           type="text"
                           :value="(element.data.cliquable as any).action_params?.url"
                           @input="(e) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { url: (e.target as HTMLInputElement).value } })"
                           @keydown.enter="(e) => { (e.target as HTMLInputElement).blur(); updateData('cliquable', { ...(element.data.cliquable as object), action_params: { url: (e.target as HTMLInputElement).value } }); urlSearchOpen = false }"
                           placeholder="Ex: https://google.com"
                           class="w-full bg-builder-input-bg border border-builder-bar-border rounded px-2 py-1.5 text-[10px] text-builder-bar-text focus:outline-none focus:border-primary transition-colors font-mono"
                         />
                       </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div v-if="(element.data.cliquable as CliquableAction).action === 'DOWNLOAD_MEDIA'" class="space-y-2">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Fichier à télécharger</label>
          <div class="flex flex-col gap-2">
            <span v-if="(element.data.cliquable as any).action_params?.filename" class="text-[10px] text-green-500 font-medium truncate px-1">
              Fichier lié : {{ (element.data.cliquable as any).action_params?.filename }}
            </span>
            <div class="w-full overflow-hidden">
              <CompositionMediaPicker
                :model-value="undefined"
                @media-selected="(media) => updateData('cliquable', {
                  ...(element.data.cliquable as object),
                  action_params: { url: media.file_path, filename: media.file_name || 'download' }
                })"
                trigger-text="Sélectionner un média..."
              />
            </div>
          </div>
        </div>

        <div v-if="(element.data.cliquable as CliquableAction).action === 'SHOW_ALERT'" class="space-y-1">
          <PropertyInput
            label="Message"
            :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'SHOW_ALERT' }>).action_params?.message)"
            @update:model-value="(val) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { message: val } })"
            placeholder="Message d'alerte..."
          />
        </div>

        <div v-if="(element.data.cliquable as CliquableAction).action === 'TOGGLE_VISIBILITY'" class="space-y-1 flex flex-col">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Composant cible</label>
          <select
            :value="((element.data.cliquable as Extract<CliquableAction, { action: 'TOGGLE_VISIBILITY' }>).action_params?.targetId)"
            @change="(e) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { targetId: (e.target as HTMLSelectElement).value } })"
            class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
          >
            <option v-if="allComponents.length === 0" disabled value="">Aucun trouvé</option>
            <option v-else value="" disabled>Choisir un composant...</option>
            <option
              v-for="comp in allComponents"
              :key="comp.stableId"
              :value="comp.stableId"
            >
              {{ comp.name || comp.tag }}
            </option>
          </select>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
