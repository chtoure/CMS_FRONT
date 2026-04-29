<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { ValueSource, type IComponentParams, type IContenusField, type IImageField, type IPropsSchemaField } from '../../../type/params';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
// import Select from '../../../components/ui/select/Select.vue';
// import SelectTrigger from '../../../components/ui/select/SelectTrigger.vue';
// import SelectValue from '../../../components/ui/select/SelectValue.vue';
// import SelectContent from '../../../components/ui/select/SelectContent.vue';
// import SelectItem from '../../../components/ui/select/SelectItem.vue';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Plus, Trash2, ChevronDown, Type, Image as ImageIcon, Database } from 'lucide-vue-next';
import CompositionMediaPicker from '../../composition/CompositionMediaPicker.vue';

// Hooks
import { useGetContentTypes } from '../../../hook/content-type';
import { useGetContentEntriesBySlug } from '../../../hook/content-entry';
// import { useGetMediaList } from '../../../hook/media';
import type { ContentType } from '../../../type/content-type';

const props = defineProps<{
  element: AnyComponentInstance;
  paramDynamic: boolean;
  canAddParams: boolean;
  filteredSourceOptions: { label: string; value: ValueSource; icon: any }[];
  modeOptions: { label: string; value: string }[];
  orderOptions: { label: string; value: string }[];
}>();

const emit = defineEmits(['add-parameter', 'remove-parameter', 'save-parameter-edit']);

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
}>('builderState');

const { data: contentTypeOptions } = useGetContentTypes();
// const mediaQuery = useGetMediaList({});

const expandedParam = ref<string | null>(null);
const showAddForm = ref(false);
const editingParam = ref<IComponentParams | null>(null);

const newParam = ref<Partial<IComponentParams>>({
  label: '',
  name: '',
  type: { source: ValueSource.STATIC, value: '' } as IPropsSchemaField,
  required: false
});

watch(() => (newParam.value.type as any).source, (newSource) => {
  if (newSource === ValueSource.CONTENUS) {
    if (!(newParam.value.type as any).config) {
      (newParam.value.type as any).config = { mode: 'single' };
    }
  }
});

watch(() => props.element.id, () => {
  showAddForm.value = false;
  expandedParam.value = null;
});

watch(() => (newParam.value.type as any)?.source, (newSource) => {
  if (newSource === ValueSource.STATIC) {
    newParam.value.type = { source: ValueSource.STATIC, value: '' };
  } else if (newSource === ValueSource.IMAGE) {
    newParam.value.type = { source: ValueSource.IMAGE, src: '' };
  } else if (newSource === ValueSource.CONTENUS) {
    newParam.value.type = {
      source: ValueSource.CONTENUS,
      contentTypeId: 0,
      config: { mode: 'single', entryId: 0 }
    } as any;
  }
});

const generateUniqueName = (label: string): string => {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug || 'param'}_${suffix}`;
};

const isContentTypeSelected = computed(() => !!(newParam.value.type as any).contentTypeId);
const selectedNewContentTypeSlug = computed(() => {
  const id = (newParam.value.type as any).contentTypeId;
  return contentTypeOptions.value?.results.find((opt: ContentType) => opt.id === id)?.slug;
});
const { data: newContentEntries } = useGetContentEntriesBySlug(selectedNewContentTypeSlug);

const isEditingContentTypeSelected = computed(() => !!(editingParam.value?.type as any)?.contentTypeId);
const selectedEditingContentTypeSlug = computed(() => {
  const id = (editingParam.value?.type as any)?.contentTypeId;
  return contentTypeOptions.value?.results.find((opt: ContentType) => opt.id === id)?.slug;
});
const { data: editingContentEntries } = useGetContentEntriesBySlug(selectedEditingContentTypeSlug);

const handleSelectChange = (val: unknown) => {
  if (val !== null && val !== undefined) {
    const contentTypeId = Number(val);
    (newParam.value.type as IContenusField).contentTypeId = contentTypeId;
    if ((newParam.value.type as any).config) {
      (newParam.value.type as any).config.entryId = undefined;
      (newParam.value.type as any).config.mappingField = '';
    }
  }
};

const handleEditingTypeChange = (val: unknown) => {
  if (!editingParam.value || val === null || val === undefined) return;
  const id = Number(val);
  (editingParam.value.type as any).contentTypeId = id;
  if ((editingParam.value.type as any).config) {
    (editingParam.value.type as any).config.entryId = undefined;
    (editingParam.value.type as any).config.mappingField = '';
  }
};

const previewImage = ref('');

const changeMediaEditor = (media: any) => {
  if (!editingParam.value || !media) return;
  (editingParam.value.type as IImageField).src = media.file_path || '';
  (editingParam.value.type as IImageField).id = media.id;
};

const changeMediaAdd = (media: any) => {
  if (!newParam.value || !media) return;
  previewImage.value = media.file_path || '';
  (newParam.value.type as IImageField).src = previewImage.value;
  (newParam.value.type as IImageField).id = media.id;
};

const toggleParam = (name: string) => {
  if (expandedParam.value === name) {
    expandedParam.value = null;
    editingParam.value = null;
  } else {
    expandedParam.value = name;
    const param = props.element.params.find(p => p.name === name);
    if (param) {
      editingParam.value = JSON.parse(JSON.stringify(param));
    }
  }
};

const cancelParameterEdit = () => {
  expandedParam.value = null;
  editingParam.value = null;
};

const addParameter = () => {
  if (!newParam.value.label || !builderState) return;
  const name = generateUniqueName(newParam.value.label);
  const param: IComponentParams = {
    name,
    label: newParam.value.label,
    type: newParam.value.type as IPropsSchemaField,
    required: !!newParam.value.required
  };

  emit('add-parameter', param, name);

  newParam.value = { label: '', name: '', type: { source: ValueSource.STATIC, value: '' } as IPropsSchemaField, required: false };
  showAddForm.value = false;
  expandedParam.value = name;
};

const saveParameterEdit = () => {
  if (!editingParam.value) return;
  emit('save-parameter-edit', editingParam.value);
  expandedParam.value = null;
  editingParam.value = null;
};
</script>

<template>
  <div v-if="canAddParams" class="space-y-2">
    <div v-if="canAddParams && paramDynamic" class="mb-2">
      <button
        @click="showAddForm = !showAddForm"
        class="w-full flex items-center justify-between px-3 py-2 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all transition-colors group"
      >
        <div class="flex items-center gap-2">
          <Plus class="w-3.5 h-3.5" />
          <span class="text-[10px] font-mono font-bold uppercase tracking-tighter">Ajouter un paramètre</span>
        </div>
        <ChevronDown
          class="w-3 h-3 transition-transform duration-200"
          :class="{ 'rotate-180': showAddForm }"
        />
      </button>
    </div>

    <!-- Formulaire d'ajout de paramètre -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0 overflow-hidden"
      enter-to-class="max-h-[1000px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[1000px] opacity-100"
      leave-to-class="max-h-0 opacity-0 overflow-hidden"
    >
      <div v-if="showAddForm" class="bg-builder-bar-background/50 border border-builder-bar-border rounded-md p-3 space-y-4 mb-4 shadow-inner">
        <div class="space-y-3">
          <PropertyInput
            label="Label"
            v-model="newParam.label"
            placeholder="Ex: Titre, Couleur..."
          />
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1.5 flex flex-col">
              <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Source</label>
              <select
                :value="(newParam.type as any).source"
                @change="(e) => (newParam.type as any).source = (e.target as HTMLSelectElement).value"
                class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
              >
                <option v-for="opt in filteredSourceOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="flex items-end pb-0.5 justify-center bg-builder-input-bg border border-builder-bar-border rounded h-7 mt-auto">
                <div class="flex items-center space-x-2">
                  <Checkbox id="new-required" :checked="newParam.required" @update:checked="(val: any) => newParam.required = !!val" />
                  <label for="new-required" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Requis</label>
                </div>
            </div>
          </div>
        </div>

        <!-- Configuration dynamique selon la Source -->
        <div v-if="(newParam.type as any).source === 'static'" class="space-y-1.5">
          <PropertyInput
            label="Valeur"
            v-model="(newParam.type as any).value"
            placeholder="Valeur initiale..."
          />
        </div>

        <div v-if="(newParam.type as any).source === 'image'" class="space-y-1.5 min-w-0">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Choisir une image</label>
          <div class="w-full overflow-hidden">
            <CompositionMediaPicker
              :model-value="(newParam.type as any).id"
              :allowed-types="['image']"
              @media-selected="changeMediaAdd($event)"
            />
          </div>
        </div>

        <div v-if="(newParam.type as any).source === 'contenus'" class="space-y-4">
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1 flex flex-col">
              <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Contenu</label>
              <select
                :value="(newParam.type as any).contentTypeId"
                @change="(e) => handleSelectChange((e.target as HTMLSelectElement).value)"
                class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
              >
                <option value="0" disabled>Choisir...</option>
                <option v-for="opt in contentTypeOptions?.results" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
            </div>
            <div class="space-y-1 flex flex-col">
              <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Mode</label>
              <select
                :value="(newParam.type as any).config.mode"
                @change="(e) => (newParam.type as any).config.mode = (e.target as HTMLSelectElement).value"
                class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
              >
                <option v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
                  {{ mode.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Mode: Single -->
          <div v-if="(newParam.type as any).config.mode === 'single'" class="space-y-1 flex flex-col">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Entrée</label>
            <select
              :value="(newParam.type as any).config.entryId"
              @change="(e) => (newParam.type as any).config.entryId = Number((e.target as HTMLSelectElement).value)"
              :disabled="!isContentTypeSelected"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="0" disabled>Choisir...</option>
              <option v-for="entry in newContentEntries?.results" :key="entry.id" :value="entry.id">
                {{ entry.id }} - {{ (entry.data_json as any).title || 'Sans titre' }}
              </option>
            </select>
          </div>

          <!-- Mode: Query -->
          <div v-if="(newParam.type as any).config.mode === 'query'" class="space-y-3">
            <PropertyInput
              label="Limite"
              v-model.number="(newParam.type as any).config.limit"
              type="number"
              placeholder="Illimité"
            />
            <div class="grid grid-cols-2 gap-2">
              <PropertyInput
                label="Tri"
                v-model="(newParam.type as any).config.sortBy"
                placeholder="Champ"
              />
              <div class="space-y-1 flex flex-col">
              <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ordre</label>
              <select
                :value="(newParam.type as any).config.order"
                @change="(e) => (newParam.type as any).config.order = (e.target as HTMLSelectElement).value"
                class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
              >
                <option v-for="opt in orderOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              </div>
            </div>
          </div>
          <div class="flex gap-2 pt-2 border-t border-builder-bar-border/30">
            <Button size="sm" class="flex-1 h-7 text-[10px] bg-primary text-black hover:bg-primary/90 font-bold" @click="addParameter">Ajouter</Button>
            <Button size="sm" variant="ghost" class="flex-1 h-7 text-[10px] hover:bg-white/5" @click="showAddForm = false">Annuler</Button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Liste des paramètres (Accordéon) -->
    <div v-if="element.params && element.params.length > 0" class="space-y-1">
      <div v-for="field in element.params" :key="field.name">
        <PropertyGroup
          :title="field.label"
          :open="expandedParam === field.name"
          @update:open="(val) => { if (val) toggleParam(field.name); else expandedParam = null; }"
        >
          <template #icon>
            <Type v-if="field.type.source === 'static'" class="h-3.5 w-3.5" />
            <ImageIcon v-else-if="field.type.source === 'image'" class="h-3.5 w-3.5" />
            <Database v-else class="h-3.5 w-3.5" />
          </template>

          <div v-if="editingParam && expandedParam === field.name" class="p-2 space-y-4 bg-builder-bar-background/30 rounded border border-builder-bar-border/50">
            <PropertyInput label="Label" v-model="editingParam.label" />

            <div class="space-y-3 pt-2 border-t border-builder-bar-border/30">
              <!-- Static Configuration -->
              <div v-if="editingParam.type.source === 'static'" class="space-y-1.5">
                <PropertyInput label="Valeur" v-model="(editingParam.type as any).value" />
              </div>

              <!-- Image Configuration -->
              <div v-if="editingParam.type.source === 'image'" class="space-y-2 min-w-0">
                <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Image</label>
                <div class="w-full overflow-hidden">
                  <CompositionMediaPicker
                    :model-value="(editingParam.type as any).id"
                    :allowed-types="['image']"
                    @media-selected="changeMediaEditor($event)"
                  />
                </div>
              </div>

              <!-- Contenus Configuration -->
              <div v-if="editingParam.type.source === 'contenus'" class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1 flex flex-col">
                    <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Contenu</label>
                    <select
                      :value="(editingParam.type as any).contentTypeId"
                      @change="(e) => handleEditingTypeChange((e.target as HTMLSelectElement).value)"
                      class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
                    >
                      <option value="0" disabled>Choisir...</option>
                      <option v-for="opt in contentTypeOptions?.results" :key="opt.id" :value="opt.id">
                        {{ opt.name }}
                      </option>
                    </select>
                  </div>
                  <div class="space-y-1 flex flex-col">
                    <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Mode</label>
                    <select
                      :value="(editingParam.type as any).config.mode"
                      @change="(e) => (editingParam!.type as any).config.mode = (e.target as HTMLSelectElement).value"
                      class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
                    >
                      <option v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
                        {{ mode.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Mode: Single -->
                <div v-if="(editingParam.type as any).config.mode === 'single'" class="space-y-1 flex flex-col">
                  <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Entrée</label>
                  <select
                    :value="(editingParam.type as any).config.entryId"
                    @change="(e) => (editingParam!.type as any).config.entryId = Number((e.target as HTMLSelectElement).value)"
                    :disabled="!isEditingContentTypeSelected"
                    class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="0" disabled>Choisir...</option>
                    <option v-for="entry in editingContentEntries?.results" :key="entry.id" :value="entry.id">
                      {{ entry.id }} - {{ (entry.data_json as any).title || 'Sans titre' }}
                    </option>
                  </select>
                </div>

                <!-- Mode: Query -->
                <div v-if="(editingParam.type as any).config.mode === 'query'" class="space-y-3">
                  <PropertyInput
                    label="Limite"
                    v-model.number="(editingParam.type as any).config.limit"
                    type="number"
                    placeholder="Illimité"
                  />
                  <div class="grid grid-cols-2 gap-2">
                    <PropertyInput
                      label="Tri"
                      v-model="(editingParam.type as any).config.sortBy"
                      placeholder="Champ"
                    />
                    <div class="space-y-1 flex flex-col">
                      <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ordre</label>
                      <select
                        :value="(editingParam.type as any).config.order"
                        @change="(e) => (editingParam!.type as any).config.order = (e.target as HTMLSelectElement).value"
                        class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
                      >
                        <option v-for="opt in orderOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer de l'accordéon -->
            <div class="flex gap-2 pt-3 border-t border-builder-bar-border/30">
              <Button size="sm" variant="ghost" class="flex-1 h-7 text-[10px] order-2 hover:bg-white/5" @click="cancelParameterEdit">
                Annuler
              </Button>
              <Button size="sm" class="flex-1 h-7 text-[10px] bg-primary text-black hover:bg-primary/90 font-bold" @click="saveParameterEdit">
                Modifier
              </Button>
              <Button
                v-if="paramDynamic"
                variant="ghost"
                size="icon"
                class="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-400 shrink-0"
                @click.stop="emit('remove-parameter', field.name)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </PropertyGroup>
      </div>
    </div>
    <div v-else class="p-4 text-center border border-dashed border-builder-bar-border rounded text-builder-bar-text/40">
      <p class="text-[10px] font-mono uppercase tracking-widest">Aucun paramètre</p>
    </div>
  </div>
</template>
