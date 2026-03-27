<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
  Undo2,
  ChevronsUpDown,
  Check
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
  type IRichTextConfig,
  TypesMedia
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
import { useUpdateContentType, useGetContentTypeById, useGetContentTypesExcepted } from '../../hook/content-type'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'
import { handleError } from '../../lib/error'
import {useGetTaxonomies} from '../../hook/taxonomy'
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
import CompositionControlledConfirmDialog from '../../components/composition/CompositionControlledConfirmDialog.vue'



import type { ContentType } from '../../type/content-type'
import { cn } from '../../lib/utils'
import Popover from '../../components/ui/popover/Popover.vue'
import PopoverContent from '../../components/ui/popover/PopoverContent.vue'
import Command from '../../components/ui/command/Command.vue'
import CommandInput from '../../components/ui/command/CommandInput.vue'
import CommandEmpty from '../../components/ui/command/CommandEmpty.vue'
import CommandList from '../../components/ui/command/CommandList.vue'
import CommandGroup from '../../components/ui/command/CommandGroup.vue'
import CommandItem from '../../components/ui/command/CommandItem.vue'
import PopoverTrigger from '../../components/ui/popover/PopoverTrigger.vue'

const router = useRouter()
const route = useRoute()
const contentTypeId = route.params.id as string
const isEntries = ref(false)
const confirmDialogUrl = ref(true)


// État du formulaire principal
const form = ref({
  name: '',
  slug: '',
  description: '',
  archive: false
})

const isFieldsExpanded = ref(true)

const messageErrorTypeChamp = ref('');


// État des erreurs de validation
const errors = ref<Record<string, string>>({})


const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const width = ref(0)

watch(open, (newOpen) => {
  if (newOpen && triggerRef.value) {
    width.value = triggerRef.value.offsetWidth
  }
})

// Liste des champs (fields_schema)
// On utilise any[] pour le ref pour éviter l'erreur d'instanciation trop profonde de TS avec Vue + Unions complexes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fields = ref<any[]>([])

const {
  data: contentTypeData,
  isPending: isDataLoading,
} = useGetContentTypeById(contentTypeId)



const {
  mutateAsync: updateContentType,
  isPending: isUpdating,
} = useUpdateContentType()

const {
  data: contentTypes,
  isPending: isContentTypesLoading,
} = useGetContentTypesExcepted(Number(contentTypeId))


const {
  data: taxonomies,
  isPending: isTaxonomiesLoading,
} = useGetTaxonomies()


const resultTaxonomies = computed(() => taxonomies.value?.results || [])
let unregisterGuard: () => void;

// Initialisation des données
onMounted(() => {
  if (contentTypeData.value) {
    populateForm(contentTypeData.value)
    if (contentTypeData.value.entries && contentTypeData.value.entries.length > 0) {
      isEntries.value = true
    }
  }
  unregisterGuard = router.beforeEach(async (to, from) => {
    if (to.name !== from.name && EnregistrerBrouillon.value && confirmDialogUrl.value) {
      isChangePageByUrl.value = true;

      const userConfirmed = await new Promise<boolean>((resolve) => {
        resolveNavigation = resolve;
      });

      return userConfirmed;
    }
    return true;
  });
})

// On supprime la garde quand on quitte le composant
onUnmounted(() => {
  if (unregisterGuard) unregisterGuard();
});


watch(contentTypeData, (newData) => {
  if (newData) {
    populateForm(newData)
    if (newData.entries && newData.entries.length > 0) {
      isEntries.value = true
    }
  }
})

const populateForm = (data: ContentType) => {
  form.value = {
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    archive: !!data.archive
  }

  // Transformation initiale : options en objets pour suivi granulaire
  const rawFields = JSON.parse(JSON.stringify(data.fields_schema || []));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields.value = rawFields.map((f: any) => {
    if (f.type === FieldType.SELECT && Array.isArray(f.options)) {
      f.options = f.options.map((opt: any) => ({ value: opt }));
    }
    return f;
  });
}

const visibleFields = computed(() => fields.value.slice(1))
const isChangePageByUrl = ref(false);
let resolveNavigation: (value: boolean) => void;

  // Gestion de l'expansion des champs
const expandedFieldIndex = ref<number | null>(null)

const toggleExpand = (index: number) => {
  expandedFieldIndex.value = expandedFieldIndex.value === index ? null : index
}

const toggleType = (field: IMediaConfig, type: TypesMedia) => {
  // Initialise le tableau s'il n'existe pas
  if (!field.allowedTypes) {
    field.allowedTypes = [];
  }

  const index = field.allowedTypes.indexOf(type);
  if (index > -1) {
    // Si le type existe déjà, on le retire
    field.allowedTypes.splice(index, 1);
  } else {
    // Sinon, on l'ajoute
    field.allowedTypes.push(type);
  }
};


const toggleTaxonomy = (field: ITaxonomyConfig, taxonomyId: number) => {
  // Initialise le tableau s'il n'existe pas
  if (!field.taxonomyIds) {
    field.taxonomyIds = [];
  }

  const index = field.taxonomyIds.indexOf(taxonomyId);
  if (index > -1) {
    // Si le type existe déjà, on le retire
    field.taxonomyIds.splice(index, 1);
  } else {
    // Sinon, on l'ajoute
    field.taxonomyIds.push(taxonomyId);
  }
};


// Types de champs disponibles
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

const generateUniqueName = (baseName: string) => {
  // Génère une chaîne aléatoire complexe (ex: field_8f9d2b1a)
  return `${baseName}_${crypto.randomUUID().split('-')[0]}`;
};

// Ajouter un nouveau champ
const addField = () => {
  const baseName = 'champ'
  const newName = generateUniqueName(baseName)

  const newField: IFieldDefinition & { _isNew?: boolean } = {
    type: FieldType.TEXT,
    name: newName,
    label: '',
    required: false,
    placeholder: '',
    description: '',
    _isNew: true // Marqueur pour désactiver les confirmations
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
      if (!taxonomyField.taxonomyIds) {
        taxonomyField.taxonomyIds = []
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
        mediaField.allowedTypes = [TypesMedia.IMAGE]
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

  const newName = generateUniqueName(source.name)

  duplicate.name = newName
  duplicate.label = duplicate.label ? `${duplicate.label} (Copie)` : ''
  duplicate._isNew = true // Nouveau champ (duplicata)

  // Ajout à la fin du tableau
  fields.value.push(duplicate)

  // Ouvrir le champ (l'index est maintenant le dernier élément)
  expandedFieldIndex.value = fields.value.length - 1
}

// Utilitaires de rendu
const getFieldTypeIcon = (type: FieldType) => {
  return fieldTypes.find(t => t.type === type)?.icon || Type
}

const getFieldTypeLabel = (type: FieldType) => {
  return fieldTypes.find(t => t.type === type)?.label || type
}

// Nettoyage performant des champs
const cleanedFields = (fieldsArray: IFieldDefinition[]): IFieldDefinition[] => {
  return fieldsArray.map((f): IFieldDefinition => {
    const base = {
      type: f.type,
      name: f.name,
      label: f.label,
      required: f.required,
      placeholder: f.placeholder,
      description: f.description,
    }

    if (f.label === '') {
      messageErrorTypeChamp.value = 'Veuillez saisir un libellé'
    } else {
      messageErrorTypeChamp.value = ''
    }


    if (f.type===FieldType.RELATION) {
      if (f.contentTypeId === 0) {
        messageErrorTypeChamp.value = 'Veuillez selectionner un type de contenu'
      } else {
        messageErrorTypeChamp.value = ''
      }
    }


    if (f.type===FieldType.TAXONOMY) {
      if (f.taxonomyIds.length === 0) {
        messageErrorTypeChamp.value = 'Veuillez selectionner une categorie'
      } else {
        messageErrorTypeChamp.value = ''
      }
    }


    if (f.type===FieldType.SELECT) {
      if ((f as any).options.length === 0) {
        messageErrorTypeChamp.value = 'Veuillez selectionner des options'
      } else {
        messageErrorTypeChamp.value = ''
      }
    }


    switch (f.type) {
      case FieldType.TEXT:
        return { ...base, type: FieldType.TEXT, minLength: (f as ITextConfig).minLength, maxLength: (f as ITextConfig).maxLength, pattern: (f as ITextConfig).pattern, defaultValue: f.defaultValue }
      case FieldType.NUMBER:
        return { ...base, type: FieldType.NUMBER, min: (f as INumberConfig).min, max: (f as INumberConfig).max, step: (f as INumberConfig).step, defaultValue: f.defaultValue }
      case FieldType.MEDIA:
        return { ...base, type: FieldType.MEDIA, allowedTypes: (f as IMediaConfig).allowedTypes, multiple: (f as IMediaConfig).multiple, maxSize: (f as IMediaConfig).maxSize, defaultValue: f.defaultValue }
      case FieldType.TAXONOMY:
        return { ...base, type: FieldType.TAXONOMY, taxonomyIds: (f as ITaxonomyConfig).taxonomyIds, multiple: (f as ITaxonomyConfig).multiple, renderType: (f as ITaxonomyConfig).renderType, defaultValue: f.defaultValue }
      case FieldType.SELECT:
        const selectOptions = (f as any).options.map((opt: any) =>
          (opt && typeof opt === 'object' && 'value' in opt) ? opt.value : opt
        );
        return { ...base, type: FieldType.SELECT, options: selectOptions, multiple: (f as ISelectConfig).multiple, defaultValue: f.defaultValue }
      case FieldType.RICH_TEXT:
        return { ...base, type: FieldType.RICH_TEXT, toolbar: (f as IRichTextConfig).toolbar, defaultValue: f.defaultValue }
      case FieldType.RELATION:
        return { ...base, type: FieldType.RELATION, contentTypeId: (f as IRelationConfig).contentTypeId, multiple: (f as IRelationConfig).multiple, defaultValue: f.defaultValue }
      case FieldType.BOOLEAN:
        return { ...base, type: FieldType.BOOLEAN, defaultValue: typeof f.defaultValue === 'boolean' ? f.defaultValue : undefined }
      default:
        return f
    }
  })
}


const EnregistrerBrouillon =  computed(() => {

  const { name , slug , description , archive } = contentTypeData.value || {}
  const formValue = { name , slug , description , archive }

  const result = JSON.stringify(form.value) !== JSON.stringify(formValue)
  const resultFields = JSON.stringify(fields.value) !== JSON.stringify(contentTypeData?.value?.fields_schema);

  if (result || resultFields) {
    return true
  }else{
    return false
  }

})



// Fonctions appelées par les événements du dialogue
const confirmChangePageByUrl = () => {
  isChangePageByUrl.value = false;
  if (resolveNavigation) resolveNavigation(true);
};

const cancelChangePageByUrl = () => {
  isChangePageByUrl.value = false;
  if (resolveNavigation) resolveNavigation(false);
};


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

  const NetoyageFields = cleanedFields(fields.value as IFieldDefinition[])

  if (messageErrorTypeChamp.value.length > 0) {
    showToast('error', messageErrorTypeChamp.value)
    return
  }



  const payload = {
    ...form.value,
    fields_schema: NetoyageFields
  }

  console.log('Payload mise à jour:', payload)
  updateContentType(
    {
      contentType: payload,
      id: Number(contentTypeId)
    },{
      onSuccess: () => {
        showToast('success', 'Type de contenu mis à jour avec succès')
        confirmDialogUrl.value = false;
        router.push({name: 'admin.content-types'})
      },
      onError: (error) => {
        handleError(error)
      }
    }
  )
}

const handleCancel = () => {
  confirmDialogUrl.value = false;
  router.back()
}


const pendingChange = ref<{ field: IFieldDefinition, type: FieldType } | null>(null);
const isTypeDialogOpen = ref(false);

const handleTypeAttempt = (field: IFieldDefinition & { _isNew?: boolean, _typeConfirmed?: boolean }, newType: FieldType | null | string) => {

  if (!newType) return;
  const targetType = newType as FieldType;

  // Pas de confirmation si :
  // 1. C'est un nouveau champ
  // 2. Le changement de type a déjà été confirmé pour ce champ dans cette session
  if (field._isNew || field._typeConfirmed) {
    field.type = targetType;
    return;
  }

  console.log(field.type,targetType)

  const sensitiveTypes = [
    FieldType.MEDIA,
    FieldType.RELATION,
    FieldType.TAXONOMY,
    FieldType.SELECT
  ];

  if (sensitiveTypes.includes(targetType) && field.type !== targetType) {
    pendingChange.value = { field, type: targetType };
    isTypeDialogOpen.value = true;
  } else {
    field.type = targetType;
  }
};

const confirmChange = () => {
  if (pendingChange.value) {
    const field = pendingChange.value.field as any;
    field.type = pendingChange.value.type;
    field._typeConfirmed = true; // Marquer comme confirmé pour la session

    // Forcer la réactivité
    fields.value = [...fields.value];
    pendingChange.value = null;
  }
  isTypeDialogOpen.value = false;
};



</script>

<template>
  <CompositionLoading v-if="isUpdating || isDataLoading || isContentTypesLoading || isTaxonomiesLoading" />

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
                <span class="text-primary italic">Modifier le type de contenu</span>
              </h1>
              <p class="text-background opacity-80 text-lg font-medium">Modifiez la structure et les champs de votre contenu.</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <CompositionConfirmDialog v-if="EnregistrerBrouillon" @confirm="handleCancel"  header="Quitter sans enregistrer" description="Êtes-vous sûr de vouloir quitter sans enregistrer ? Si vous le faite le formulaire sera reinitialiser." cancelText="Annuler" actionText="Quitter">
              <template #dialogButton>
                <Button variant="outline" class="rounded-xl h-12 px-6 font-bold hover:bg-muted active:scale-95">
                  <Undo2 class="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </template>
            </CompositionConfirmDialog>

            <Button v-else variant="outline" @click="handleCancel" class="rounded-xl h-12 px-6 font-bold hover:bg-muted active:scale-95">
              <Undo2 class="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button @click="handleSubmit" class="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95">
              <Save class="w-4 h-4 mr-2" />
              Mettre à jour
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="space-y-8">
      <!-- Section Configuration de Base -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="md:col-span-2 space-y-6 p-8 card rounded-none">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="name" class="text-sm font-bold text-text px-1">Nom du Type</Label>
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
                <Label for="slug" class="text-sm font-bold text-text px-1">Identifiant</Label>
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
              <Label for="description" class="text-sm font-bold text-text px-1">Description</Label>
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
          <div class="p-6 space-y-4 card rounded-none">
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
          <div class="grid grid-cols-[80px_1fr_1fr_1fr] px-6 py-3 bg-muted/20 border-b border-border text-xs font-bold text-text">
            <div>N°</div>
            <div>Libellé</div>
            <div>Placeholder</div>
            <div>Type</div>
          </div>

          <div v-if="visibleFields.length > 0" class="divide-y divide-border">
            <div
              v-for="(field, vIndex) in visibleFields"
              :key="fields.indexOf(field)"
              class="group"
            >
              <div
                class="grid grid-cols-[80px_1fr_1fr_1fr] items-center px-6 py-4 cursor-pointer hover:bg-muted/5 transition-colors relative"
                :class="{ 'bg-primary/5': expandedFieldIndex === fields.indexOf(field) }"
                @click="toggleExpand(fields.indexOf(field))"
              >
                <div class="flex items-center gap-3 text-text font-medium">
                  <span class="w-4">{{ vIndex + 1 }}</span>
                  <ChevronDown
                    class="w-4 h-4 transition-transform duration-300"
                    :class="{ 'rotate-180': expandedFieldIndex === fields.indexOf(field) }"
                  />
                </div>

                <div class="flex flex-col">
                  <span class="font-bold text-primary hover:underline">
                    {{ field.label || '(aucun libellé)' }}
                  </span>
                  <div v-if="expandedFieldIndex === fields.indexOf(field)" class="flex items-center gap-3 mt-1 text-[10px] font-bold text-primary animate-in fade-in slide-in-from-left-1">
                     <button @click.stop="duplicateField(fields.indexOf(field))" class="hover:text-primary/70">Dupliquer</button>
                     <span class="text-border">|</span>
                     <CompositionConfirmDialog v-if="!field._isNew && isEntries" @confirm="() => removeField(fields.indexOf(field))" header="Suppression d'un champ" description="Êtes-vous sûr de vouloir supprimer cet champs ? Si vous le supprimer vous perdez toutes les données de cet champ." cancelText="Annuler" actionText="supprimer" >
                        <template #dialogButton>
                          <button @click.stop class="text-destructive hover:text-destructive/70">Supprimer</button>
                        </template>
                     </CompositionConfirmDialog>
                     <button v-else @click.stop="removeField(fields.indexOf(field))" class="text-destructive hover:text-destructive/70">Supprimer</button>
                  </div>
                </div>

                <div class="text-muted-foreground font-medium">
                  {{ field.placeholder }}
                </div>

                <div class="flex items-center gap-2">
                  <div class="p-1.5 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                    <component :is="getFieldTypeIcon(field.type)" class="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <span class="text-sm font-medium text-muted-foreground">
                    {{ getFieldTypeLabel(field.type) }}
                  </span>
                </div>
              </div>

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

                  <TabsContent value="general" class="p-8 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div class="col-span-1 space-y-3">
                        <Label class="text-xs font-medium text-text">Type de champ</Label>
                        <Select v-if="!field._isNew && isEntries" :model-value="field.type" @update:model-value="(val) => handleTypeAttempt(field, val as FieldType)">
                          <SelectTrigger class="input-custom">
                            <SelectValue placeholder="Choisir un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem v-for="ft in fieldTypes" :key="ft.type" :value="ft.type" class="select-item-custom text-primary hover:text-white">
                                <div class="flex items-center gap-2">
                                  <component :is="ft.icon" class="w-4 h-4" />
                                  <span class="font-medium">{{ ft.label }}</span>
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Select v-else v-model="field.type">
                          <SelectTrigger class="input-custom">
                            <SelectValue placeholder="Choisir un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem v-for="ft in fieldTypes" :key="ft.type" :value="ft.type" class="select-item-custom text-primary hover:text-white">
                                <div class="flex items-center gap-2">
                                  <component :is="ft.icon" class="w-4 h-4" />
                                  <span class="font-medium">{{ ft.label }}</span>
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div class="col-span-1 space-y-4">
                        <div class="space-y-2">
                          <Label class="text-xs font-medium text-text">Libellé du champ</Label>
                          <Input v-model="field.label" placeholder="Texte affiché à l'utilisateur" class="input-custom" />
                          <span v-if="messageErrorTypeChamp" class="text-xs text-destructive italic font-medium">{{ messageErrorTypeChamp }}</span>
                        </div>
                        <div class="space-y-2">
                          <Label class="text-xs font-medium text-text"> Placeholder </Label>
                          <Input v-model="field.placeholder" placeholder="Texte affiché en exemple" class="input-custom"/>
                        </div>
                      </div>
                    </div>

                    <div class="pt-6 border-t border-border space-y-6">
                      <!-- Type SELECT -->
                      <div v-if="field.type === FieldType.SELECT" class="space-y-4">
                        <div class="flex items-center justify-between">
                          <Label class="text-xs font-bold text-text">Options de sélection</Label>
                          <p v-if="messageErrorTypeChamp" class="text-xs text-destructive italic font-medium">{{ messageErrorTypeChamp }}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="(field as any).options.push({ value: '', _isNew: true })"
                            class="text-text font-bold hover:bg-transparent hover:text-primary"
                          >
                            <Plus class="w-4 h-4 mr-1" /> Ajouter une option
                          </Button>
                        </div>
                        <div class="space-y-2">
                          <div v-for="(option, oIdx) in (field as any).options" :key="oIdx" class="flex gap-2 items-center">
                            <Select
                              :model-value="typeof option.value === 'number' ? 'number' : 'string'"
                              @update:model-value="(val) => {
                                if (val === 'number') {
                                  option.value = isNaN(Number(option.value)) ? 0 : Number(option.value);
                                } else {
                                  option.value = String(option.value);
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
                              :key="oIdx + '-' + typeof option.value"
                              v-model="option.value"
                              :type="typeof option.value === 'number' ? 'number' : 'text'"
                              placeholder="Valeur de l'option"
                              class="input-custom"
                            />
                            <CompositionConfirmDialog v-if="!field._isNew && !option._isNew && isEntries" @confirm="(field as any).options.splice(oIdx, 1)" header="Suppression d'une option" description="Êtes-vous sûr de vouloir supprimer cette option ? Si vous la supprimez, vous perdrez toutes les données associées." cancelText="Annuler" actionText="supprimer" >
                              <template #dialogButton>
                                <Button variant="ghost" size="icon" class="text-destructive">
                                  <X class="w-4 h-4" />
                                </Button>
                              </template>
                            </CompositionConfirmDialog>
                            <Button v-else variant="ghost" size="icon" @click="(field as any).options.splice(oIdx, 1)" class="text-destructive">
                              <X class="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <!-- Type TAXONOMY -->
                      <div v-if="field.type === FieldType.TAXONOMY">
                          <div v-if="resultTaxonomies && resultTaxonomies.length > 0" class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                              <Label class="text-xs font-medium text-text">Categorie</Label>
                              <!-- <Select v-model="(field as ITaxonomyConfig).taxonomy_slug">
                                <SelectTrigger class="input-custom">
                                  <SelectValue placeholder="Choisir une categorie" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem v-for="(taxonomy, tIdx) in resultTaxonomies" :key="tIdx" :value="taxonomy.slug" class="select-item-custom">
                                    {{ taxonomy.name }}
                                  </SelectItem>
                                </SelectContent>
                              </Select> -->
                              <Popover v-model:open="open">
                                  <PopoverTrigger as-child>
                                    <Button
                                      ref="triggerRef"
                                      variant="outline"
                                      role="combobox"
                                      class="input-custom w-full relative flex items-center justify-center font-normal h-8"
                                    >
                                      <span class="truncate text-center mx-8">
                                        {{ field.taxonomyIds.length > 0
                                            ? `${field.taxonomyIds.length} categorie(s) selectionée(s)`
                                            : "Choisir les categories ..."
                                        }}
                                      </span>

                                      <ChevronsUpDown class="absolute right-3 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>

                                  <PopoverContent :style="{ width: `${width}px` }" class="p-0">
                                    <Command>
                                      <CommandInput placeholder="Rechercher une categorie..." />
                                      <CommandEmpty>Aucun categorie trouvé.</CommandEmpty>
                                      <CommandList class="group custom-scrollbar">
                                        <CommandGroup>
                                          <CommandItem
                                            v-for="taxonomy in resultTaxonomies"
                                            :key="taxonomy.id"
                                            :value="taxonomy.id "
                                            class="cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-white group-hover:data-[highlighted]:bg-transparent group-hover:data-[highlighted]:text-foreground hover:!bg-primary hover:!text-white"
                                            @select="toggleTaxonomy(field,taxonomy.id)"
                                          >
                                            <Check
                                              :class="cn(
                                                'mr-2 h-4 w-4',
                                                (field as ITaxonomyConfig).taxonomyIds.includes(taxonomy.id) ? 'opacity-100' : 'opacity-0'
                                              )"
                                            />
                                            <div class="flex flex-col">
                                              <span>{{ taxonomy.name }}</span>
                                            </div>
                                          </CommandItem>
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                              </Popover>
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
                                    <SelectItem value="combobox" class="select-item-custom">Combobox</SelectItem>
                                    <SelectItem value="badges" class="select-item-custom">Badges</SelectItem>
                                    <SelectItem value="checkbox" class="select-item-custom">Checkbox</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div v-else>
                            <p class="text-xs font-medium text-text">Aucune categorie disponible ou non archivée</p>
                          </div>
                        </div>


                      <!-- Type RELATION -->
                       <div v-if="field.type === FieldType.RELATION">
                          <div v-if="contentTypes && contentTypes.length > 0" class="space-y-3">
                            <Label class="text-xs font-medium text-text">Cible de la relation</Label>
                            <Select v-model="(field as IRelationConfig).contentTypeId">
                              <SelectTrigger class="input-custom">
                                <SelectValue placeholder="Choisir un contenu" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem v-for="ft in contentTypes" :key="ft.slug" :value="ft.id" class="select-item-custom">
                                    <span class="font-medium">{{ ft.slug }}</span>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <span v-if="messageErrorTypeChamp" class="text-xs text-destructive italic font-medium">{{ messageErrorTypeChamp }}</span>
                        </div>
                        <div v-else>
                          <p class="text-xs font-medium text-text">Aucun type de  contenu disponible ou non archivé</p>
                        </div>
                      </div>

                      <!-- Type RICH_TEXT -->
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
                                  <SelectItem value="minimal" class="select-item-custom">minimal</SelectItem>
                                  <SelectItem value="full" class="select-item-custom">full</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <!-- Multiple pour MEDIA, TAXONOMY, SELECT, RELATION -->
                      <div v-if="[FieldType.MEDIA, FieldType.TAXONOMY, FieldType.SELECT, FieldType.RELATION].includes(field.type)" class="space-y-4 p-4 bg-muted/10 rounded-xl border border-border">
                          <div v-if="field.type === FieldType.MEDIA" class="grid grid-cols-2 sm:grid-cols-2 gap-3">
                          <div class="space-y-4">
                            <Label class="text-xs font-medium text-tex">Types de fichiers autorisés</Label>
                            <Popover v-model:open="open">
                              <PopoverTrigger as-child>
                                <Button
                                  ref="triggerRef"
                                  variant="outline"
                                  role="combobox"
                                  class="input-custom w-full relative flex items-center justify-center font-normal h-8"
                                >
                                  <span class="truncate text-center mx-8">
                                    {{ field.allowedTypes.length > 0
                                        ? `${field.allowedTypes.length} type(s) de fichier selectionée(s)`
                                        : "Choisir les types de fichiers..."
                                    }}
                                  </span>

                                  <ChevronsUpDown class="absolute right-3 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent :style="{ width: `${width}px` }" class="p-0">
                                <Command>
                                  <CommandInput placeholder="Rechercher un type de fichier..." />
                                  <CommandEmpty>Aucun type de fichier trouvé.</CommandEmpty>
                                  <CommandList class="group custom-scrollbar">
                                    <CommandGroup>
                                      <CommandItem
                                        v-for="type in Object.values(TypesMedia)"
                                        :key="type"
                                        :value="type"
                                        class="cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-white group-hover:data-[highlighted]:bg-transparent group-hover:data-[highlighted]:text-foreground hover:!bg-primary hover:!text-white"
                                        @select="toggleType(field,type)"
                                      >
                                        <Check
                                          :class="cn(
                                            'mr-2 h-4 w-4',
                                            (field as IMediaConfig).allowedTypes.includes(type) ? 'opacity-100' : 'opacity-0'
                                          )"
                                        />
                                        <div class="flex flex-col">
                                          <span>{{ type }}</span>
                                        </div>
                                      </CommandItem>
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

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

          <div v-else class="flex flex-col items-center justify-center py-20 bg-muted/5 group">
            <div class="p-6 bg-primary/5 mb-4">
              <Plus class="w-12 h-12 text-muted-foreground/30"/>
            </div>
            <h3 class="font-bold text-text">Aucun champ défini</h3>
          </div>
        </div>

        <div class="p-6 bg-muted/5 flex items-center gap-3 justify-end border-t border-border">
          <Button @click="handleSubmit" class="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95">
            <Save class="w-4 h-4 mr-2" />
            Mettre à jour
          </Button>
          <Button @click="addField" class="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95">
            <Plus class="w-4 h-4 mr-2" />Ajouter un champ
          </Button>
        </div>
      </section>
    </div>

    <!-- Dialogue de confirmation hybride contrôlé par prop pour le changement de type -->
    <CompositionControlledConfirmDialog
      :open="isTypeDialogOpen"
      @update:open="(val: boolean) => isTypeDialogOpen = val"
      @confirm="confirmChange"
      @cancel="isTypeDialogOpen = false"
      header="Confirmation de changement"
      description="Êtes-vous sûr de vouloir changer le type de champ ? Si vous le changez, vous pourriez perdre les données de ce champ."
      cancelText="Annuler"
      actionText="Changer"
    />

     <!-- Dialogue de confirmation hybride contrôlé par prop pour quitter la page par url -->
    <CompositionControlledConfirmDialog
      :open="isChangePageByUrl"
      @confirm="confirmChangePageByUrl"
      @cancel="cancelChangePageByUrl"
      header="Confirmation de changement"
      description="Êtes-vous sûr de vouloir changer de page ? Vous pourriez perdre vos modifications en cours."
      cancelText="Annuler"
      actionText="Changer"
    />
  </div>
</template>
