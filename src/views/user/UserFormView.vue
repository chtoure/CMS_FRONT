
<script setup lang="ts">
import { ref } from 'vue';
import  type { UserProfile } from '../../type/user';
import {  ArrowLeft,  ShieldCheck, Mail, User } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';

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
const role = ref(props.initialData?.role || '');
const errors = ref<{ full_name?: string; email?: string }>({});

// const validate = () => {
//   errors.value = {};
//   if (!full_name.value.trim()) errors.value.full_name = 'Le nom complet est obligatoire';
//   if (!email.value.trim()) {
//     errors.value.email = "L'adresse email est obligatoire";
//   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
//     errors.value.email = "Format d'email invalide";
//   }
//   return Object.keys(errors.value).length === 0;
// };

// const handleSubmit = () => {
//   if (!validate()) return;

//   mutate({
//     full_name: full_name.value.trim(),
//     email: email.value.trim(),
//     role: role.value || null,
//   }, {
//     onSuccess: () => {
//       // Redirection vers la liste des utilisateurs après création
//       router.push('/users');
//     }
//   });
// };


const emit = defineEmits<{
  success: [],
  cancel: [] // Ce signal dira au parent de fermer le formulaire
}>();

const handleCancel = () => {
  emit('cancel'); // On émet le signal au lieu d'utiliser le router
};

</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-8">
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

    <form @submit.prevent="" class="space-y-8 bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div class="space-y-6">
          <h2 class="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Informations personnelles</h2>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User class="size-4 text-gray-400" /> Nom complet
            </label>
            <input
              v-model="full_name"
              type="text"
              placeholder="Ex: Jean Dupont"
              class="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
              class="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              :class="{ 'border-red-500 bg-red-50': errors.email }"
            />
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>
        </div>

        <div class="space-y-6">
          <h2 class="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Accès & Rôles</h2>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ShieldCheck class="size-4 text-gray-400" /> Rôle utilisateur
            </label>
            <select
              v-model="role"
              class="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all appearance-none"
            >
              <option value="">Utilisateur (Lecture seule)</option>
              <option value="manager">Manager (Gestion limitée)</option>
              <option value="admin">Administrateur (Accès total)</option>
            </select>
            <p class="text-[12px] text-gray-400 italic">Le rôle définit les permissions au sein de la plateforme.</p>
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
          <!-- <Loader2 v-if="isPending" class="size-4 animate-spin" />
          <template v-else>
            <Save v-if="isEditing" class="size-4" />
            <UserPlus v-else class="size-4" />
          </template>
          {{ isEditing ? 'Mettre à jour le profil' : 'Finaliser la création' }} -->
        </Button>
      </div>
    </form>
  </div>
</template>
