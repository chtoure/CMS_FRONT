
<script setup lang="ts">
import { ref } from 'vue';
import  type { AddUserData, UpdateProfileData, UserProfile } from '../../type/user';
import {  ArrowLeft,  ShieldCheck, Mail, User } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
import { useAddUser } from '../../hook/user';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
// import CompositionError from '../../components/composition/CompositionError.vue';
import { showToast } from "../../lib/toast"
import { useUpdateProfile } from '../../hook/user';


interface Props {
  initialData?: UserProfile;
  isEditing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
});


// --- État du formulaire ---
const full_name = ref(props.initialData?.full_name || '');
const email = ref(props.initialData?.email || '');
const role = ref(props.initialData?.role?.name || '');
const errors = ref<{ full_name?: string; email?: string , role?: string }>({});



// --- Hook pour ajouter un utilisateur ---
const {
  mutate: addUser,
  isPending: isAdding,
} = useAddUser();


// Hook : Upadate Profile (pour la modification)
const {
  mutate: updateProfile,
  isPending:isUpdateProfiling,
} = useUpdateProfile();


// --- Validation ---
const validate = () => {
  errors.value = {};
  if (!full_name.value.trim()) errors.value.full_name = 'Le nom complet est obligatoire';
  if (!email.value.trim()) {
    errors.value.email = "L'adresse email est obligatoire";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Format d'email invalide";
  }
  if (!role.value.trim()) {
    errors.value.role = "Le rôle est obligatoire";
  }
  return Object.keys(errors.value).length === 0;
};


// --- Soumission du formulaire addUser ---
const handleSubmitAddUser = () => {
  if (!validate()) return;

  const newUser: AddUserData = {
    full_name: full_name.value,
    email: email.value,
    role: role.value,
  };

  addUser(newUser, {
    onSuccess: () => {
      showToast('success', 'utilisateur ajouté avec succès');
      emit('success');
    },
    onError: (error: Error) => {
      showToast('error', `Erreur lors de l'ajout de l'utilisateur : ${error.message || 'Erreur inconnue'}`);
    }
  });

};


// Submission du formulaire Modifier un utilisateur
const handleSubmitEditUser = () => {

    const updateData : UpdateProfileData= {
      full_name: full_name.value,
      email: email.value,
      role: role.value,
    };

    if (!props.initialData?.id) {
      showToast('error', "ID utilisateur manquant pour la modification.");
      return;
    }

    updateProfile({ profileData: updateData, id: props.initialData?.id }, {
      onSuccess: () => {
        showToast('success', 'utilisateur modifié avec succès');
        emit('success');
      },
      onError: (error: Error) => {
        showToast('error', `Erreur lors de la modification de l'utilisateur : ${error.message || 'Erreur inconnue'}`);
      }
    });
};


// Soumission générale du formulaire
const handleSubmit = () => {

  if (props.isEditing) {
    handleSubmitEditUser();
  } else {
    handleSubmitAddUser();
  }
};


const emit = defineEmits<{
  success: [],
  cancel: [] // Ce signal dira au parent de fermer le formulaire
}>();

const handleCancel = () => {
  emit('cancel'); // On émet le signal au lieu d'utiliser le router
};

</script>

<template>

  <CompositionLoading v-if="isAdding || isUpdateProfiling" />
  <!-- <CompositionError v-else-if="isAddError" :error="addError?.message"/> -->

  <div v-else class="">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <button
          @click="handleCancel"
          class="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft class="size-4" />
          Retour à la liste
        </button>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Modifier le profil' : 'Créer un nouvel utilisateur' }}
        </h1>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8 border border-border  p-6 sm:p-10 shadow-sm">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div class="space-y-6">
          <h2 class="text-sm font-semibold text-primary uppercase tracking-wider">Informations personnelles</h2>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User class="size-4 text-gray-400" /> Nom complet
            </label>
            <input
              v-model="full_name"
              type="text"
              placeholder="Ex: Jean Dupont"
              class="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm focus-visible:ring-1  focus-visible:ring-primary outline-none transition-all"
              :class="{ 'border-red-500 bg-red-50': errors.full_name }"
            />
            <p v-if="errors.full_name" class="text-xs text-red-500 mt-1">{{ errors.full_name }}</p>
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail class="size-4 text-gray-400" /> Adresse Email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="jean@exemple.com"
              class="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm focus-visible:ring-1  focus-visible:ring-primary outline-none transition-all"
              :class="{ 'border-red-500 bg-red-50': errors.email }"
            />
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>



        </div>

        <div class="space-y-6">
          <h2 class="text-sm font-semibold text-primary uppercase tracking-wider">Accès & Rôles</h2>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ShieldCheck class="size-4 text-gray-400" /> Rôle utilisateur
            </label>
            <select
              v-model="role"
              class="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm focus-visible:ring-1  focus-visible:ring-primary outline-none transition-all appearance-none"
              :class="{ 'border-red-500 bg-red-50': errors.role }"
            >
              <option value="user">Utilisateur (Lecture seule)</option>
              <option value="manager">Manager (Gestion limitée)</option>
              <option value="admin">Administrateur (Accès total)</option>
            </select>
            <p v-if="errors.role" class="text-xs text-red-500 mt-1">{{ errors.role }}</p>
          </div>
        </div>


      </div>

      <div class="pt-8 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-4">
        <Button
          type="button"
          @click="handleCancel"
          class="bg-white text-gray-600 hover:bg-gray-100 "
        >
          Annuler
        </Button>

        <Button
          type="submit"
        >
        Enregistrer

        </Button>
      </div>
    </form>
  </div>
</template>


          <!-- <Loader2 v-if="isPending" class="size-4 animate-spin" />
          <template v-else>
            <Save v-if="isEditing" class="size-4" />
            <UserPlus v-else class="size-4" />
          </template>
          {{ isEditing ? 'Mettre à jour le profil' : 'Finaliser la création' }} -->
