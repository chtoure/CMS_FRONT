


<template>
  <CompositionLoading v-if="isSendCode || isVerifying || isResetting" />

  <div v-else class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
      <h2 class="mt-10 text-center text-huge font-bold tracking-tight text-text">Mot de passe oublié</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div v-if="!sendEmail && !reset_password">
          <label for="email" class="block font-medium text-text">Email address</label>
          <div class="mt-2">
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="Entrez votre email"
              autocomplete="email"
              required
              class="input-custom"
            />
          </div>
        </div>

        <div v-if="sendEmail">
            <label for="code" class="block font-medium text-text">Code</label>
            <div class="mt-2">
              <input
                v-model="code"
                type="text"
                id="code"
                placeholder="Entrez le code reçu par email"
                autocomplete="code"
                required
                class="input-custom"
              />
            </div>

            <div class="mt-2 text-center">
              <p class="text-xs text-text " v-if="sendEmail && !reset_password">Veuillez entrer le code envoyé à votre adresse email.</p>
              <p v-if="timeLeft > 0" class="text-sm text-text">
                Le code expire dans : <span class="font-medium text-primary">{{ formattedTime }}</span>
              </p>
              <p v-else class="text-sm text-destructive font-medium">Le code a expiré.</p>
            </div>
        </div>

         <div v-if="reset_password">
          <p class="text-xs text-text">Veuillez entrer votre nouveau mot de passe.</p>

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
          </div>
          <p v-if="password_non_confirmed" class="mt-2 text-xs text-destructive font-medium italic">
              {{  messageError }}
          </p>

         </div>


        <p v-if="isError" class="text-xs text-destructive font-medium">
          {{ (error as any)?.response?.data?.message || 'Erreur lors de l\'envoi du code' }}
        </p>

        <p v-if="isErrorVerify" class="text-xs text-destructive font-medium">
          {{ (errorVerify as any)?.response?.data?.message || 'Code invalide' }}
        </p>
        <p v-if="isErrorReset" class="text-xs text-destructive font-medium">
          {{ (errorReset as any)?.response?.data?.message || 'Erreur lors du changement de mot de passe' }}
        </p>




        <div>
          <button
            type="submit"
            :disabled="isSendCode"
            class="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6  text-white shadow-sm hover:bg-active-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ getButtonText() }}
          </button>
        </div>
      </form>

      <div class="flex items-center justify-between mt-10 text-center text-sm/6 text-text">
        <div class="">
          <router-link :to="{ name: 'auth.login' }" class=" text-primary font-semibold opacity-80">Connexion</router-link>
        </div>
         <div class="">
          <button v-if="sendEmail" @click="onSubmitSendCode" type="button"
          :disabled="timeLeft > 0 && !isErrorVerify" class=" text-accent hover:text-accent-foreground">Renvoyer le code</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">

  import { ref, computed, onUnmounted } from 'vue';
  import CompositionLoading from "@/components/composition/CompositionLoading.vue";
  import { userStore } from '../../stores/user';
  import router from '../../router';
  import { useForgotPassword } from '../../hook/user';
  import { useVerifyCode } from '../../hook/user';
  import { useResetPassword } from '../../hook/user';
import { watch } from 'vue';
import BasePasswordForceInput from '../../components/base/BasePasswordForceInput.vue';



  // Initialisation
  const email = ref('');
  const code = ref('');
  const new_password = ref('');
  const confirm_new_password = ref('');
  const storeUser = userStore();
  const sendEmail = ref(false);
  const reset_password = ref(false);
  const password_non_confirmed = ref(false);
  const messageError = ref('');



  // --- AJOUT : Logique du Timer ---
  const timeLeft = ref(0);
  let timerInterval: ReturnType<typeof setInterval>;

  const formattedTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60);
    const s = timeLeft.value % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  });

  const startTimer = (seconds: number = 600) => { // 10 minutes
    timeLeft.value = seconds;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) timeLeft.value--;
      else clearInterval(timerInterval);
    }, 1000);
};

onUnmounted(() => clearInterval(timerInterval));



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


  // Utilisation du hook de send code to email
  const {
    mutate: sendCode,
    isPending: isSendCode,
    isError,
    error
  } = useForgotPassword();


  // Utilisation du hook de verify code
  const {
    mutate: verifyCode,
    isPending: isVerifying,
    isError: isErrorVerify,
    error: errorVerify
  } = useVerifyCode();



  // Utilisation du hook de reset password && login
  const {
    mutate: resetPassword,
    isPending: isResetting,
    isError: isErrorReset,
    error: errorReset
  } = useResetPassword();



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
const onSubmit = () => {
  if (!sendEmail.value && !reset_password.value) onSubmitSendCode();
  else if (sendEmail.value) onSubmitVerifyCode();
  else if (reset_password.value) onSubmitResetPassword();
};




// Soumission du formulaire send code
const onSubmitSendCode = () => {

  if (!email.value) {
    console.log("Email obligatoire")
    return ;
  }

   sendCode(
      email.value,
      {
        onSuccess(data) {
          sendEmail.value = true;

          // On stocke les infos reçues du backend dans Pinia
          storeUser.setUserInfo({...data.user, initials:initials(data.user.full_name) });
          startTimer(600); // Démarre le timer à l'envoi réussi
        },
        onError(error) {
          console.error('Erreur lors de l\'envoi du code :', error);
        }
      }
    );
};


// Soumission du formulaire verify code
const onSubmitVerifyCode = () => {

  if (!storeUser.userInfo?.id) {
    console.error('ID utilisateur non défini.');
    return;
  }

  verifyCode(
    {
      id: storeUser.userInfo?.id,
      code: code.value
    },
    {
      onSuccess() {
        reset_password.value = true;
        sendEmail.value = false;
        clearInterval(timerInterval); // On arrête le timer si le code est bon
      },
      onError(error) {
        console.error('Erreur lors de la vérification du code :', error);
      }
    }
  );
};


// Soumission du formulaire reset password && login
const onSubmitResetPassword = () => {

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



  if (!storeUser.userInfo?.id) {
    console.error('ID utilisateur non défini.');
    return;
  }
  // donnée a envoyer
  const Data = {
    email: storeUser.userInfo?.email,
    password: new_password.value,
  };

  resetPassword(
    {
     resetData: Data,
      id: storeUser.userInfo?.id
    },
    {
      onSuccess(data) {
        // On stocke les infos reçues du backend dans Pinia
        storeUser.setUserInfo({...data.user, initials:initials(data.user.full_name) });
        reset_password.value = false;
        sendEmail.value = false;
        router.push({ name: 'admin.dashboard' }); // Redirige après succès
      },
      onError(error) {
        console.error('Erreur lors du changement de mot de passe :', error);
      }
    }
  );
};


// --- Helpers UI ---
const getButtonText = () => {
  if (reset_password.value) return 'Changer le mot de passe';
  return sendEmail.value ? 'Envoyer le code' : 'Envoyer';
};

</script>
