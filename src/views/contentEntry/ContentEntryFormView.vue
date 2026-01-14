<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { buildZodSchema } from '../../validation/fieldsValidate'
import FormGenerator from '../../components/fields/FormGenerator.vue'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardTitle, CardHeader } from '../../components/ui/card'
import { useGetContentType } from '../../hook/content-type'
import { useCreateContentEntry } from '../../hook/content-entry'
import { userStore } from '../../stores/user'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import { ArrowLeft, Loader2, Eye, Calendar, Lock } from 'lucide-vue-next'
import type { IContentData } from '../../type/content-entry'
import { showToast } from '../../lib/toast'

const { data: contentTypes } = useGetContentType()
const { mutate: createEntry, isPending: isCreating } = useCreateContentEntry()
const store = userStore()
const router = useRouter()

// État
const formData = ref<IContentData>({})
const errors = ref<Record<string, string>>({})

// Schéma
const schema = computed(() => buildZodSchema(contentTypes.value?.fields_schema || []))

// Initialisation
watchEffect(() => {
  if (contentTypes.value?.fields_schema) {
    const newData: IContentData = { ...formData.value }
    contentTypes.value.fields_schema.forEach(field => {
      if (newData[field.name] === undefined) {
        newData[field.name] = field.defaultValue !== undefined ? field.defaultValue : null
      }
    })
    formData.value = newData
  }
})

// Tous les champs sont maintenant gérés par FormGenerator
const mainFields = computed(() => {
    return contentTypes.value?.fields_schema || []
})

const handleSubmit = (status: 'published' | 'draft' = 'published') => {
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

  if (!contentTypes.value?.id) return

  console.log('submit', {
    contentTypeId: contentTypes.value.id,
    userId: store.userInfo?.id || 0,
    data_json: {
        ...result.data,
        status: status // Si le backend supporte le statut
    }
  })

  createEntry({
    contentTypeId: contentTypes.value.id,
    userId: store.userInfo?.id || 0,
    data_json: {
        ...result.data,
        status: status // Si le backend supporte le statut
    }
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu enregistré avec succès')
      router.push({ name: 'admin.dashboard' })
    },
    onError: (error) => {
       showToast('error', "Erreur lors de l'enregistrement")
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
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Création de contenu</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Créer un contenu avec un formulaire dynamique.</p>
            </div>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="max-w-[1600px] mx-auto ">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-2">
            <!-- Colonne Principale (Gauche) -->
            <div class="lg:col-span-3 space-y-6">
                 <div class="card rounded-none p-6">
                     <FormGenerator
                        :fields="mainFields"
                        v-model="formData"
                        :errors="errors"
                     />
                 </div>
            </div>

            <!-- Colonne Latérale (Droite) -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Carte Publier -->
                <Card class="rounded-none shadow-sm border-border">
                    <CardHeader class="p-4 border-b border-border bg-muted/20">
                        <CardTitle class="text-sm font-bold">Publier</CardTitle>
                    </CardHeader>
                    <CardContent class="p-4 space-y-4">
                        <div class="flex justify-between items-center gap-2">
                             <Button variant="outline" size="sm" class="h-8" @click="handleSubmit('draft')">
                                Enregistrer brouillon
                             </Button>
                             <Button variant="outline" size="sm" class="h-8">
                                Prévisualiser
                             </Button>
                        </div>

                        <div class="space-y-3 py-4 text-sm text-muted-foreground">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <Lock class="w-4 h-4" /> État :
                                </div>
                                <span class="font-medium text-text">Brouillon</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <Eye class="w-4 h-4" /> Visibilité :
                                </div>
                                <span class="font-medium text-text">Public</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <Calendar class="w-4 h-4" /> Publier :
                                </div>
                                <span class="font-medium text-text">Tout de suite</span>
                            </div>
                        </div>
                    </CardContent>
                    <div class="p-4 bg-muted/20 border-t border-border flex justify-end">
                        <Button @click="() => handleSubmit('published')" :disabled="isCreating">
                             <Loader2 v-if="isCreating" class="w-4 h-4 mr-2 animate-spin" />
                             Publier
                        </Button>
                    </div>
                </Card>

            </div>
        </div>
    </div>
  </div>
</template>
