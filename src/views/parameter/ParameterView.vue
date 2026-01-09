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
import Popover from '../../components/ui/popover/Popover.vue'
import PopoverTrigger from '../../components/ui/popover/PopoverTrigger.vue'
import { useGetMediaList } from '../../hook/media'
import PopoverContent from '../../components/ui/popover/PopoverContent.vue'
import Command from '../../components/ui/command/Command.vue'
import CommandInput from '../../components/ui/command/CommandInput.vue'
import CommandEmpty from '../../components/ui/command/CommandEmpty.vue'
import CommandList from '../../components/ui/command/CommandList.vue'
import CommandGroup from '../../components/ui/command/CommandGroup.vue'
import CommandItem from '../../components/ui/command/CommandItem.vue'
import { cn } from '../../lib/utils'

const open = ref(false);
const media = ref<number>();
const mediaQuery = useGetMediaList({});

const {handleSubmit, setValues, setFieldValue } = useForm({
  validationSchema: parameterSchema,
  initialValues: {
    entity_name: '',
    title: '',
    description: '',
    mediaId: undefined
  }
})

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
      mediaId: newParams.media?.id
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
              <video v-else-if="mediaType== 'video'" autoplay :src="previewImage" class="max-h-full max-w-full object-contain p-4" />
            </div>
            <Field name="mediaId" v-slot="{ errorMessage }">
              <div class="flex flex-col gap-2">
                <div class="flex flex-row items-end gap-6">
                  <Popover v-model:open="open" class="w-full">
                    <PopoverTrigger as-child>
                      <Button
                        ref="triggerRef"
                        variant="outline"
                        role="combobox"
                        :aria-expanded="open"
                        :class="cn('input-custom justify-between w-full font-normal h-8', { 'border-destructive': errorMessage })"
                      >
                        {{ mediaQuery?.data.value?.results?.find((m) => m.id === media)
                            ? mediaQuery?.data.value?.results?.find((m) => m.id === media)?.alt
                            : "Sélectionner un media..."
                        }}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent >
                      <Command>
                        <CommandInput placeholder="Rechercher un media..." />
                        <CommandEmpty>Aucun media trouvé.</CommandEmpty>

                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              v-for="m in mediaQuery?.data.value?.results"
                              :key="m.id"
                              :value="m.id"
                              class="select-item-custom cursor-pointer"
                              @select="() => {
                                changeMedia(m.id)
                                open = false
                              }"
                            >
                              <Check
                                :class="cn(
                                  'mr-2 h-4 w-4',
                                  media === m.id ? 'opacity-100' : 'opacity-0'
                                )"
                              />
                              <img v-if="m.type === 'image'" :src="m.file_path" alt="" class="w-12 contain-cover"/>
                              <video v-else-if="m.type === 'video'" autoplay muted :src="m.file_path" class="w-12 contain-cover" />
                              {{ m.alt }}
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <p v-if="errorMessage" class="text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
              </div>
            </Field>
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

              <Button @click="onSave" class="h-11 w-full sm:w-auto text-white" :disabled="isSaving">
                <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
                <Save v-else class="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
