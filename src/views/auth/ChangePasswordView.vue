



<template>

  <CompositionLoading v-if="isLoading" />

  <div v-else class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-text">Changer le mot de passe</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="handleSubmit" class="space-y-4">

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
            <p v-if="password_non_confirmed || isError" class="mt-2 text-xs text-destructive font-medium italic">
              {{ (error as any)?.response?.data?.message || messageError }}
            </p>
          </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-primary shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
          {{ isLoading ? 'Changement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</template>


<script setup lang="ts">
  import BasePasswordForceInput from '../../components/base/BasePasswordForceInput.vue';
  import { ref, watch } from 'vue';
  import CompositionLoading from "@/components/composition/CompositionLoading.vue";
  import router from '../../router';
  import { useChangePassword } from '../../hook/user';
  import { userStore } from '../../stores/user';


  // Initialisation
  const new_password = ref('');
  const confirm_new_password = ref('');
  const password_non_confirmed = ref(false);
  const messageError = ref('');
  const store = userStore();


  // Utilisation du hook change password
  const {
    mutate: updatePassword,
    isPending: isLoading,
    isError,
    error
  } = useChangePassword();






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



    // Calcul des initiales sur 'full_name'
  const initials = ((full_name:string) => {
    return full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  });


  // Soumission du formulaire genérale
  const handleSubmit = () => {

    if (!new_password.value || !confirm_new_password.value ) {
      messageError.value = "Tous les champs sont obligatoires.";
      password_non_confirmed.value = true;
      return; // On n'envoie pas si un des champs est vide

    }

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



    if (!store.userInfo?.id) {
      messageError.value = "Erreur: ID utilisateur non disponible.";
      password_non_confirmed.value = true;
      return;
    }

    updatePassword(
      {
        passwordData: { newPassword: new_password.value },
        id: store.userInfo.id
      },
      {
        onSuccess(data) {
          // On stocke les infos reçues du backend dans Pinia
          store.setUserInfo({...data.user, initials:initials(data.user.full_name) });
          router.push({ name: 'admin.dashboard' }); // Redirige après succès
        },
        onError(error) {
          messageError.value ="Erreur lors de la mise à jour du mot de passe. ressayer.";
          password_non_confirmed.value = true;
          console.error('Erreur de mise à jour du mot de passe :', error);
        }
      }
    );

  };

</script>
