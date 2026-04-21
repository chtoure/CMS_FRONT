<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Tags,
  Save,
  Undo2,
  Plus,
  X,
  Tag,
  Settings2
} from 'lucide-vue-next'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import Button from '../../components/ui/button/Button.vue'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { showToast } from '../../lib/toast'
import { taxonomySchema, type TaxonomyFormData } from '../../validation/taxonomyValidate'
import { useRegisterTaxonomy, useUpdateTaxonomy, useGetTaxonomy } from '../../hook/taxonomy'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'
import { handleError } from '../../lib/error'

const router = useRouter()
const route = useRoute()

// Détection du mode édition
const taxonomyId = computed(() => route.params.id as string)
const isEditing = computed(() => !!taxonomyId.value)

// État du formulaire
const form = ref<TaxonomyFormData>({
  name: '',
  slug: '',
  description: '',
  terms: []
})

// État pour l'ajout d'un nouveau terme
const newTerm = ref('')

// État des erreurs
const errors = ref<Record<string, string>>({})

// Hooks API
const { mutateAsync: registerTaxonomy, isPending: isRegistering } = useRegisterTaxonomy()
const { mutateAsync: updateTaxonomy, isPending: isUpdating } = useUpdateTaxonomy()

// Récupération des données en mode édition
const { data: existingTaxonomy, isLoading: isFetching } = useGetTaxonomy(taxonomyId)

// Remplissage du formulaire si on est en mode édition
watch(existingTaxonomy, (data) => {
  if (data) {
    form.value = {
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      terms: data.terms?.map((t) => typeof t === 'string' ? t : t.name) || []
    }
  }
}, { immediate: true })

// Auto-génération du slug
watch(() => form.value.name, (newName) => {
    if (!isEditing.value) {
      form.value.slug = newName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    }
})

// Gestion des termes
const addTerm = () => {
  const termToAdd = newTerm.value.trim()
  if (!termToAdd) return

  if (form.value.terms?.includes(termToAdd)) {
    showToast('error', 'Ce terme existe déjà')
    return
  }

  if (!form.value.terms) form.value.terms = []
  form.value.terms.push(termToAdd)
  newTerm.value = ''
}

const removeTerm = (index: number) => {
  form.value.terms?.splice(index, 1)
}

// Soumission
const handleSubmit = async () => {
  errors.value = {}

  const result = taxonomySchema.safeParse(form.value)

  if (!result.success) {
    const formattedErrors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string
      if (!formattedErrors[path]) {
        formattedErrors[path] = issue.message
      }
    })
    errors.value = formattedErrors
    showToast('error', 'Veuillez corriger les erreurs')
    return
  }

  try {
    if (isEditing.value) {
      await updateTaxonomy({
        id: Number(taxonomyId.value),
        ...form.value
      })
      showToast('success', 'categorie mise à jour')
    } else {
      await registerTaxonomy(form.value)
      showToast('success', 'categorie créée')
    }
    router.push({ name: 'admin.taxonomies' })
  } catch (error: unknown) {
    handleError(error)
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <CompositionLoading v-if="isRegistering || isUpdating || isFetching" />

  <div v-else class="space-y-8">
    <CompositionPageHeader>
      <template #content>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="flex gap-4 items-center">
            <div class="p-3 bg-primary rounded-2xl">
                <Tags stroke-width="1" class="w-8 h-8" />
            </div>
            <div>
                <h1 class="text-3xl font-black tracking-tighter leading-none">
                    <span class="text-primary italic">{{ isEditing ? 'Modifier la Catégorie' : 'Créer une Catégorie' }}</span>
                </h1>
                <p class="text-muted-foreground text-sm font-medium mt-1 italic">Organiser vos groupes de catégories pour trier vos contenus</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button variant="outline" @click="handleCancel" class="rounded-xl h-12 px-6 font-bold hover:bg-muted active:scale-95">
              <Undo2 class="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button @click="handleSubmit" class="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95">
              <Save class="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <!-- Informations Générales (Style UserFormView) -->
        <div class="md:col-span-2 space-y-8 p-8 card rounded-none">
          <div class="space-y-6">
            <p class="text-lg font-bold text-text flex items-center gap-2">
              <Settings2 class="size-5" /> Informations générales
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="name" class="text-sm font-medium text-text px-1">Nom</Label>
                <div class="relative">
                  <Input
                    id="name"
                    v-model="form.name"
                    placeholder="Ex: Categorie, Régions..."
                    class="input-custom"
                    :class="{ 'border-destructive': errors.name }"
                  />
                </div>
                <p v-if="errors.name" class="text-xs text-destructive px-1 font-medium italic">{{ errors.name }}</p>
              </div>

              <div class="space-y-2">
                <Label for="slug" class="text-sm font-medium text-text px-1">Identifiant</Label>
                <Input
                  id="slug"
                  v-model="form.slug"
                  placeholder="identifiant-unique"
                  class="input-custom cursor-not-allowed"
                  :disabled="isEditing"
                  :class="{ 'border-destructive': errors.slug }"
                />
                <p v-if="errors.slug" class="text-xs text-destructive px-1 font-medium italic">{{ errors.slug }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="description" class="text-sm font-medium text-text px-1">Description</Label>
              <textarea
                id="description"
                :rows="4"
                v-model="form.description"
                placeholder="Décrivez l'usage de cette categorie..."
                class="input-custom min-h-20"
                :class="{ 'border-destructive': errors.description }"
              />
              <p v-if="errors.description" class="text-xs text-destructive px-1 font-medium italic">{{ errors.description }}</p>
            </div>
          </div>
        </div>

        <!-- Sidebar - Gestion des Termes -->
        <div class="space-y-6">
          <div class="p-6 space-y-6 card rounded-none border border-border">
            <h3 class="font-bold flex items-center gap-2 text-text">
              <Tag class="w-5 h-5" />
              Termes associés
            </h3>

            <div class="space-y-4">
              <div class="flex gap-2">
                <Input
                  v-model="newTerm"
                  placeholder="Ajouter un terme..."
                  class="input-custom"
                  @keyup.enter="addTerm"
                />
                <Button @click="addTerm" size="icon" class="rounded-xl shrink-0">
                  <Plus class="w-4 h-4 text-white" />
                </Button>
              </div>

              <div class="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2">
                <div
                  v-for="(term, index) in form.terms"
                  :key="index"
                  class="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-sm font-medium animate-in zoom-in-95"
                >
                  {{ term }}
                  <button @click="removeTerm(index)" class="hover:text-destructive">
                    <X class="w-3 h-3" />
                  </button>
                </div>
                <div v-if="!form.terms?.length" class="text-sm text-muted-foreground italic w-full text-center py-4">
                  Aucun terme ajouté
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-border">
              <p class="text-xs text-muted-foreground leading-relaxed">
                Les termes sont les valeurs possibles pour cette categorie (ex: pour "vehicule", les termes pourraient être "voiture", "moto", "camion", etc).
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer (Mobile version / duplication) -->
      <div class="flex justify-end gap-4 pb-10">
        <Button variant="outline" @click="handleCancel" class="rounded-xl h-12 px-8 font-bold bg-destructive hover:bg-destructive hover:text-white text-white">
          Annuler
        </Button>
        <Button @click="handleSubmit" class="rounded-xl h-12 px-10 bg-primary text-white font-bold shadow-lg">
          <Save class="w-4 h-4 mr-2" />
          {{ isEditing ? 'Mettre à jour' : 'Créer la categorie' }}
        </Button>
      </div>
    </div>
  </div>
</template>
