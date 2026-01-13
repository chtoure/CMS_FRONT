
<script setup lang="ts">
import { ref } from 'vue';
import {  ShieldCheck, Save, ChevronsUpDown, Check, Shield, PencilLine } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
// import CompositionError from '../../components/composition/CompositionError.vue';
import { showToast } from "../../lib/toast"
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
import { useAddRole } from '../../hook/role';
import { validationSchemaRole } from '../../validation/RoleSchema';
import { Field, useForm } from 'vee-validate';
import CompositionError from '../../components/composition/CompositionError.vue';
import { useGetPermissionsNoPaginate } from '../../hook/permission';
import type { Permission } from '../../type/permission';


// Initialisation
const open = ref(false)
const emit = defineEmits(['success', 'cancel'])

  const { handleSubmit,resetForm } = useForm({
    validationSchema: validationSchemaRole,
    initialValues: {
      name:"",
      description:"",
      permissionIds:[]
    }
  })



// Hook listes Permissions
const {
  data: dataPermissions,
  isLoading: loadinPermission,
} = useGetPermissionsNoPaginate()


// Hook add Role
const {
  mutate:addRole,
  isPending:pendingAddRole,
  isError:isErrorAddRole,
  error:errorRole
}= useAddRole()


// Fonction mutiplecchoice permissions
const mutipleschoices = (value: number[], p: Permission, handleChange: (ids: number[]) => void): void => {
  const currentIds = Array.isArray(value) ? [...value] : [];
  const index = currentIds.indexOf(p.id);

  if (index > -1) {
    currentIds.splice(index, 1); // Retire l'ID si déjà présent
  } else {
    currentIds.push(p.id); // Ajoute l'ID si absent
  }

  handleChange(currentIds); // Met à jour Vee-Validate
}



const onSubmit = handleSubmit(async (values) => {
  console.log(values);
  addRole({
    ...values
  },{
    onSuccess(){
      emit('success')
      showToast('success', 'Role créer avec succès');
    },
    onError: (errorRole) => {
      showToast('error', `Erreur lors de la creation de role : ${errorRole.message || 'Erreur inconnue'}`);
    }
  })
})

const handleCancel = () =>{
  resetForm()
  emit('cancel')
}

</script>

<template>



  <div>

    <CompositionLoading v-if=" loadinPermission || pendingAddRole" />
    <CompositionError v-else-if="isErrorAddRole" :error="errorRole?.message"/>
    <main v-else>
      <div  class="w-full">
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-huge font-bold text-text">
              Creer Un role
            </h1>
          </div>
        </div>

        <!-- <form @submit.prevent="handleSubmit" class="space-y-8"> -->

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div class="space-y-6">
              <Field name="name" v-slot="{ field, errorMessage }">
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-medium text-text">
                    <ShieldCheck class="size-4" />Role
                  </label>
                  <input
                    v-bind="field"
                    type="text"
                    placeholder="Ex: Administrateur"
                    class="input-custom"
                    :class="{ 'border border-destructive': errorMessage }"
                  />
                  <p v-if="errorMessage" class="text-xs text-destructive mt-1">{{ errorMessage }}</p>
                </div>
              </Field>

              <Field name="description" v-slot="{ field, errorMessage }">
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm font-medium text-text">
                    <PencilLine class="size-4" /> Description
                  </label>
                  <textarea
                    v-bind="field"
                    placeholder="Entrer une description"
                    class="input-custom"
                    :rows="3"
                    :class="{ 'border border-destructive': errorMessage }"
                  />
                  <p v-if="errorMessage" class="text-xs text-destructive mt-1">{{ errorMessage }}</p>
                </div>
              </Field>

            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm font-medium text-text">
                  <Shield class="size-4 text-text" /> Permissions
                </label>

                <Field name="permissionIds" v-slot="{ value, handleChange, errorMessage }">
                  <Popover v-model:open="open">
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        role="combobox"
                        :aria-expanded="open"
                        class="input-custom justify-between w-full h-auto min-h-10 font-normal"
                        :class="{ 'border-destructive': errorMessage }"
                      >
                        <div class="flex flex-wrap gap-1 text-left">
                          <span >Sélectionner des permissions...</span>
                        </div>
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent class="p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher une permission..." />
                        <CommandEmpty>Aucune permission trouvée.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              v-for="p in dataPermissions"
                              :key="p.id"
                              :value="p.name"
                              class="cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-white"
                              @select="mutipleschoices(value,p,handleChange)"
                              >
                              <Check
                                :class="cn(
                                  'mr-2 h-4 w-4',
                                  value?.includes(p.id) ? 'opacity-100' : 'opacity-0'
                                )"
                              />
                               <div class="flex flex-col">
                                  <span>{{ p.name }}</span>
                                  <span class="text-[10px] opacity-50">{{ p.description }}</span>
                                </div>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p v-if="errorMessage" class="text-xs text-destructive mt-1">{{ errorMessage }}</p>
                </Field>

              </div>
            </div>


          </div>

          <div class="pt-8  flex flex-col-reverse sm:flex-row justify-end gap-4">
            <Button
              type="button"
              @click="handleCancel"
              class="bg-destructive text-white h-10 "
            >
              Annuler
            </Button>

            <Button
              type="submit"
              @click="onSubmit"
              class="text-white h-10"
            >
            <Save class="size-4" />
              Enregistrer
            </Button>
          </div>
        <!-- </form> -->
      </div>
    </main>

  </div>
</template>
