<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter, } from 'vue-router'
import { buildZodSchema } from '../../validation/fieldsValidate'
import FormGenerator from '../../components/fields/FormGenerator.vue'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardTitle, CardHeader } from '../../components/ui/card'
import { useUpdateContentEntry, useGetContentEntry } from '../../hook/content-entry'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import { ArrowLeft, Loader2, Lock } from 'lucide-vue-next'
import  { EntryStatus, type IContentData, type UpdateContentEntry } from '../../type/content-entry'
import { showToast } from '../../lib/toast'
import CompositionError from '../../components/composition/CompositionError.vue'
import { getErrorMessage } from '../../lib/errorMessage'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'

const router = useRouter()

const entryId = computed(() => Number(router.currentRoute.value.params.id))

const { data: contentEntry, isLoading: isLoadingEntry, error: entryError } = useGetContentEntry(entryId.value)


const { mutate: updateEntry, isPending: isUpdating } = useUpdateContentEntry()

const formData = ref<IContentData>({})
const errors = ref<Record<string, string>>({})

const schema = computed(() => buildZodSchema(contentEntry.value?.contentType?.fields_schema || []))

watchEffect(() => {
  if (contentEntry.value && contentEntry.value.contentType?.fields_schema) {
    const newData: IContentData = { ...formData.value }

    if (contentEntry.value.data_json) {
       Object.assign(newData, contentEntry.value.data_json)
    }
    contentEntry.value.contentType?.fields_schema.forEach(field => {
      if (newData[field.name] === undefined) {
        newData[field.name] = field.defaultValue !== undefined ? field.defaultValue : null
      }
    })

    formData.value = newData
  }
})

const mainFields = computed(() => {
    return contentEntry.value?.contentType?.fields_schema || []
})

const handleSubmit = (status: EntryStatus) => {
  errors.value = {}
  const result = schema.value.safeParse(formData.value)

  if (!result.success) {
    result.error.issues.forEach(issue => {
      const path = issue.path[0] as string
      errors.value[path] = issue.message
    })
    showToast('error', 'Veuillez corriger les erreurs du formulaire')
    return
  }

  if (!contentEntry.value?.contentType?.id || !contentEntry.value?.id) return

  const updateData: UpdateContentEntry = {
    contentTypeId: contentEntry.value.contentType.id,
    status: status,
    data_json: result.data,
  }

  updateEntry({
    id: contentEntry.value.id,
    data: updateData,
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu mis à jour avec succès')
      router.back()
    },
    onError: (error) => {
       showToast('error', getErrorMessage(error))
       console.error(error)
    }
  })
}
</script>

<template>
  <div class="space-y-8">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex gap-4 items-center">
            <div
              class="hover:cursor-pointer hover:text-primary"
              @click="$router.back()"
            >
              <ArrowLeft />
            </div>
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Modification de contenu {{ contentEntry?.data_json.title }}</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Modifier une entrée de contenu existante.</p>
            </div>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div v-if="isLoadingEntry">
      <CompositionLoading />
    </div>

    <div v-else-if="entryError">
      <CompositionError :error="getErrorMessage(entryError)" />
    </div>

    <div v-else class="max-w-[1600px] mx-auto ">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-2">
            <div class="lg:col-span-3 space-y-6">
                 <div class="card rounded-none p-6">
                     <FormGenerator
                        :fields="mainFields"
                        v-model="formData"
                        :errors="errors"
                     />
                 </div>
            </div>

            <div class="lg:col-span-1 space-y-6">
                <Card class="rounded-none shadow-sm border-border">
                    <CardHeader class="p-4 border-b border-border bg-muted/20">
                        <CardTitle class="text-sm font-bold">Publier</CardTitle>
                    </CardHeader>
                    <CardContent class="p-4 space-y-4">
                        <div class="flex justify-between items-center gap-2">
                             <Button variant="outline" size="sm" class="h-8" @click="handleSubmit(EntryStatus.DRAFT)">
                                Enregistrer brouillon
                             </Button>
                        </div>

                        <div class="space-y-3 py-4 text-sm text-muted-foreground">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <Lock class="w-4 h-4" /> État actuel :
                                </div>
                                <span class="font-medium text-primary">{{ contentEntry?.status }}</span>
                            </div>
                        </div>
                    </CardContent>
                    <div class="p-4 border-t border-border flex justify-end">
                        <Button @click="() => handleSubmit(EntryStatus.PUBLISHED)" :disabled="isUpdating" class="text-white">
                             <Loader2 v-if="isUpdating" class="w-4 h-4 mr-2 animate-spin" />
                             Mettre à jour
                        </Button>

                    </div>
                </Card>

            </div>
        </div>
    </div>
  </div>
</template>
