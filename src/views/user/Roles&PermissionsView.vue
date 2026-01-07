
<script setup lang="ts">
import { Pencil, Plus, ShieldCheck, Check, X, Shield, Trash2, ChevronsUpDown } from 'lucide-vue-next';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import { ref } from 'vue';
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
import { cn } from '../../lib/utils';
import { useGetRoles } from '../../hook/role';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import CompositionError from '../../components/composition/CompositionError.vue';
import type { Role, RoleUpdate } from '../../type/role';
import type { Permission } from '../../type/permission';
import { useGetPermissions } from '../../hook/permission';
import Button from '../../components/ui/button/Button.vue';
import { useUpdateRole } from '../../hook/role';
import { showToast } from '../../lib/toast';
import RoleFormView from './RoleFormView.vue';
import CompositionModal from '../../components/composition/CompositionModal.vue';



// Initialisation
const editingId = ref<number | null>(null);
const editForm = ref({ name: '', description: '',permissions: [] as Permission[]});
const open = ref(false)
const triggerRef = ref(null)
const { width } = useElementSize(triggerRef)

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}



// Hook listes Roles
const {
  data: dataRoles,
  isLoading: loadingRole,
  isError: ErrorRole,
  error: errorRole,
  refetch: getAllRoles
} = useGetRoles()


// Hook listes Permissions
const {
  data:dataPermissions,
  isLoading: loadingPermission,
  isError: ErrorPermission,
  error: errorPermission,
  refetch: getAllPermissions
} = useGetPermissions()


// Hook update Role
const {
  mutate:updateRole,
  isPending:updateLoading,
  isError:isErrorRole,
  error:errorRoleUpdate
}= useUpdateRole()


// Activer le mode édition au double-clic
const startEdit = (role: Role) => {
  editingId.value = role.id;
  editForm.value = {
    name: role.name,
    description: role.description || '',
    permissions: role.permissions ? [...role.permissions] : []
  };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = (id: number) => {
  console.log("Sauvegarde de la permission", id, editForm.value);

const roleUpdateData: RoleUpdate = {
  name: editForm.value.name,
  description: editForm.value.description,
  permissionIds: editForm.value.permissions.map(p => p.id)
};
  updateRole({
    id,
    dataRole:roleUpdateData
  },{
    onSuccess(){
      getAllRoles();
      getAllPermissions();
      showToast('success', 'Role modifié avec succès');
    },
    onError(errorRoleUpdate){
      showToast('error', `Erreur lors de la modification de role : ${errorRoleUpdate.message || 'Erreur inconnue'}`);
    }
  })
  editingId.value = null;
};

// Fonction pour ajouter/retirer une permission dans editForm
const togglePermission = (permission: Permission) => {
  const index = editForm.value.permissions.findIndex(p => p.id === permission.id);
  if (index > -1) {
    editForm.value.permissions.splice(index, 1); // Retirer
  } else {
    editForm.value.permissions.push(permission); // Ajouter
  }
};


</script>


<template>

  <CompositionLoading v-if="loadingRole || loadingPermission || updateLoading" />

  <CompositionError
    v-else-if="ErrorRole || ErrorPermission || isErrorRole"
    :error="errorRole?.message || errorPermission?.message || errorRoleUpdate?.message"
  />

  <div v-else class="min-h-screen space-y-10">

    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex items-center gap-4">
            <ShieldCheck class="h-6 w-6" />
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Gestion des utilisateurs</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez les roles et permissions de votre systeme.</p>
            </div>
          </div>

          <CompositionModal title="Role">
            <template #trigger>
              <div class="flex items-center gap-4">
                <Button class=" flex items-center rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
                  <Plus class="w-6 h-6 mr-2" />
                  Role
                </Button>
              </div>
            </template>
            <template #content>
              <RoleFormView />
            </template>
          </CompositionModal>
        </div>
      </template>
    </CompositionPageHeader>

    <main>

      <Tabs default-value="role">

        <div class="flex border-b border-border mb-4 items-start">
            <TabsList class="flex space-x-4 py-4 px-2 font-medium text-sm rounded-none rounded-t-2xl border border-border">
              <TabsTrigger value="role" class="!shadow-none py-2 px-3 border border-border data-[state=active]:text-primary"> Roles </TabsTrigger>
              <TabsTrigger value="permission" class="!shadow-none py-2 px-3 border border-border data-[state=active]:text-primary"> Permissions </TabsTrigger>
            </TabsList>
        </div>

        <!-- Partie Role -->
        <TabsContent value="role">
          <p class="mt-1 mb-4 text-center text-text font-medium ">Double-cliquez sur une carte pour modifier</p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="role in dataRoles"
              :key="role.id"
              class="group cursor-pointer"
              @dblclick="startEdit(role)"
            >
              <div class="card p-5 h-auto transition-all hover:-translate-y-1 flex flex-col">

                <div class="flex items-start justify-between gap-4">

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <input
                        v-if="editingId === role.id"
                        v-model="editForm.name"
                        v-focus
                        class="bg-background border border-border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 ring-primary"
                        @keydown.enter="saveEdit(role.id)"
                        @keydown.esc="cancelEdit"
                      />
                      <div v-else class="flex text-primary items-center gap-2">
                        <ShieldCheck :size="16" />
                        <h3 class="text-lg font-medium leading-none tracking-tight text-text ">
                          {{ role.name }}
                        </h3>
                      </div>
                    </div>

                    <div>
                      <textarea
                        v-if="editingId === role.id"
                        v-model="editForm.description"
                        rows="2"
                        class="bg-background border border-border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 ring-primary resize-none"
                      />
                      <p v-else class="text-sm leading-relaxed text-text opacity-80 ">
                        {{ role.description || 'Aucune description disponible.' }}
                      </p>
                    </div>
                    <b></b>
                    <div v-if="editingId === role.id" class="mt-4 space-y-2">
                      <label class=" font-medium text-text tracking-tight">
                        Permissions associées
                      </label>

                      <Popover v-model:open="open">
                        <PopoverTrigger as-child>
                          <Button
                            ref="triggerRef"
                            variant="outline"
                            role="combobox"
                            class="w-full relative flex items-center justify-center bg-background border-border font-normal h-7"
                          >
                            <span class="truncate text-center mx-8">
                              {{ editForm.permissions.length > 0
                                  ? `${editForm.permissions.length} permission(s) selectionée(s)`
                                  : "Choisir les permissions..."
                              }}
                            </span>

                            <ChevronsUpDown class="absolute right-3 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent :style="{ width: `${width}px` }" class="p-0">
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
                                  @select="togglePermission(p)"
                                >
                                  <Check
                                    :class="cn(
                                      'mr-2 h-4 w-4 text-text',
                                      editForm.permissions.some(item => item.id === p.id) ? 'opacity-100' : 'opacity-0'
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

                      <div class="flex flex-wrap gap-1 mt-2">
                        <span v-for="p in editForm.permissions" :key="p.id" class="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded border border-primary/20">
                          {{ p.name }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="editingId !== role.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click.stop="startEdit(role)" class="p-2 hover:bg-muted rounded-full text-text hover:text-primary">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button class="p-2 hover:bg-muted rounded-full text-text hover:text-destructive transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div v-if="editingId === role.id" class="mt-4 pt-4 border-t border-border/10 flex justify-center gap-6">
                  <button
                    @click="saveEdit(role.id)"
                    class="flex items-center gap-1 px-4 py-1 text-success hover:bg-muted rounded-md transition-all text-xs font-bold tracking-widest"
                  >
                    <Check :size="16" stroke-width="3" /> Valider
                  </button>
                  <button
                    @click="cancelEdit"
                    class="flex items-center gap-1 px-4 py-1 text-destructive hover:bg-muted rounded-md transition-all text-xs font-bold  tracking-widest"
                  >
                    <X :size="16" stroke-width="3" /> Annuler
                  </button>
                </div>

              </div>
            </div>
          </div>
        </TabsContent>


        <!-- Partie Permission -->
        <TabsContent value="permission" class="mt-4">
          <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div>
                <h3 class="font-medium text-text">Permissions</h3>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left font-medium">
                <thead class="bg-muted/30 border-b border-border">
                  <tr>
                    <th class="p-4 text-xs font-medium text-text uppercase">Nom technique</th>
                    <th class="p-4 text-xs font-medium text-text uppercase">Description</th>
                    <th class="p-4 text-xs font-medium text-text uppercase">Rôles</th>
                    <th class="p-4 text-xs font-medium text-text uppercase">Status</th>
                    <th class="p-4 text-xs font-medium text-text uppercase text-right w-20"></th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-border">
                  <tr
                    v-for="permission in dataPermissions"
                    :key="permission.id"
                    class="group hover:bg-muted/40"
                  >
                    <td class="p-4">

                      <div  class="flex items-center gap-2">
                        <Shield :size="14" class="text-text" />
                        <span class="text-sm font-medium tracking-tight">{{ permission.name }}</span>
                      </div>
                    </td>

                    <td class="p-4">

                      <span  class="text-xs text-text line-clamp-1">
                        {{ permission.description }}
                      </span>
                    </td>

                    <td class="p-4">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="role in permission.roles"
                          :key="role.id"
                          class="text-[9px] px-2 py-0.5 rounded-full border border-border bg-muted font-bold"
                        >
                          {{ role.name }}
                        </span>
                      </div>
                    </td>

                    <td class="p-4">
                      <span class="text-[9px] px-2 py-0.5 rounded-full border border-border bg-muted font-bold"> Active </span>
                    </td>

                    <td class="p-4 text-right">

                      <div class="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <button class="p-2 hover:bg-muted rounded text-text hover:text-destructive">
                            <Trash2 :size="16"/>
                          </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </main>

  </div>


</template>
