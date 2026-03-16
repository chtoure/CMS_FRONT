
<script setup lang="ts">
import { ref, watch } from 'vue';
import { ArrowLeft, Save, Layout, FileText } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
import { useAddPage, useUpdatePage } from '../../hook/page';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import { showToast } from "../../lib/toast";
import { handleError } from '../../lib/error';
import { pageSchema, type PageFormData } from '../../validation/pageValidate';
import type { Page } from '../../type/page';

interface Props {
  initialData?: Page;
  isEditing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
});

const emit = defineEmits<{
  success: [],
  cancel: []
}>();

// --- État du formulaire ---
const name = ref(props.initialData?.name || '');
const slug = ref(props.initialData?.slug || '');
const errors = ref<Partial<Record<keyof PageFormData, string>>>({});
const isSlugManuallyEdited = ref(false);

// --- Hooks ---
const { mutate: addPage, isPending: isAdding } = useAddPage();
const { mutate: updatePage, isPending: isUpdating } = useUpdatePage();

// --- Logique d'auto-génération du slug ---
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

watch(name, (newName) => {
  if (!isSlugManuallyEdited.value && !props.isEditing) {
    slug.value ="/" + generateSlug(newName);
  }
});

const onSlugInput = () => {
  isSlugManuallyEdited.value = true;
};

// --- Validation ---
const validate = () => {
  errors.value = {};
  const result = pageSchema.safeParse({
    name: name.value,
    slug: slug.value
  });

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as keyof PageFormData;
      errors.value[path] = issue.message;
    });
    return false;
  }
  return true;
};

// --- Soumission ---
const handleSubmit = () => {
  if (!validate()) return;

  const pageData = {
    name: name.value,
    slug: slug.value
  };

  if (props.isEditing && props.initialData?.id) {
    updatePage({ id: props.initialData.id, pageData }, {
      onSuccess: () => {
        showToast('success', 'Page modifiée avec succès');
        emit('success');
      },
      onError: (error: Error) => handleError(error)
    });
  } else {
    addPage(pageData, {
      onSuccess: () => {
        showToast('success', 'Page créée avec succès');
        emit('success');
      },
      onError: (error: Error) => handleError(error)
    });
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <CompositionLoading v-if="isAdding || isUpdating" />

  <div v-else class="card rounded-none p-6">
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          @click="handleCancel"
          class="flex items-center gap-2 text-text hover:text-primary transition-colors"
        >
          <ArrowLeft class="size-4" />
        </button>
        <p class="large font-bold text-text">
          {{ isEditing ? 'Modifier la page' : 'Créer une nouvelle page' }}
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <div class="space-y-6">
        <p class="huge font-semibold text-primary tracking-wider">Configuration De Base</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-text">
              <FileText class="size-4" /> Nom de la page
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="Ex: Accueil"
              class="input-custom"
              :class="{ 'border border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-xs text-destructive mt-1">{{ errors.name }}</p>
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-text">
              <Layout class="size-4" /> URL
            </label>
            <input
              v-model="slug"
              type="text"
              placeholder="ex-accueil"
              class="input-custom"
              @input="onSlugInput"
              :class="{ 'border border-destructive': errors.slug }"
            />
            <p class="text-[10px] text-muted-foreground opacity-70 italic">
              L'URL sera : https://votre-site.com{{ slug || '...' }}
            </p>
            <p v-if="errors.slug" class="text-xs text-destructive mt-1">{{ errors.slug }}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-4">
        <Button
          type="button"
          @click="handleCancel"
          class="bg-destructive text-white h-10"
        >
          Annuler
        </Button>

        <Button
          type="submit"
          class="text-white h-10"
        >
          <Save class="size-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </form>
  </div>
</template>
