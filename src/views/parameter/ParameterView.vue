<script setup lang="ts">
import {Save, Loader2 } from 'lucide-vue-next'
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
              <video v-else-if="mediaType== 'video'" autoplay loop :src="previewImage" class="max-h-full max-w-full object-contain p-4" />
            </div>
            <Field name="mediaId" v-slot="{ errorMessage }">
              <div class="flex flex-col gap-2">
                <div class="flex flex-row items-end gap-6">
                  <CompositionMediaPicker
                    :model-value="media"
                    @update:model-value="changeMedia"
                  />
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
