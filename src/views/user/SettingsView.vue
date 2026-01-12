

<template>
  <CompositionLoading v-if="isUpdating || loadingPerms" />
  <CompositionError v-else-if="isUpdateError" :error="updateError?.message"/>

  <!-- <form v-else @submit.prevent="handleSubmit" class="w-full"> -->
    <div v-else class="card rounded-none p-6">
      <div class="border-b border-border pb-6">
        <h2 class="font-medium text-text">Profil</h2>
        <p class="mt-1 text-sm/6 text-text">Gérez vos informations personnelles et votre sécurité.</p>

        <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <Field name="full_name" v-slot="{ field, errorMessage }">
            <div class="sm:col-span-3">
              <label for="full_name" class="text-sm/6 font-medium text-text">Nom Complet</label>
              <div class="mt-2">
                <input
                  type="text"
                  v-bind="field"
                  id="full_name"
                  class="input-custom"
                />
              </div>
              <p v-if="errorMessage" class="mt-1 text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
            </div>
          </Field>

          <Field name="email" v-slot="{ field, errorMessage }">
            <div class="sm:col-span-4">
              <label for="email" class="text-sm/6 font-medium text-text">Adresse Email</label>
              <div class="mt-2">
                <input
                  id="email"
                  type="email"
                  v-bind="field"
                  class="input-custom"
                />
              </div>
              <p v-if="errorMessage" class="mt-1 text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
            </div>
          </Field>

          <Field name="password" v-slot="{ field, errorMessage }">
            <div class="sm:col-span-3">
              <BasePasswordForceInput
                label="Nouveau mot de passe"
                v-bind="field"
                placeholder="Entrer le mot de passe"
              />
              <p v-if="errorMessage" class="mt-1 text-xs text-destructive font-medium italic">{{ errorMessage }}</p>
            </div>
          </Field>

          <div class="sm:col-span-3">
            <BasePasswordForceInput
              label="Confirmer le nouveau mot de passe"
              v-model="confirm_new_password"
              placeholder="Répéter le mot de passe"
              :show-strength="false"
            />
            <p class="mt-1 text-xs text-destructive font-medium italic">
              {{ messageError }}
            </p>
          </div>

          <div class="sm:col-span-3">
            <label class=" text-sm/6 font-semibold text-text">Rôle actuel</label>
            <div class="mt-2">
              <span class="inline-flex items-center rounded-md bg-background px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-ring">
                {{ store.userInfo?.role?.name || "Administrateur" }}
              </span>
            </div>
          </div>

          <div class="sm:col-span-6">
            <label class="text-sm/6 font-semibold text-text">Permissions accordées</label>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="perm in permissionsRole"
                :key="perm.id"
                class="inline-flex items-center rounded-md bg-background px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-ring"
              >
                {{ perm.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-x-6">
        <button
          type="button"
          @click="handleCancel"
          class="w-full sm:w-auto text-sm/6 font-semibold text-destructive text-center py-2"
        >
          Annuler
        </button>
        <button
          type="button"
          @click="onSubmit"
          class="w-full sm:w-auto rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>


  <!-- </form> -->
</template>

<script setup lang="ts">

  import BasePasswordForceInput from '../../components/base/BasePasswordForceInput.vue';
  import { ref , computed, watch  } from 'vue';
  import { userStore } from '../../stores/user';
  import { useUpdateProfile } from '../../hook/user';
  import CompositionLoading from '@/components/composition/CompositionLoading.vue';
  import CompositionError from '@/components/composition/CompositionError.vue';
  import { showToast } from "../../lib/toast"
  import { validationSchemaProfile } from '../../validation/profileValidate';
  import { Field, useForm } from 'vee-validate';
import { useGetPermissionsRole } from '../../hook/role';





const store = userStore();

// 1. Initialisation du Formulaire
const { values, resetForm, handleSubmit } = useForm({
  validationSchema: validationSchemaProfile,
  initialValues: {
    full_name: store.userInfo?.full_name || "",
    email: store.userInfo?.email || "",
    password: undefined
  }
});



// États pour la confirmation de mot de passe
const confirm_new_password = ref(undefined);
const messageError = ref('');

// Computed pour vérifier la correspondance instantanément (Logique pure)
const isPasswordMismatch = computed(() => {
    if (values.password != undefined && confirm_new_password.value  != undefined) {
      if (values.password == confirm_new_password.value) {
        return true;
      }
      return false;
    }
    if (values.password == confirm_new_password.value ) {
      return true;
    }
    return false;
});

// Surveillance pour mettre à jour le message d'erreur (UI)
// On surveille les deux champs pour afficher/masquer l'erreur dynamiquement
watch([() => values.password, confirm_new_password], ([newPass, confirmPass]) => {
  if (newPass === undefined && confirmPass === undefined) {
    messageError.value = ''; // Cache l'erreur si tout est vidé (Reset)
  } else if (confirmPass !== undefined && newPass !== confirmPass) {
    messageError.value = "Les mots de passe ne correspondent pas.";
  } else {
    messageError.value = ''; // Cache l'erreur si ça correspond
  }
});

// 4. Calcul des initiales
const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(part => part)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
};

const { mutate: updateProfile, isPending: isUpdating ,isError:isUpdateError,error:updateError} = useUpdateProfile();
const { data: permissionsRole , isLoading:loadingPerms } = useGetPermissionsRole(store.userInfo?.id || 0)


// 5. Logique de soumission
const onSubmit = handleSubmit((formValues) => {
  // Sécurité finale
  console.log(isPasswordMismatch.value);

  if (!isPasswordMismatch.value) {
    messageError.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  const updateData = {
    full_name: formValues.full_name,
    email: formValues.email,
    password: formValues.password || undefined
  };

  updateProfile(
    { profileData: updateData, id: store.userInfo?.id || 0 },
    {
      onSuccess(data) {
        const updatedUser = {
          ...data.user,
          initials: getInitials(data.user.full_name)
        };
        store.setUserInfo(updatedUser);

        // Vide les champs Vee-Validate (password devient "")
        resetForm({ values: { ...formValues, password: "" } });

        // Vide le champ de confirmation local
        confirm_new_password.value = undefined;

        // Vide explicitement le message d'erreur
        messageError.value = "";

        showToast('success', 'Profil mis à jour avec succès!');
      },
      onError(updateError) {
        showToast('error', updateError.message || "Erreur lors de la mise à jour");
      }
    }
  );
});


const handleCancel = () => {

  // Réinitialise Vee-Validate aux valeurs initiales (userInfo)
  resetForm({
    values: {
      full_name: store.userInfo?.full_name || "",
      email: store.userInfo?.email || "",
      password: undefined
    }
  });

  // Réinitialise les variables locales que Vee-Validate ne voit pas
  confirm_new_password.value = undefined;
  messageError.value = "";
};

</script>
