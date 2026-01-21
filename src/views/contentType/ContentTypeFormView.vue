<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Settings2,
  CheckCircle2,
  X,
  Type,
  Hash,
  FileText,
  Image as ImageIcon,
  Tag as TagIcon,
  ToggleLeft,
  List,
  Link2,
  Save,
  Undo2
} from 'lucide-vue-next'
import {
  FieldType,
  type IFieldDefinition,
  type ISelectConfig,
  type ITaxonomyConfig,
  type IRelationConfig,
  type IMediaConfig,
  type ITextConfig,
  type INumberConfig,
  type IRichTextConfig
} from '../../type/field'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import Button from '../../components/ui/button/Button.vue'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import BaseSwitch from '../../components/base/BaseSwitch.vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { showToast } from '../../lib/toast'
import { contentTypeSchema } from '../../validation/contentTypeValidate'
import { useRegisterContentType, useGetContentTypes } from '../../hook/content-type'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'
import { handleError } from '../../lib/error'
import {useGetTaxonomiesNoPaginate} from '../../hook/taxonomy'


const router = useRouter()

// État du formulaire principal
const form = ref({
  name: '',
  slug: '',
  description: '',
  archive: false
})

const isFieldsExpanded = ref(true)

// État des erreurs de validation
const errors = ref<Record<string, string>>({})

// Liste des champs (fields_schema)
// On utilise any[] pour le ref pour éviter l'erreur d'instanciation trop profonde de TS avec Vue + Unions complexes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fields = ref<any[]>([
  {
    type: FieldType.TEXT,
    name: 'title',
    label: '',
    placeholder: 'Saisir le titre',
    required: true
  }
])

const messageErrorTypeChamp = ref('');


const {
  mutateAsync: registerContentType,
  isPending: isRegistering,
} = useRegisterContentType()


const {
  data: contentTypes,
  isPending: isContentTypesLoading,
} = useGetContentTypes()


const {
  data: taxonomies,
  isPending: isTaxonomiesLoading,
} = useGetTaxonomiesNoPaginate()

const visibleFields = computed(() => fields.value.slice(1))



// Auto-générer le slug à partir du nom
watch(() => form.value.name, (newName) => {
  if (newName) {
    form.value.slug = newName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
})

// Gestion de l'expansion des champs (index ou ID)
const expandedFieldIndex = ref<number | null>(null)

const toggleExpand = (index: number) => {
  expandedFieldIndex.value = expandedFieldIndex.value === index ? null : index
}

// Types de champs disponibles avec métadonnées UI
const fieldTypes = [
  { type: FieldType.TEXT, label: 'Texte', icon: Type, description: 'Champ de texte court' },
  { type: FieldType.RICH_TEXT, label: 'Zone de texte (Riche)', icon: FileText, description: 'Éditeur de texte WYSIWYG' },
  { type: FieldType.NUMBER, label: 'Nombre', icon: Hash, description: 'Entrées numériques' },
  { type: FieldType.MEDIA, label: 'Média', icon: ImageIcon, description: 'Images, vidéos ou fichiers' },
  { type: FieldType.TAXONOMY, label: 'Categorie', icon: TagIcon, description: 'Catégories ou étiquettes' },
  { type: FieldType.BOOLEAN, label: 'Vrai/Faux', icon: ToggleLeft, description: 'Interrupteur oui/non' },
  { type: FieldType.SELECT, label: 'Sélection', icon: List, description: 'Liste déroulante' },
  { type: FieldType.RELATION, label: 'Relation', icon: Link2, description: 'Lien vers un autre type de contenu' },
]

// Ajouter un nouveau champ
const addField = () => {
  const baseName = 'champ'
  let index = fields.value.length + 1
  let newName = `${baseName}_${index}`


  // S'assurer que le nom est unique
  while (fields.value.some(f => f.name === newName)) {
    newName = `${baseName}_${++index}`
  }

  const newField: IFieldDefinition = {
    type: FieldType.TEXT,
    name: newName,
    label: '',
    required: false,
    placeholder: '',
    description: ''
  }

  fields.value.push(newField)
  expandedFieldIndex.value = fields.value.length - 1
}

const fieldTypesList = computed(() => {
  const types: FieldType[] = []
  for (const f of fields.value) {
    types.push(f.type)
  }
  return types
})

// Watcher pour initialiser les props quand le type change
watch(fieldTypesList, (newTypes) => {
  messageErrorTypeChamp.value = "";
  newTypes.forEach((type, index) => {
    const field = fields.value[index]
    if (!field) return
    if (type === FieldType.SELECT) {
      const selectField = field as ISelectConfig
      if (!selectField.options) selectField.options = []
      if (selectField.multiple === undefined) selectField.multiple = false
    }
    if (type === FieldType.TAXONOMY) {
      const taxonomyField = field as ITaxonomyConfig
      if (!taxonomyField.taxonomy_slug) {
        taxonomyField.taxonomy_slug = ''
        taxonomyField.renderType = 'combobox'
        taxonomyField.multiple = false
      }
      if (taxonomyField.multiple === undefined) taxonomyField.multiple = false
    }
    if (type === FieldType.RELATION) {
      const relationField = field as IRelationConfig
      if (!relationField.contentTypeId) {
        relationField.contentTypeId = 0
        relationField.multiple = false
      }
      if (relationField.multiple === undefined) relationField.multiple = false
    }
    if (type === FieldType.MEDIA) {
      const mediaField = field as IMediaConfig
      if (!mediaField.allowedTypes) {
        mediaField.allowedTypes = ['image']
        mediaField.multiple = false
      }
      if (mediaField.multiple === undefined) mediaField.multiple = false
    }
  })
}, { deep: true })



// Supprimer un champ
const removeField = (index: number) => {
  fields.value.splice(index, 1)
  if (expandedFieldIndex.value === index) expandedFieldIndex.value = null
}

// Dupliquer un champ
const duplicateField = (index: number) => {
  const source = fields.value[index]
  const duplicate = JSON.parse(JSON.stringify(source))

  let newName = `${duplicate.name}_copy`
  let suffix = 1
  while (fields.value.some(f => f.name === newName)) {
    newName = `${duplicate.name}_copy_${suffix++}`
  }

  duplicate.name = newName
  duplicate.label = duplicate.label ? `${duplicate.label} (Copie)` : ''
  fields.value.splice(index + 1, 0, duplicate)
  expandedFieldIndex.value = index + 1
}

// Utilitaires de rendu
const getFieldTypeIcon = (type: FieldType) => {
  return fieldTypes.find(t => t.type === type)?.icon || Type
}

const getFieldTypeLabel = (type: FieldType) => {
  return fieldTypes.find(t => t.type === type)?.label || type
}




// Nettoyage performant des champs pour respecter les interfaces de field.ts
const cleanedFields = (fields: IFieldDefinition[]): IFieldDefinition[] => {
  return fields.map((f): IFieldDefinition => {
    const base = {
      type: f.type,
      name: f.name,
      label: f.label,
      required: f.required,
      placeholder: f.placeholder,
      description: f.description,
    }


    if (f.type===FieldType.RELATION) {
      if (f.contentTypeId === 0) {
        messageErrorTypeChamp.value = 'Veuillez selectionner un type de contenu'
      } else {
        messageErrorTypeChamp.value = ''
      }
    }


    if (f.type===FieldType.TAXONOMY) {
      if (f.taxonomy_slug === '') {
        messageErrorTypeChamp.value = 'Veuillez selectionner une categorie'
      } else {
        messageErrorTypeChamp.value = ''
      }
    }


    switch (f.type) {
      case FieldType.TEXT:
        return { ...base, type: FieldType.TEXT, minLength: f.minLength, maxLength: f.maxLength, pattern: f.pattern, defaultValue: f.defaultValue }
      case FieldType.NUMBER:
        return { ...base, type: FieldType.NUMBER, min: f.min, max: f.max, step: f.step, defaultValue: f.defaultValue }
      case FieldType.MEDIA:
        return { ...base, type: FieldType.MEDIA, allowedTypes: f.allowedTypes, multiple: f.multiple, maxSize: f.maxSize, defaultValue: f.defaultValue }
      case FieldType.TAXONOMY:
        return { ...base, type: FieldType.TAXONOMY, taxonomy_slug: f.taxonomy_slug, multiple: f.multiple, renderType: f.renderType, defaultValue: f.defaultValue }
      case FieldType.SELECT:
        return { ...base, type: FieldType.SELECT, options: f.options, multiple: f.multiple, defaultValue: f.defaultValue }
      case FieldType.RICH_TEXT:
        return { ...base, type: FieldType.RICH_TEXT, toolbar: f.toolbar, defaultValue: f.defaultValue }
      case FieldType.RELATION:
        return { ...base, type: FieldType.RELATION, contentTypeId: f.contentTypeId, multiple: f.multiple, defaultValue: f.defaultValue }
      case FieldType.BOOLEAN:
        return { ...base, type: FieldType.BOOLEAN, defaultValue: typeof f.defaultValue === 'boolean' ? f.defaultValue : undefined }
      default:
        return f
    }
  })
}




// Soumission
const handleSubmit = () => {
  errors.value = {}

  const result = contentTypeSchema.safeParse(form.value)

  if (!result.success) {
    const formattedErrors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string
      if (!formattedErrors[path]) {
        formattedErrors[path] = issue.message
      }
    })
    errors.value = formattedErrors
    showToast('error', 'Veuillez corriger les erreurs dans la configuration de base')
    return
  }


  if (visibleFields.value.length === 0) {
    showToast('error', 'Veuillez ajouter au moins un champ personnalisé')
    return
  }

  // Nettoyage des champs
  const NetoyageFields = cleanedFields(fields.value as IFieldDefinition[])

  if (messageErrorTypeChamp.value.length > 0) {
    showToast('error', messageErrorTypeChamp.value)
    return
  }

  const payload = {
    ...form.value,
    fields_schema: NetoyageFields
  }

  console.log('Payload nettoyé:', payload)
  registerContentType(
    payload,{
      onSuccess: () => {
        showToast('success', 'Type de contenu créé avec succès')
        router.push({name: 'admin.content-types'})
      },
      onError: (error) => {
        handleError(error)
      }
    }
  )

}

const handleCancel = () => {
  router.back()
}


</script>

<template>

  <CompositionLoading v-if="isRegistering || isContentTypesLoading || isTaxonomiesLoading" />

  <div v-else class="min-h-screen space-y-10">
    <CompositionPageHeader>
      <template #content>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-4">
            <div class="p-4 bg-primary/10 rounded-2xl">
              <Settings2 class="h-8 w-8 text-primary" />
            </div>
            <div class="space-y-1">
              <h1 class="text-huge font-black tracking-tighter leading-none">
                <span class="text-primary italic">Créer un type de contenu</span>
              </h1>
              <p class="text-background opacity-80 text-lg font-medium">Définissez la structure et les champs de vos données.</p>
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

    <div class="px-4 space-y-8">
      <!-- Section Configuration de Base -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="md:col-span-2 space-y-6 p-8 card rounded-none">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="name" class="text-sm font-bold  text-text px-1">Nom du Type</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  placeholder="Ex: Articles, Produits..."
                  class="input-custom"
                  :class="{ 'border border-destructive': errors.name }"
                />
                <p v-if="errors.name" class="text-xs text-destructive px-1 font-medium italic animate-in slide-in-from-top-1">{{ errors.name }}</p>
              </div>
              <div class="space-y-2">
                <Label for="slug" class="text-sm font-bold  text-text px-1">Slug (Identifiant)</Label>
                <Input
                  id="slug"
                  v-model="form.slug"
                  placeholder="identifiant-unique"
                  class="input-custom"
                  :class="{ 'border border-destructive': errors.slug }"
                />
                <p v-if="errors.slug" class="text-xs text-destructive px-1 font-medium italic animate-in slide-in-from-top-1">{{ errors.slug }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="description" class="text-sm font-bold  text-text px-1">Description</Label>
              <textarea
                id="description"
                :rows="4"
                v-model="form.description"
                placeholder="Décrivez à quoi sert ce type de contenu..."
                class="input-custom h-20"
                :class="{ 'border border-destructive': errors.description }"
              />
              <p v-if="errors.description" class="text-xs text-destructive px-1 font-medium italic animate-in slide-in-from-top-1">{{ errors.description }}</p>
            </div>
          </div>
        </div>

        <!-- Sidebar options -->
        <div class="space-y-6">
          <div class=" p-6 space-y-4 card rounded-none">
            <h3 class="font-bold flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-success" />
              Statut & Options
            </h3>
            <div class="flex items-center justify-between p-3 rounded-xl hover:bg-muted/10 transition-colors">
              <span class="text-sm font-medium">Activer l'archivage</span>
              <BaseSwitch v-model="form.archive" />
            </div>
            <p class="p12 text-text leading-relaxed px-1">
              Les types archivés ne sont plus visibles dans le menu de création mais conservent leurs données existantes.
            </p>
          </div>
        </div>
      </section>

      <!-- Section Gestion des Champs -->
      <section class="card rounded-none overflow-hidden">
        <div
          class="flex items-center justify-between p-4 border-b border-border bg-card cursor-pointer hover:bg-muted/5 transition-colors"
          @click="isFieldsExpanded = !isFieldsExpanded"
        >
          <div class="flex items-center gap-2 font-bold text-text">
            <Settings2 class="w-5 h-5 text-text" />
            Champs
          </div>
          <ChevronUp
            class="w-5 h-5 text-text transition-transform duration-300"
            :class="{ 'rotate-180': !isFieldsExpanded }"
          />
        </div>

        <div v-show="isFieldsExpanded">
          <!-- Header de la "table" -->
        <div class="grid grid-cols-[80px_1fr_1fr_1fr] px-6 py-3 bg-muted/20 border-b border-border text-xs font-bold text-text">
          <div>N°</div>
          <div>Libellé</div>
          <div>Nom</div>
          <div>Type</div>
        </div>

        <!-- Liste des Champs -->
        <div v-if="visibleFields.length > 0" class="divide-y divide-border">
          <div
            v-for="(field, vIndex) in visibleFields"
            :key="fields.indexOf(field)"
            class="group"
          >
            <!-- Ligne du champ -->
            <div
              class="grid grid-cols-[80px_1fr_1fr_1fr] items-center px-6 py-4 cursor-pointer hover:bg-muted/5 transition-colors relative"
              :class="{ 'bg-primary/5': expandedFieldIndex === fields.indexOf(field) }"
              @click="toggleExpand(fields.indexOf(field))"
            >
              <!-- N° & Chevron -->
              <div class="flex items-center gap-3 text-text font-medium">
                <span class="w-4">{{ vIndex + 1 }}</span>
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedFieldIndex === fields.indexOf(field) }"
                />
              </div>

              <!-- Libellé -->
              <div class="flex flex-col">
                <span
                  class="font-bold text-primary hover:underline"
                >
                  {{ field.label || '(aucun libellé)' }}
                </span>
                <!-- Mini actions au survol ou si déplié -->
                <div v-if="expandedFieldIndex === fields.indexOf(field)" class="flex items-center gap-3 mt-1 text-[10px] font-bold text-primary animate-in fade-in slide-in-from-left-1">
                   <!-- <button @click.stop="toggleExpand(fields.indexOf(field))" class="hover:text-primary/70">Modifier</button>
                   <span class="text-border">|</span> -->
                   <button @click.stop="duplicateField(fields.indexOf(field))" class="hover:text-primary/70">Dupliquer</button>
                   <span class="text-border">|</span>
                   <!-- <button class="hover:text-primary/70 cursor-move">Déplacer</button>
                   <span class="text-border">|</span> -->
                   <button @click.stop="removeField(fields.indexOf(field))" class="text-destructive hover:text-destructive/70">Supprimer</button>
                </div>
              </div>

              <!-- Nom (Identifiant) -->
              <div class="text-muted-foreground font-medium">
                {{ field.name }}
              </div>

              <!-- Type -->
              <div class="flex items-center gap-2">
                <div class="p-1.5 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <component :is="getFieldTypeIcon(field.type)" class="w-3.5 h-3.5 text-primary/60" />
                </div>
                <span class="text-sm font-medium text-muted-foreground">
                  {{ getFieldTypeLabel(field.type) }}
                </span>
              </div>
            </div>

            <!-- Panel d'édition détaillé (Si déplié) -->
            <div
              v-if="expandedFieldIndex === fields.indexOf(field)"
              class="bg-muted/5 border-t border-border animate-in slide-in-from-top-2 duration-300"
            >
              <Tabs default-value="general" class="w-full">
                <TabsList class="w-full justify-start h-auto p-0 bg-transparent border border-border rounded-none">
                  <TabsTrigger value="general" class="px-8 py-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-text text-xs">
                    Général
                  </TabsTrigger>
                  <TabsTrigger value="validation" class="px-8 py-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-text text-xs">
                    Validation
                  </TabsTrigger>
                </TabsList>

                <!-- Onglet Général -->
                <TabsContent value="general" class="p-8 space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Type de champ -->
                    <div class="col-span-1 space-y-3">
                      <Label class="text-xs font-medium text-text">Type de champ</Label>
                      <Select v-model="field.type">
                        <SelectTrigger class="input-custom">
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem v-for="ft in fieldTypes" :key="ft.type" :value="ft.type" class="select-item-custom">
                              <div class="flex items-center gap-2">
                                <component :is="ft.icon" class="w-4 h-4 text-primary" />
                                <span class="font-medium">{{ ft.label }}</span>
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Libellé & Nom -->
                    <div class="col-span-1 space-y-4">
                      <div class="space-y-2">
                        <Label class="text-xs font-medium text-text">Libellé du champ</Label>
                        <Input v-model="field.label" placeholder="Texte affiché à l'utilisateur" class="input-custom" />
                      </div>
                      <div class="space-y-2">
                        <Label class="text-xs font-medium text-text"> Placeholder </Label>
                        <Input v-model="field.placeholder" placeholder="Texte affiché en exemple" class="input-custom"/>
                      </div>
                    </div>
                  </div>

                  <!-- Options complémentaires selon type -->
                  <div class="pt-6 border-t border-border space-y-6">
                    <!-- Type SELECT : Gestion des options -->
                    <div v-if="field.type === FieldType.SELECT" class="space-y-4">
                      <div class="flex items-center justify-between">
                        <Label class="text-xs font-bold text-text">Options de sélection</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="(field as ISelectConfig).options.push('')"
                          class="text-text font-bold hover:bg-transparent hover:text-primary"
                        >
                          <Plus class="w-4 h-4 mr-1" /> Ajouter une option
                        </Button>
                      </div>
                      <div class="space-y-2">
                        <div v-for="(_, oIdx) in (field as ISelectConfig).options" :key="oIdx" class="flex gap-2 items-center">
                          <Select
                            :model-value="typeof (field as ISelectConfig).options[oIdx] === 'number' ? 'number' : 'string'"
                            @update:model-value="(val) => {
                              const options = (field as ISelectConfig).options;
                              const currentVal = options[oIdx];
                              if (val === 'number') {
                                options[oIdx] = isNaN(Number(currentVal)) ? 0 : Number(currentVal);
                              } else {
                                options[oIdx] = String(currentVal);
                              }
                            }"
                          >
                            <SelectTrigger class="h-10 w-28 text-xs border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string" class="select-item-custom">Texte</SelectItem>
                              <SelectItem value="number" class="select-item-custom">Nombre</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            :key="oIdx + '-' + typeof (field as ISelectConfig).options[oIdx]"
                            v-model="(field as ISelectConfig).options[oIdx]"
                            :type="typeof (field as ISelectConfig).options[oIdx] === 'number' ? 'number' : 'text'"
                            placeholder="Valeur de l'option"
                            class="input-custom"
                          />
                          <Button variant="ghost" size="icon" @click="(field as ISelectConfig).options.splice(oIdx, 1)" class="text-destructive">
                            <X class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <!-- Type TAXONOMY : Choix de la categorie -->
                    <div v-if="field.type === FieldType.TAXONOMY">
                      <div v-if="taxonomies && taxonomies.length > 0" class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <Label class="text-xs font-medium text-text">Categorie</Label>
                          <Select v-model="(field as ITaxonomyConfig).taxonomy_slug">
                            <SelectTrigger class="input-custom">
                              <SelectValue placeholder="Choisir une categorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem v-for="taxonomy in taxonomies" :key="taxonomy.id" :value="taxonomy.slug" class="select-item-custom">
                                  <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ taxonomy.name }}</span>
                                  </div>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <span v-if="messageErrorTypeChamp" class="text-xs text-destructive italic font-medium">{{ messageErrorTypeChamp }}</span>
                        </div>
                        <div class="space-y-2">
                          <Label class="text-xs font-medium text-text">Mode d'affichage</Label>
                          <Select v-model="(field as ITaxonomyConfig).renderType">
                            <SelectTrigger class="input-custom">
                              <SelectValue placeholder="Choisir un type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup class="font-medium text-text">
                                <SelectItem value="combobox" class="select-item-custom">
                                Combobox
                                </SelectItem>
                                <SelectItem value="badges" class="select-item-custom">
                                Badges
                                </SelectItem>
                                <SelectItem value="checkbox" class="select-item-custom">
                                Checkbox
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div v-else>
                        <p class="text-xs font-medium text-text">Aucune taxonomie disponible ou non archivée</p>
                      </div>
                    </div>

                    <!-- Type RELATION : Cible du contenu -->
                    <div v-if="field.type === FieldType.RELATION" class="space-y-3">
                      <div v-if="contentTypes && contentTypes.length > 0">
                        <Label class="text-xs font-medium text-text">Cible de la relation (Slug)</Label>
                        <Select v-model="(field as IRelationConfig).contentTypeId">
                          <SelectTrigger class="input-custom">
                            <SelectValue placeholder="Choisir un slug" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem v-for="ft in contentTypes" :key="ft.slug" :value="ft.id" class="select-item-custom">
                                <div class="flex items-center gap-2">
                                  <span class="font-medium">{{ ft.slug }}</span>
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <span v-if="messageErrorTypeChamp" class="text-xs text-destructive italic font-medium">{{ messageErrorTypeChamp }}</span>
                      </div>
                      <div v-else>
                        <p class="text-xs font-medium text-text">Aucun type de contenu disponible ou non archivé</p>
                      </div>
                    </div>

                    <!-- Type RichText -->
                    <div v-if="field.type === FieldType.RICH_TEXT" class="space-y-4">
                      <div class="grid grid-cols-2 sm:grid-cols-2 gap-3">
                        <div class="space-y-2">
                          <Label class="text-xs font-medium text-text">Toolbar</Label>
                          <Select v-model="(field as IRichTextConfig).toolbar">
                            <SelectTrigger class="input-custom">
                              <SelectValue placeholder="Choisir un toolbar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem v-for="toolbar in ['minimal', 'full']" :key="toolbar" :value="toolbar" class="select-item-custom">
                                  <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ toolbar }}</span>
                                  </div>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <!-- Multiple pour MEDIA, TAXONOMY, SELECT, RELATION -->
                    <!-- Options spécifiques : Multiple et Types de Média -->
                    <div v-if="[FieldType.MEDIA, FieldType.TAXONOMY, FieldType.SELECT, FieldType.RELATION].includes(field.type)" class="space-y-4 p-4 bg-muted/10 rounded-xl border border-border">
                        <!-- Section Média (Uniquement pour type MEDIA) -->
                        <div v-if="field.type === FieldType.MEDIA" class="space-y-4  border-border pb-4">
                          <Label class="text-xs font-medium text-tex">Types de fichiers autorisés</Label>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex items-center justify-between p-3 border border-border rounded-xl">
                              <span class="text-xs font-medium text-text">Images</span>
                              <BaseSwitch
                                :model-value="!!(field as IMediaConfig).allowedTypes.includes('image')"
                                @update:model-value="(val) => (field as IMediaConfig).allowedTypes = val ? [...(field as IMediaConfig).allowedTypes, 'image'] : (field as IMediaConfig).allowedTypes.filter((t) => t !== 'image')"
                              />
                            </div>
                            <div class="flex items-center justify-between p-3 border border-border rounded-xl">
                              <span class="text-xs font-medium text-text">Vidéos</span>
                              <BaseSwitch
                                :model-value="!!(field as IMediaConfig).allowedTypes.includes('video')"
                                @update:model-value="(val) => (field as IMediaConfig).allowedTypes = val ? [...(field as IMediaConfig).allowedTypes, 'video'] : (field as IMediaConfig).allowedTypes.filter((t) => t !== 'video')"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Option Multiple (Pour tous les types concernés) -->
                        <div :class="field.type === FieldType.MEDIA ? 'flex items-center justify-between px-2 border border-border rounded-xl p-4' : 'flex items-center justify-between px-2' ">
                          <div class="space-y-0.5">
                            <Label class="text-xs font-medium text-text">Sélections multiples</Label>
                            <p class="text-xs text-muted-foreground font-medium">Permettre de choisir plusieurs éléments</p>
                          </div>
                          <BaseSwitch
                            :model-value="!!(field as any).multiple"
                            @update:model-value="(val) => (field as any).multiple = val"
                          />
                        </div>
                    </div>
                  </div>
                </TabsContent>

                <!-- Onglet Validation -->
                <TabsContent value="validation" class="p-8 space-y-6">
                  <div class="flex items-center gap-4 p-4 bg-muted/20 group/v">
                    <BaseSwitch v-model="field.required" id="required-toggle" />
                    <Label for="required-toggle" class="font-bold flex flex-col">
                      <span class="text-xs font-medium text-text">Champ obligatoire</span>
                    </Label>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                    <div v-if="field.type === FieldType.TEXT" class="space-y-4">
                       <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <Label class="text-xs font-medium text-text">Longueur Min</Label>
                            <Input type="number" v-model="(field as ITextConfig).minLength" placeholder="Longueur Min" class="input-custom" />
                          </div>
                          <div class="space-y-2">
                            <Label class="text-xs font-medium text-text">Longueur Max</Label>
                            <Input type="number" v-model="(field as ITextConfig).maxLength" placeholder="Longueur Max" class="input-custom" />
                          </div>
                       </div>
                    </div>

                    <div v-if="field.type === FieldType.NUMBER" class="space-y-4">
                       <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <Label class="text-xs font-medium text-text">Valeur Min</Label>
                            <Input type="number" v-model="(field as INumberConfig).min" placeholder="Valeur Min" class="input-custom" />
                          </div>
                          <div class="space-y-2">
                            <Label class="text-xs font-medium text-text">Valeur Max</Label>
                            <Input type="number" v-model="(field as INumberConfig).max" placeholder="Valeur Max" class="input-custom" />
                          </div>
                       </div>
                    </div>

                    <div v-if="field.type === FieldType.MEDIA" class="space-y-4">
                      <div class="space-y-2">
                        <Label class="text-xs font-medium text-text">Max Size</Label>
                        <Input type="number" v-model="(field as IMediaConfig).maxSize" placeholder="Taille Max" class="input-custom" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <!-- Footer du panel d'édition -->
              <div class="bg-muted/10 p-4 border-t border-border flex justify-end gap-3">
                 <Button variant="ghost" @click="toggleExpand(fields.indexOf(field))" class="text-text font-medium hover:bg-transparent hover:text-primary">
                    Fermer le champ
                 </Button>
                 <Button variant="outline" @click="addField" class="rounded-xl text-text font-medium hover:bg-transparent hover:text-primary h-10 px-6">
                    Fermer et ajouter un champ
                 </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="flex flex-col items-center justify-center py-20 bg-muted/5 group">
          <div class="p-6 bg-primary/5 mb-4">
            <Plus class="w-12 h-12 text-muted-foreground/30"/>
          </div>
          <h3 class="font-bold text-text">Aucun champ défini</h3>
          <p class="text-text font-medium mb-6">Commencez par ajouter votre premier champ au modèle.</p>
        </div>

        </div>

        <!-- Bouton Ajouter au bas de la section (Aligné à droite comme sur l'image) -->
        <div class="p-6 bg-muted/5 flex items-center gap-3 justify-end border-t border-border">
          <Button @click="handleSubmit" class="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95">
            <Save class="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
          <Button @click="addField" class="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95">
            <Plus class="w-4 h-4 mr-2" />Ajouter un champ
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>


