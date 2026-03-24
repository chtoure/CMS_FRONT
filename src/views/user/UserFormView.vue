
<script setup lang="ts">
import { computed, ref } from 'vue';
import  type { AddUserData, UserProfile } from '../../type/user';
import { ShieldCheck, Mail, User, Save, ChevronsUpDown, Check } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
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
import { useGetRoles } from '../../hook/role';
import { useRouter } from 'vue-router';

const router= useRouter()


interface Props {
  initialData?: UserProfile;
  isEditing?: boolean;
  is_loading?: boolean;
  handleSubmit: (user?: AddUserData) => void;
}

const open = ref(false)

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  is_loading: false,
});


// --- État du formulaire ---
const full_name = ref(props.initialData?.full_name || '');
const email = ref(props.initialData?.email || '');
const role = ref(props.initialData?.role?.name || '');
const errors = ref<{ full_name?: string; email?: string , role?: string }>({});

const triggerRef = ref(null)
const { width } = useElementSize(triggerRef)



// --- Hook pour ajouter un utilisateur ---
// const {
//   mutate: addUser,
//   isPending: isAdding,
// } = useAddUser();


// // Hook : Upadate Profile (pour la modification)
// const {
//   mutate: updateProfile,
//   isPending:isUpdateProfiling,
// } = useUpdateProfile();


// Hook listes Roles sans pagination
const {
  data: dataRoles,
  isLoading: loadingRole,

} = useGetRoles()

const rolesResults = computed(() => dataRoles.value?.results || []);


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


const handleSubmitUser = () => {
  if (!validate()) return;

  const userData: AddUserData = {
    full_name: full_name.value,
    email: email.value,
    role: role.value,
  };

  props.handleSubmit(userData);

  router.back();
};

</script>

<template>

  <div  class="card rounded-none p-6 py-10">
    <form @submit.prevent="handleSubmitUser" class="space-y-8">
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
                  class="input-custom justify-center w-full font-normal h-9"
                >
                  {{ role
                      ? rolesResults?.find((r) => r.name === role)?.name
                      : "Sélectionner un rôle..."
                  }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent :style="{ width: `${width}px` }">
                <Command>
                  <CommandInput placeholder="Rechercher un rôle..." />
                  <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>

                  <CommandList class="group custom-scrollbar">
                    <div v-if="loadingRole">
                      <div class="flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </div>
                    <CommandGroup v-else>
                      <CommandItem 
                        v-for="r in rolesResults"
                        :key="r.id"
                        :value="r.name"
                        class="cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-white group-hover:data-[highlighted]:bg-transparent group-hover:data-[highlighted]:text-foreground hover:!bg-primary hover:!text-white"
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
          @click="()=>{router.back()}"
          class="bg-destructive text-white h-10 "
        >
          Annuler
        </Button>

        <Button
          :disabled="props.is_loading"
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
