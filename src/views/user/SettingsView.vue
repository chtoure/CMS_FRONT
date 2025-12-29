

<template>
  <CompositionLoading v-if="isUpdating" />
  <CompositionError v-else-if="isUpdateError" :error="updateError?.message"/>

  <form @submit.prevent="handleSubmit" class="w-full">
    <div class="">
      <div class="border-b border-gray-900/10 pb-7">
        <h2 class="text-base/7 font-semibold text-gray-900">Profil</h2>
        <p class="mt-1 text-sm/6 text-gray-600">Gérez vos informations personnelles et votre sécurité.</p>

        <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div class="sm:col-span-3">
            <label for="full_name" class="block text-sm/6 font-medium text-gray-900">Nom Complet</label>
            <div class="mt-2">
              <input
                type="text"
                v-model="full_name"
                id="full_name"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div class="sm:col-span-4">
            <label for="email" class="block text-sm/6 font-medium text-gray-900">Adresse Email</label>
            <div class="mt-2">
              <input
                id="email"
                type="email"
                v-model="email"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div class="sm:col-span-3">
            <BasePasswordForceInput
              label="Nouveau mot de passe"
              v-model="new_password"
              placeholder="Entrer le mot de passe"
            />
          </div>

          <div class="sm:col-span-3">
            <BasePasswordForceInput
              label="Confirmer le nouveau mot de passe"
              v-model="confirm_new_password"
              placeholder="Répéter le mot de passe"
              :show-strength="false"
            />
            <p v-if="password_non_confirmed" class="mt-2 text-xs text-red-600 font-medium italic">
              {{ messageError }}
            </p>
          </div>

          <div class="sm:col-span-3">
            <label class="block text-sm/6 font-semibold text-gray-900">Rôle actuel</label>
            <div class="mt-2">
              <span class="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                Administrateur
              </span>
            </div>
          </div>

          <div class="sm:col-span-6">
            <label class="block text-sm/6 font-semibold text-gray-900">Permissions accordées</label>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="perm in ['Gérer les utilisateurs', 'Gérer les médias', 'Accès logs']"
                :key="perm"
                class="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              >
                {{ perm }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-x-6">
      <button
        type="button"
        @click="handleCancel"
        class="w-full sm:w-auto text-sm/6 font-semibold text-gray-900 text-center py-2"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Enregistrer les modifications
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">

  import BasePasswordForceInput from '../../components/base/BasePasswordForceInput.vue';
  import { ref , watch ,onMounted } from 'vue';
  import { userStore } from '../../stores/user';
  import type { UpdateProfileData } from '../../type/user';
  import { useUpdateProfile } from '../../hook/user';
  import CompositionLoading from '@/components/composition/CompositionLoading.vue';
  import CompositionError from '@/components/composition/CompositionError.vue';
  import { showToast } from "../../lib/toast"



  const store = userStore();
  const new_password = ref('');
  const confirm_new_password = ref('');
  const full_name = ref('');
  const email = ref('');
  const password_non_confirmed = ref(false);
  const messageError = ref('');


  const {
    mutate: updateProfile,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError
   } = useUpdateProfile();


  // --- Fonction qui charge ou réinitialise les données ---
  const resetForm = () => {
    // On remet les valeurs par défaut issues du store
    full_name.value = store.userInfo?.full_name || '';
    email.value = store.userInfo?.email || '';

    // On vide les champs de mot de passe car par sécurité ils ne sont jamais stockés
    new_password.value = '';
    confirm_new_password.value = '';

    // On cache l'erreur
    password_non_confirmed.value = false;
  };

  // Au chargement du composant, on initialise
  onMounted(() => {
    resetForm();
  });

  // Le bouton Cancel appelle simplement resetForm
  const handleCancel = () => {
    resetForm();
  };



  // On surveille les deux champs de mot de passe pour vérifier la confirmation
  watch([new_password, confirm_new_password], () => {

    // Si le champ de confirmation n'est pas vide
    if (confirm_new_password.value !== '') {
      // On compare instantanément les deux valeurs
      if (new_password.value !== confirm_new_password.value) {
        messageError.value = "Les mots de passe ne correspondent pas.";
        password_non_confirmed.value = true;
      } else {
        password_non_confirmed.value = false;
      }
    }
  });



  const handleSubmit = () => {

    // Au moment d'envoyer, on fait une dernière vérification de sécurité
    if (new_password.value !== confirm_new_password.value && new_password.value !== '') {
      messageError.value = "Les mots de passe ne correspondent pas.";
      password_non_confirmed.value = true;
      return; // On n'envoie pas si les mots de passe ne correspondent pas
    }

    if (new_password.value.length < 8 && new_password.value !== '') {
      messageError.value = "Le mot de passe doit contenir au moins 8 caractères.";
      password_non_confirmed.value = true;
      return; // On n'envoie pas si le mot de passe est trop court
    }


    // Préparation des données à envoyer
    const updateData: UpdateProfileData = {
      full_name: full_name.value,
      email: email.value,
      password: new_password.value !== '' ? new_password.value : undefined // On n'envoie le mot de passe que s'il a été rempli
    };

    // Appel API pour mettre à jour le profil utilisateur
    updateProfile({profileData: updateData , id: store.userInfo?.id || 1}, {
      onSuccess(data) {
        console.log('Profil mis à jour avec succès :', data);
        // Optionnel : Mettre à jour les infos dans le store
        store.setUserInfo(data.user);
        showToast('success', 'Profil mis à jour avec succès!');

        // Réinitialiser le formulaire
        resetForm();
      },
      onError(err) {
        console.error('Erreur lors de la mise à jour du profil :', err);
        showToast('error', 'Erreur lors de la mise à jour du profil.');
      }
    });

  }

</script>



 <!-- <template v-if="store.userInfo?.permissions?.length">
                <span
                  v-for="permission in store.userInfo.permissions"
                  :key="permission"
                  class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                >
                  {{ permission }}
                </span>
              </template> -->

              <!-- <p v-else class="text-sm text-gray-500 italic">Aucune permission spécifique.</p> -->
