

<template>
  <div class="min-h-screen">
    <CompositionLoading v-if="isLoggingIn" />

  <div v-else class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
      <h2 class="mt-10 text-center text-huge font-bold tracking-tight text-text">Connexion</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <!-- <form @submit.prevent="onSubmit" class="space-y-4"> -->
      <Field name="email" v-slot="{ field, errorMessage }">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-text">Email address</label>
          <div class="mt-2">
            <input
              v-bind="field"
              type="email"
              id="email"
              placeholder="Entrez votre email"
              autocomplete="email"
              class="input-custom"
            />
            <p v-if="errorMessage" class="text-destructive text-xs mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </Field>

      <Field name="password" v-slot="{ field, errorMessage }">
        <div>
          <div class="mt-2">
            <BasePasswordInput
                v-bind="field"
                placeholder="Entrer votre Mot de passe"
                container-class="w-full"
            />
          </div>
          <p v-if="errorMessage" class="text-destructive text-xs mt-1">{{ errorMessage }}</p>
        </div>
      </Field>

        <p v-if="isError" class="mt-4 text-center text-destructive">
          {{ error?.message }}
        </p>

        <div class="mt-4">
          <Button
            @click="onSubmit"
            :disabled="isLoggingIn"
            class="w-full h-10"
          >
            {{ isLoggingIn ? 'Connexion...' : 'Se Loger' }}
          </Button>
        </div>
      <!-- </form> -->

      <div class="mt-10 text-center text-sm/6 text-text opacity-80">
        <div class="text-sm">
          <router-link :to="{ name: 'auth.forgot-password' }" class="font-semibold text-primary">Mot de passe oublié ?</router-link>
        </div>
      </div>
    </div>
  </div>
  </div>

</template>


<script setup lang="ts">

  import { useLogin } from '../../hook/user'; // Import de ton hook
  import BasePasswordInput from '@/components/base/BasePasswordInput.vue';
  import CompositionLoading from "@/components/composition/CompositionLoading.vue";
  import { userStore } from '../../stores/user';
  import router from '../../router';
  import Button from '../../components/ui/button/Button.vue';
  import { useForm,Field } from 'vee-validate';
  import { validationSchemaLogin } from '../../validation/loginValidate';





  // Initialisation
  const storeUser = userStore();
  const { handleSubmit } = useForm({
    validationSchema: validationSchemaLogin,
    initialValues: {
      email:"",
      password:""
    }
  })

  // Utilisation du hook de login
  const {
    mutate: login,
    isPending: isLoggingIn,
    isError,
    error
  } = useLogin();


  // Calcul des initiales sur 'full_name'
const initials = ((full_name:string) => {
  return full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
});



  // const onSubmit = handleSubmit(async (values)) => {
  //   login(
  //     {
  //       email:email.value,
  //       password:userPassword.value
  //     },

  //   );
  // };



  const onSubmit = handleSubmit(async (values) => {

      login({
        ...values
      },{
        onSuccess(data) {
          console.log(data);
          // On stocke les infos reçues du backend dans Pinia
          storeUser.setUserInfo({...data.user, initials:initials(data.user.full_name) });
          if (data.user.isLoggedIn === true) {
             router.push({ name: 'admin.dashboard' }); // Redirige sur dashboard
          }
          router.push({ name: 'auth.change-password' }); // Redirige sur changement de mot de passe
        },
        onError(err) {
          console.error('Erreur de connexion :', err);
        }
      }
    );
   })



</script>
