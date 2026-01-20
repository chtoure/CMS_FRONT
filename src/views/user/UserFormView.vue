
<script setup lang="ts">
import { ref } from 'vue';
import  type { AddUserData, UpdateProfileData, UserProfile } from '../../type/user';
import {  ArrowLeft,  ShieldCheck, Mail, User, Save, ChevronsUpDown, Check } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
import { useAddUser } from '../../hook/user';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
// import CompositionError from '../../components/composition/CompositionError.vue';
import { showToast } from "../../lib/toast"
import { useUpdateProfile } from '../../hook/user';
import { cn } from '../../lib/utils';
import Popover from '../../components/ui/popover/Popover.vue';
import PopoverTrigger from '../../components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '../../components/ui/popover/PopoverContent.vue';
import Command from '../../components/ui/command/Command.vue';
import CommandInput from '../../components/ui/command/CommandInput.vue';
import CommandEmpty from '../../components/ui/command/CommandEmpty.vue';
import CommandList from '../../components/ui/command/CommandList.vue';
import CommandGroup from '../../components/ui/command/CommandGroup.vue';
import CommandItem from '../../components/ui/command/CommandItem.vue';
import { useElementSize } from '@vueuse/core';
import { useGetRolesNoPaginate } from '../../hook/role';
import { handleError } from '../../lib/error';


interface Props {
  initialData?: UserProfile;
  isEditing?: boolean;
}

const open = ref(false)

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
});


// --- État du formulaire ---
const full_name = ref(props.initialData?.full_name || '');
const email = ref(props.initialData?.email || '');
const role = ref(props.initialData?.role?.name || '');
const errors = ref<{ full_name?: string; email?: string , role?: string }>({});

const triggerRef = ref(null)
const { width } = useElementSize(triggerRef)



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


// Hook listes Roles sans pagination
const {
  data: dataRoles,
  isLoading: loadingRole,
  refetch: getAllRoles
} = useGetRolesNoPaginate()

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
      getAllRoles()
      showToast('success', 'utilisateur ajouté avec succès');
      emit('success');
    },
    onError: (error: Error) => {
      handleError(error)
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
        getAllRoles()
        showToast('success', 'utilisateur modifié avec succès');
        emit('success');
      },
      onError: (error: Error) => {
        handleError(error)
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

  <CompositionLoading v-if="isAdding || isUpdateProfiling || loadingRole" />
  <!-- <CompositionError v-else-if="isAddError" :error="addError?.message"/> -->

  <div v-else class="card rounded-none p-6">
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          @click="handleCancel"
          class="flex items-center gap-2 text-text hover:text-primary transition-colors"
        >
          <ArrowLeft class="size-4" :font-weight="1" />
        </button>
        <p class="huge font-bold text-text huge">
          {{ isEditing ? 'Modifier le profil' : 'Créer un nouvel utilisateur' }}
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div class="space-y-6">
          <p class="huge font-semibold text-primary uppercase tracking-wider">Informations personnelles</p>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-text">
              <User class="size-4" /> Nom complet
            </label>
            <input
              v-model="full_name"
              type="text"
              placeholder="Ex: Jean Dupont"
              class="input-custom"
              :class="{ 'border border-destructive': errors.full_name }"
            />
            <p v-if="errors.full_name" class="text-xs text-destructive mt-1">{{ errors.full_name }}</p>
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-text">
              <Mail class="size-4" /> Adresse Email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="jean@exemple.com"
              class="input-custom"
              :class="{ 'border border-destructive': errors.email }"
            />
            <p v-if="errors.email" class="text-xs text-destructive mt-1">{{ errors.email }}</p>
          </div>



        </div>

        <div class="space-y-6">
          <h2 class="text-sm font-semibold text-primary uppercase tracking-wider">Accès & Rôles</h2>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium text-text">
              <ShieldCheck class="size-4 text-text" /> Rôle utilisateur
            </label>

            <Popover v-model:open="open" class="w-full">
              <PopoverTrigger as-child>
                <Button
                  ref="triggerRef"
                  variant="outline"
                  role="combobox"
                  :aria-expanded="open"
                  class="input-custom justify-between w-full font-normal h-8"
                >
                  {{ role
                      ? dataRoles?.find((r) => r.name === role)?.name
                      : "Sélectionner un rôle..."
                  }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent :style="{ width: `${width}px` }">
                <Command>
                  <CommandInput placeholder="Rechercher un rôle..." />
                  <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>

                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="r in dataRoles"
                        :key="r.id"
                        :value="r.name"
                        class="select-item-custom cursor-pointer"
                        @select="() => {
                          role = r.name
                          open = false
                        }"
                      >
                        <Check
                          :class="cn(
                            'mr-2 h-4 w-4',
                            role === r.name ? 'opacity-100' : 'opacity-0'
                          )"
                        />
                        {{ r.name }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <p v-if="errors.role" class="text-xs text-destructive mt-1">{{ errors.role }}</p>

          </div>
        </div>


      </div>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-4">
        <Button
          type="button"
          @click="handleCancel"
          class="bg-destructive text-white h-10 "
        >
          Annuler
        </Button>

        <Button
          type="submit"
          class="text-white h-10"
        >
        <Save class="size-4" />
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
