

<template>
  <CompositionLoading v-if="isLoggingIn" />

  <div v-else class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Connexion</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
          <div class="mt-2">
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="Entrez votre email"
              autocomplete="email"
              required
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <div class="mt-2">
            <BasePasswordInput
                v-model="userPassword"
                placeholder="Entrer votre Mot de passe"
                container-class="w-full"
            />
          </div>
        </div>

        <p v-if="isError" class="text-xs text-red-600 font-medium">
          {{ (error as any)?.response?.data?.message || 'Identifiants incorrects' }}
        </p>

        <div>
          <button
            type="submit"
            :disabled="isLoggingIn"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoggingIn ? 'Connexion...' : 'Sign in' }}
          </button>
        </div>
      </form>

      <div class="mt-10 text-center text-sm/6 text-gray-500">
        <div class="text-sm">
          <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">

  import { ref } from 'vue';
  import { useLogin } from '../../hook/user'; // Import de ton hook
  import BasePasswordInput from '@/components/base/BasePasswordInput.vue';
  import CompositionLoading from "@/components/composition/CompositionLoading.vue";
  import { userStore } from '../../stores/user';
  import router from '../../router';


  // Initialisation
  const userPassword = ref('');
  const email = ref('');
  const storeUser = userStore();


  // Utilisation du hook de login
  const {
    mutate: login,
    isPending: isLoggingIn,
    isError,
    error
  } = useLogin();



  const onSubmit = () => {
    login(
      {
        email:email.value,
        password:userPassword.value
      },
      {
        onSuccess(data) {
          console.log(data);
          // On stocke les infos reçues du backend dans Pinia
          storeUser.setUserInfo(data.user);
          router.push({ name: 'admin.dashboard' }); // Redirige après succès
        },
        onError(err) {
          console.error('Erreur de connexion :', err);
        }
      }
    );
  };

</script>
