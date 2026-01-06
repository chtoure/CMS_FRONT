<script setup lang="ts">
import { Pencil, Save, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { ref, watch } from 'vue'
import { useForm, Field } from 'vee-validate'
import { useGetParameters, useUpdateParameters } from '../../hook/parameter'
import { useCreateMedia } from '../../hook/media'
import { showToast } from '../../lib/toast'
import CompositionLoading from '@/components/composition/CompositionLoading.vue'
import { getErrorMessage } from '../../lib/errorMessage'
import CompositionError from '@/components/composition/CompositionError.vue'
import { validationSchema } from '../../validation/parameterValidate'

const { handleSubmit, setValues } = useForm({
  validationSchema,
  initialValues: {
    entity_name: '',
    title: '',
    description: '',
    logo: ''
  }
})

const { data: params, isLoading: isLoadingParams, isError: isErrorParams, error: errorParams } = useGetParameters()
const { mutate: updateParams, isPending: isSaving } = useUpdateParameters()
const { mutateAsync: uploadMedia } = useCreateMedia()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewImage = ref('')


watch(params, (newParams) => {
  if (newParams) {
    setValues({
      entity_name: newParams.entity_name,
      title: newParams.title,
      description: newParams.description ?? '',
      logo: newParams.logo
    })
    previewImage.value = newParams.logo
  }
}, { immediate: true })

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const onSave = handleSubmit(async (values) => {
  try {
    let finalLogoPath = values.logo

    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      const newMedia = await uploadMedia(formData)
      finalLogoPath = newMedia.file_path
    }

    updateParams({
      ...values,
      logo: finalLogoPath || ''
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

          <div class="card p-8 bg-background border border-border">
            <h2 class="text-text text-h1 font-semibold mb-6">Logo du Site</h2>
            <div class="flex flex-row items-end gap-6">
              <div class="relative bg-muted rounded-lg overflow-hidden border border-border aspect-video flex items-center justify-center w-full">
                <img :src="previewImage || '/userIcon.png'" class="max-h-full max-w-full object-contain p-4" />
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
              <Button variant="outline" class="h-10" @click="triggerFileInput">
                <Pencil class="w-4 h-4 mr-2" /> Changer
              </Button>
            </div>
          </div>

          <div class="card bg-background p-8 border border-border">
            <h2 class="text-text text-h1 font-semibold mb-6">Identité & SEO</h2>

            <div class="space-y-6">
              <Field name="entity_name" v-slot="{ field, errorMessage }">
                <div>
                  <label class="block text-text font-medium mb-2">Nom de l'entité</label>
                  <input v-bind="field" type="text" :class="['input-custom', { 'border-destructive': errorMessage }]" placeholder="Ex: Mon Entreprise">
                  <p v-if="errorMessage" class="text-destructive text-xs mt-1">{{ errorMessage }}</p>
                </div>
              </Field>

              <Field name="title" v-slot="{ field, errorMessage }">
                <div>
                  <label class="block text-text font-medium mb-2">Titre du site</label>
                  <input v-bind="field" type="text" :class="['input-custom', { 'border-destructive': errorMessage }]" placeholder="Ex: Bienvenue">
                  <p v-if="errorMessage" class="text-destructive text-xs mt-1">{{ errorMessage }}</p>
                </div>
              </Field>

              <Field name="description" v-slot="{ field, errorMessage }">
                <div>
                  <label class="block text-text font-medium mb-2">Description SEO</label>
                  <textarea v-bind="field" :class="['input-custom min-h-[100px] pt-2', { 'border-destructive': errorMessage }]" placeholder="Décrivez votre site..."></textarea>
                  <p v-if="errorMessage" class="text-destructive text-xs mt-1">{{ errorMessage }}</p>
                </div>
              </Field>

              <Button @click="onSave" class="h-11 w-full sm:w-auto" :disabled="isSaving">
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
