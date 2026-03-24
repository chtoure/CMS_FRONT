<script setup lang="ts">
import {Save, Loader2, ChevronsUpDown, Check } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { computed, ref, watch } from 'vue'
import { useForm, Field } from 'vee-validate'
import { useGetParameters, useUpdateParameters } from '../../hook/parameter'
import { showToast } from '../../lib/toast'
import CompositionLoading from '@/components/composition/CompositionLoading.vue'
import { getErrorMessage } from '../../lib/errorMessage'
import CompositionError from '@/components/composition/CompositionError.vue'
import { parameterSchema } from '../../validation/parameterValidate'
import { useGetMediaList } from '../../hook/media'
import CompositionMediaPicker from '../../components/composition/CompositionMediaPicker.vue'
import Popover from '../../components/ui/popover/Popover.vue'
import PopoverTrigger from '../../components/ui/popover/PopoverTrigger.vue'
import PopoverContent from '../../components/ui/popover/PopoverContent.vue'
import Command from '../../components/ui/command/Command.vue'
import CommandInput from '../../components/ui/command/CommandInput.vue'
import CommandEmpty from '../../components/ui/command/CommandEmpty.vue'
import CommandList from '../../components/ui/command/CommandList.vue'
import CommandGroup from '../../components/ui/command/CommandGroup.vue'
import CommandItem from '../../components/ui/command/CommandItem.vue'
import { cn } from '../../lib/utils'


const media = ref<number>();
const mediaQuery = useGetMediaList({});
const open = ref(false)

const {handleSubmit, setValues, setFieldValue } = useForm({
  validationSchema: parameterSchema,
  initialValues: {
    entity_name: '',
    title: '',
    description: '',
    mediaId: undefined,
    family_name: ''
  }
})

const fontFamilies = [
  { label: "Inter (Moderne)", value: "Inter" },
  { label: "Roboto (Standard)", value: "Roboto" },
  { label: "Poppins (Arrondi)", value: "Poppins" },
  { label: "Montserrat (Géométrique)", value: "Montserrat" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Playfair Display (Élégant)", value: "Playfair Display" },
  { label: "Lora (Lecture)", value: "Lora" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "JetBrains Mono (Code)", value: "JetBrains Mono" },
  { label: "Fira Code", value: "Fira Code" },
  { label: "Bebas Neue (Impact)", value: "Bebas Neue" },
];

const { data: params, isLoading: isLoadingParams, isError: isErrorParams, error: errorParams } = useGetParameters()
const { mutate: updateParams, isPending: isSaving } = useUpdateParameters()

const previewImage = ref('')

const changeMedia = (id: number) => {
  media.value = id
  setFieldValue('mediaId', id)
  previewImage.value = mediaQuery?.data.value?.results?.find((m) => m.id === id)?.file_path || ''
}

const mediaType = computed(() => {
  return mediaQuery?.data.value?.results?.find((m) => m.id === media.value)?.type;
})


watch(params, (newParams) => {
  if (newParams) {
    setValues({
      entity_name: newParams.entity_name,
      title: newParams.title,
      description: newParams.description ?? '',
      mediaId: newParams.media?.id,
      family_name: newParams.family_name ?? ''
    })
    media.value = newParams.media?.id
    previewImage.value = newParams.media?.file_path || ''
  }
}, { immediate: true })

const onSave = handleSubmit(async (values) => {

  console.log(values);

  try {
    updateParams({
      ...values,
      mediaId: values.mediaId
    }, {
      onSuccess: () => showToast('success', 'Paramètres mis à jour avec succès'),
      onError: (error: Error) => showToast('error', error.message)
    })
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
})
</script>

<template>
  <div>
    <CompositionLoading v-if="isLoadingParams"/>
    <CompositionError v-else-if="isErrorParams" :error="getErrorMessage(errorParams)"/>

    <div class="card rounded-none p-6" v-else>
      <main v-if="!isLoadingParams">
        <div class="mx-auto max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-2">

          <div class="card flex flex-col gap-6 p-8 bg-background border border-border">
            <h2 class="text-text text-h1 font-semibold ">Logo du Site</h2>
            <div class="relative bg-muted rounded-lg overflow-hidden border border-border aspect-video flex items-center justify-center w-full">
              <img v-if="mediaType== 'image'" :src="previewImage || '/userIcon.png'" class="max-h-full max-w-full object-contain p-4" />
              <video v-else-if="mediaType== 'video'" autoplay loop :src="previewImage" class="max-h-full max-w-full object-contain p-4" />
            </div>
            <Field name="mediaId" v-slot="{ errorMessage }">
              <div class="flex flex-col gap-2">
                <div class="flex flex-row items-end gap-6">
                  <CompositionMediaPicker
                    :model-value="media"
                    :allowed-types="['image', 'video']"
                    @update:model-value="changeMedia"
                  />
                </div>
                <p v-if="errorMessage" class="text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
              </div>
            </Field>

            <Button @click="onSave" class="h-11  sm:w-auto text-white" :disabled="isSaving">
              <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
              <Save v-else class="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>

          <div class="card bg-background p-8 border border-border">
            <h2 class="text-text text-h1 font-semibold mb-6">Identité & SEO</h2>

            <div class="space-y-6">
              <Field name="entity_name" v-slot="{ field, errorMessage }">
                <div>
                  <label class="block text-text font-medium mb-2">Nom de l'entité</label>
                  <input v-bind="field" type="text" :class="['input-custom', { 'border-destructive': errorMessage }]" placeholder="Ex: Mon Entreprise">
                  <p v-if="errorMessage" class="mt-2 text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
                </div>
              </Field>

              <Field name="title" v-slot="{ field, errorMessage }">
                <div>
                  <label class="block text-text font-medium mb-2">Titre du site</label>
                  <input v-bind="field" type="text" :class="['input-custom', { 'border-destructive': errorMessage }]" placeholder="Ex: Bienvenue">
                  <p v-if="errorMessage" class="mt-2 text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
                </div>
              </Field>

              <Field name="description" v-slot="{ field, errorMessage }">
                <div>
                  <label class="block text-text font-medium mb-2">Description SEO</label>
                  <textarea v-bind="field" :class="['input-custom min-h-[100px] pt-2', { 'border-destructive': errorMessage }]" placeholder="Décrivez votre site..."></textarea>
                  <p v-if="errorMessage" class="mt-2 text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
                </div>
              </Field>

              <Field name="family_name" v-slot="{ value, handleChange, errorMessage }">
                <Popover v-model:open="open" >
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      role="combobox"
                      :aria-expanded="open"
                      class="input-custom justify-between w-full h-auto min-h-10 font-normal hover:bg-background"
                      :class="{ 'border-destructive': errorMessage }"
                    >
                      <div class="flex flex-wrap gap-1 text-left">
                        <span v-if="value">{{ value }}</span>
                        <span v-else >Sélectionner une Police de caractère</span>
                      </div>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent class="p-0 border-border">
                    <Command class="bg-background border !border-border">
                      <CommandInput class="font-mono" placeholder="Rechercher une police de caractère..." />
                      <CommandEmpty class="font-mono">Aucune police de caractère trouvée.</CommandEmpty>
                      <CommandList class="group custom-scrollbar">
                        <CommandGroup>
                          <CommandItem
                            v-for="p in fontFamilies"
                            :key="p.value"
                            :value="p.value"
                            @click="handleChange(p.value)"
                            class="cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-white group-hover:data-[highlighted]:bg-transparent group-hover:data-[highlighted]:text-foreground hover:!bg-primary hover:!text-white"
                            >
                            <Check
                              :class="cn(
                                'mr-2 h-4 w-4',
                                value === p.value ? 'opacity-100' : 'opacity-0'
                              )"
                            />
                              <div class="flex flex-col">

                                <span :style="{ fontFamily: p.value }">{{ p.label }}</span>
                                <span class="text-[10px] opacity-50">{{ p.value }}</span>

                              </div>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
