<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { buildZodSchema } from '../../validation/fieldsValidate'
import FormGenerator from '../../components/fields/FormGenerator.vue'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { useGetContentType } from '../../hook/content-type'
import { useCreateContentEntry } from '../../hook/content-entry'
import { userStore } from '../../stores/user'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import { ArrowLeft, Save, Loader2 } from 'lucide-vue-next'
import type { IContentData } from '../../type/content-entry'

const { data: contentTypes } = useGetContentType()
const { mutate: createEntry, isPending: isCreating } = useCreateContentEntry()
const store = userStore()
const router = useRouter()

// 2. État du formulaire
const formData = ref<IContentData>({})
const errors = ref<Record<string, string>>({})

// 3. Schéma de validation (Réactif)
const schema = computed(() => buildZodSchema(contentTypes.value?.fields_schema || []))

// Initialisation des données quand les types sont chargés
watchEffect(() => {
  if (contentTypes.value?.fields_schema) {
    const newData: IContentData = { ...formData.value }
    contentTypes.value.fields_schema.forEach(field => {
      if (newData[field.name] === undefined) {
        // Valeur par défaut si définie, sinon null
        newData[field.name] = field.defaultValue !== undefined ? field.defaultValue : null
      }
    })
    formData.value = newData
  }
})

const handleSubmit = () => {
  errors.value = {}

  const result = schema.value.safeParse(formData.value)

  if (!result.success) {
    result.error.issues.forEach(issue => {
      const path = issue.path[0] as string
      errors.value[path] = issue.message
    })
    console.error('Validation échouée', errors.value)
    return
  }

  if (!contentTypes.value?.id) {
    console.error('ID de type de contenu non trouvé')
    return
  }

  createEntry({
    contentTypeId: contentTypes.value.id,
    userId: store.userInfo?.id || 0,
    data_json: result.data
  }, {
    onSuccess: () => {
      console.log('Contenu créé avec succès')
      router.push({ name: 'admin.dashboard' })
    },
    onError: (error) => {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du contenu.')
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
    <div class="card rounded-none">
      <Card class="border-none rounded-none bg-transparent">
        <CardHeader>
          <CardTitle>Générateur de Formulaire</CardTitle>
          <CardDescription>
            Formulaire généré dynamiquement à partir de vos champs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormGenerator
            :fields="contentTypes?.fields_schema || []"
            v-model="formData"
            :errors="errors"
          />
        </CardContent>
        <CardFooter class="flex justify-end pt-3">
          <Button @click="handleSubmit" :disabled="isCreating">
            <Loader2 v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ isCreating ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </CardFooter>
      </Card>

      <div class="mt-10 p-4 bg-muted rounded-md overflow-auto max-h-[400px] ">
        <h3 class="font-bold mb-2">État des données (debug):</h3>
        <pre class="text-xs">{{ formData }}</pre>

        <h3 class="font-bold mt-4 mb-2 text-destructive">Erreurs:</h3>
        <pre class="text-xs">{{ errors }}</pre>
      </div>
    </div>
  </div>
</template>
