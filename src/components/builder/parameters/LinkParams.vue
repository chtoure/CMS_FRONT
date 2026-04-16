<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import IconPicker from '../ui/IconPicker.vue';
import CompositionMediaPicker from '../../composition/CompositionMediaPicker.vue';
import Select from '../../../components/ui/select/Select.vue';
import SelectTrigger from '../../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../../components/ui/select/SelectValue.vue';
import SelectContent from '../../../components/ui/select/SelectContent.vue';
import SelectItem from '../../../components/ui/select/SelectItem.vue';
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
import { ExternalLink, ChevronsUpDown, Check } from 'lucide-vue-next';
import { useGetNavItems } from '../../../hook/page';
import { useElementSize } from '@vueuse/core';
import { cn } from '../../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data', 'update-data-param']);

const updateData = (key: string, value: any) => emit('update-data', key, value);
const updateDataAndParam = (key: string, value: any) => emit('update-data-param', key, value);

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val;
};

const { data: navItems } = useGetNavItems();
const urlSearchOpen = ref(false);
const urlSearchRef = ref(null);
const { width: urlSearchWidth } = useElementSize(urlSearchRef);
const navItemsResults = computed(() => navItems.value || []);
</script>

<template>
  <div v-if="element.tag === 'LinkBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Lien" :icon="ExternalLink" :open="true">
      <div class="space-y-4">
        <PropertyInput
          label="Texte"
          :model-value="getDataValue(element.data.text)"
          @update:model-value="(val) => updateDataAndParam('text', String(val))"
        />

        <!-- Icône -->
        <div class="space-y-1">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Icône</label>
          <IconPicker
            :model-value="(getDataValue(element.data.icon) as string | null)"
            @update:model-value="(val) => updateData('icon', val ?? '')"
          />
        </div>

        <!-- Position de l'icône -->
        <div v-if="getDataValue(element.data.icon)" class="space-y-1 flex flex-col">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Position de l'icône</label>
          <Select
            :model-value="getDataValue(element.data.iconPosition) || 'left'"
            @update:model-value="(val) => val && updateData('iconPosition', val as string)"
          >
            <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
              <SelectValue placeholder="Position..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left"><span class="text-[10px]">Gauche</span></SelectItem>
              <SelectItem value="right"><span class="text-[10px]">Droite</span></SelectItem>
              <SelectItem value="only"><span class="text-[10px]">Icône seule</span></SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Type de Lien (Action du clic) -->
        <div class="space-y-1 flex flex-col pt-2 border-t border-builder-bar-border/30">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Type d'action</label>
          <Select
            :model-value="getDataValue(element.data.linkType) || 'url'"
            @update:model-value="(val) => val && updateData('linkType', val as string)"
          >
            <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
              <SelectValue placeholder="Type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="url"><span class="text-[10px]">Lien Classique</span></SelectItem>
              <SelectItem value="media"><span class="text-[10px]">Télécharger Média</span></SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- MODE MEDIA -->
        <div v-if="getDataValue(element.data.linkType) === 'media'" class="space-y-2">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Fichier à télécharger</label>
          <div class="flex flex-col gap-2">
            <span v-if="(element.data as any).filename" class="text-[10px] text-green-500 font-medium truncate px-1">
              Fichier lié : {{ (element.data as any).filename }}
            </span>
            <CompositionMediaPicker
              :model-value="undefined"
              @media-selected="(media) => {
                updateDataAndParam('url', media.file_path);
                updateData('filename', media.file_name || 'download');
              }"
              trigger-text="Sélectionner un média..."
            />
          </div>
        </div>

        <!-- MODE URL CLASSIQUE -->
        <template v-else>
          <div class="space-y-1">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">URL de destination</label>
          <div class="relative">
            <Popover v-model:open="urlSearchOpen">
              <PopoverTrigger as-child>
                <Button
                  ref="urlSearchRef"
                  variant="outline"
                  role="combobox"
                  class="input-custom justify-between w-full font-normal h-8 text-[10px] bg-builder-input-bg border-builder-bar-border"
                >
                  <span class="truncate">
                    {{ (element.data.url as string) || "Saisir ou choisir une page..." }}
                  </span>
                  <ChevronsUpDown class="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent :style="{ width: `${urlSearchWidth}px` }" class="p-0 border-builder-bar-border bg-builder-bar-background shadow-2xl">
                <Command class="bg-builder-bar-background">
                  <CommandInput placeholder="Rechercher une page..." class="h-8 text-[10px] text-builder-bar-text" />
                  <CommandEmpty class="py-2 text-[10px] text-center text-builder-bar-text/40">Aucune page trouvée.</CommandEmpty>
                  <CommandList class="custom-scrollbar max-h-[200px] overflow-y-auto">
                    <CommandGroup heading="Pages existantes" class="text-[9px] text-primary uppercase font-bold px-2 py-1">
                      <CommandItem
                        v-for="item in navItemsResults"
                        :key="item.value"
                        :value="item.label"
                        class="text-[10px] text-builder-bar-text hover:bg-primary hover:text-white cursor-pointer px-2 py-1.5 flex items-center gap-2"
                        @select="() => {
                          updateDataAndParam('url', item.value);
                          urlSearchOpen = false;
                        }"
                      >
                        <Check
                          :class="cn(
                            'h-3 w-3',
                            element.data.url === item.value ? 'opacity-100' : 'opacity-0'
                          )"
                        />
                        {{ item.label }}
                        <span class="text-[8px] opacity-40 italic ml-auto">{{ item.value }}</span>
                      </CommandItem>
                    </CommandGroup>

                    <CommandSeparator class="bg-builder-bar-border/30" />

                    <CommandGroup heading="Saisie personnalisée" class="text-[9px] text-primary uppercase font-bold px-2 py-1">
                       <div class="p-2">
                         <input
                           type="text"
                           :value="(element.data.url as string)"
                           @input="(e) => updateDataAndParam('url', (e.target as HTMLInputElement).value)"
                           @keydown.enter="(e) => { (e.target as HTMLInputElement).blur(); updateDataAndParam('url', (e.target as HTMLInputElement).value); urlSearchOpen = false }"
                           placeholder="Ex: https://google.com"
                           class="w-full bg-builder-bar-background border border-builder-bar-border rounded px-2 py-1 text-[10px] focus:outline-none focus:border-primary"
                         />
                       </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div class="space-y-1 flex flex-col">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Cible</label>
          <Select :model-value="getDataValue(element.data.target)" @update:model-value="(val) => val && updateData('target', val as string)">
            <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_self">
                <span class="text-[10px]">Même fenêtre</span>
              </SelectItem>
              <SelectItem value="_blank">
                <span class="text-[10px]">Nouvelle fenêtre</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        </template>
      </div>
    </PropertyGroup>
  </div>
</template>
