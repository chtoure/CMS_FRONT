<script setup lang="ts">

  import { useLogin } from '../../hook/user'; // Import de ton hook
  import BasePasswordInput from '@/components/base/BasePasswordInput.vue';
  import CompositionLoading from "@/components/composition/CompositionLoading.vue";
  import { userStore } from '../../stores/user';
  import Button from '../../components/ui/button/Button.vue';
  import { useForm,Field } from 'vee-validate';
  import { validationSchemaLogin } from '../../validation/loginValidate';
  import { useRouter } from 'vue-router';
  import { useGetPermissionsByRoleId } from '../../hook/permission';
  import { ref } from 'vue';
  import { useParameter } from '../../stores/parameter';
  import { storeToRefs } from 'pinia';


  const roleId= ref<number>(0)

  const { 
    data: permissions,
    refetch: refetchPermissions
   } = useGetPermissionsByRoleId(roleId);

  
  const store = useParameter();
  const { parameter } = storeToRefs(store);
  const storeUser = userStore();
  const { handleSubmit } = useForm({
    validationSchema: validationSchemaLogin,
    initialValues: {
      email:"",
      password:""
    }
  })
  const router = useRouter()


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
    console.log(values);
      login({
        ...values
      },{
        async onSuccess(data) {
          console.log(data);

          // Sauvegarde les tokens pour le fallback Bearer (si cookies bloqués en HTTP cross-site)
          storeUser.setTokens(data.accessToken ?? null, data.refreshToken ?? null);

          roleId.value = data.user?.role?.id || data.user?.role_id || 0

          await refetchPermissions()
          
          storeUser.setUserInfo({...data.user, initials:initials(data.user.full_name) }, permissions.value || []);
          if (data.user.isLoggedIn === true) {
             router.push({ name: 'admin.dashboard' }); 
          }
          router.push({ name: 'auth.change-password' }); 
        },
        onError(err) {
          console.error('Erreur de connexion :', err);
        }
      }
    );
   })



</script>


<template>

  <div class="flex justify-center items-center h-full" v-if="isLoggingIn">
    <CompositionLoading  />
  </div>

  <div v-else class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img v-if="parameter?.media?.type === 'image'" class="mx-auto h-20 w-auto" :src="parameter?.media?.file_path" alt="Your Company" />
      <video v-else-if="parameter?.media?.type === 'video'" autoplay loop muted class="mx-auto h-20 w-auto" :src="parameter?.media?.file_path" alt="Your Company" />
      <h2 class="mt-6 text-center text-huge font-bold tracking-tight text-text">Connexion</h2>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
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
          class="w-full h-10 text-white"
        >
          {{ isLoggingIn ? 'Connexion...' : 'Se Loger' }}
        </Button>
      </div>

      <div class="mt-10 text-center text-sm/6 text-text opacity-80">
        <div class="text-sm">
          <router-link :to="{ name: 'auth.forgot-password' }" class="font-semibold text-primary">Mot de passe oublié ?</router-link>
        </div>
      </div>
    </div>
  </div>


</template>


