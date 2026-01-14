
<script setup lang="ts">
import { Pencil, Plus, ShieldCheck, Check, X, ChevronsUpDown , Archive, ArchiveRestore } from 'lucide-vue-next';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import { computed, ref} from 'vue';
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
import { useDeleteRole, useGetRoles, useRestoreRole } from '../../hook/role';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import CompositionError from '../../components/composition/CompositionError.vue';
import type { Role, RoleUpdate } from '../../type/role';
import type { Permission } from '../../type/permission';
import { useDeletePermission, useGetPermissions, useGetPermissionsNoPaginate, useRestorePermission } from '../../hook/permission';
import Button from '../../components/ui/button/Button.vue';
import { useUpdateRole } from '../../hook/role';
import { showToast } from '../../lib/toast';
import RoleFormView from './RoleFormView.vue';
import CompositionModal from '../../components/composition/CompositionModal.vue';
import CompositionListEmpty from '../../components/composition/CompositionListEmpty.vue';
import CompositionTable from '../../components/composition/CompositionTable.vue';
import CompositionPagination from '../../components/composition/CompositionPagination.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import { watch } from 'vue';
import { getErrorMessage } from '../../lib/errorMessage';
import CompositionVerifyButton from '../../components/composition/CompositionVerifyButton.vue';
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue';
import Badge from '../../components/ui/badge/Badge.vue';




// Initialisation
const editingId = ref<number | null>(null);
const editForm = ref({ name: '', description: '',permissions: [] as Permission[]});
const open = ref(false)
const triggerRef = ref(null)
const { width } = useElementSize(triggerRef)
const isRoleModalOpen = ref(false)

const currentPageRole = ref(1);
const itemsPerPageRole = ref(10);
const filterArchivRole = ref("all");

const currentPagePerms = ref(1);
const itemsPerPagePerms = ref(10);
const filterArchivPerms = ref("all");
const search = ref('')


const filterOptions = [
  { label: 'Actifs', value: 'false' },
  { label: 'Archivés', value: 'true' }
]


const filterParamsRole = computed(() => ({
  archive: filterArchivRole.value,
  page: currentPageRole.value,
  limit: itemsPerPageRole.value
}))


const filterParamsPerms = computed(() => ({
   archive: filterArchivPerms.value,
  page: currentPagePerms.value,
  limit: itemsPerPagePerms.value
}))

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

// Colums Permissions
const columns = [
  { key: 'name', label: 'Nom technique'  },
  { key: 'description', label: 'Description' },
  { key: 'role', label: 'Rôles' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', class: 'w-10' },
]


// Hook listes Roles
const {
  data: dataRoles,
  isLoading: loadingRole,
  isError: ErrorRole,
  error: errorRole,
  refetch: getAllRoles
} = useGetRoles(filterParamsRole)


const roleResults = computed(() => dataRoles.value?.results || []);
const totalItemsRole = computed(() => dataRoles.value?.count || 0);


// Hook listes Permissions Avec pagination
const {
  data:dataPermissions,
  isLoading: loadingPermission,
  isError: ErrorPermission,
  error: errorPermission,
  refetch: getAllPermissions
} = useGetPermissions(filterParamsPerms)


const permissionResults = computed(() => dataPermissions.value?.results || []);
const totalItemsPermission = computed(() => dataPermissions.value?.count || 0);


const filteredData = computed(() => {
  return permissionResults.value.filter(item =>{
    const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase()) ||
                          item.description?.toLowerCase().includes(search.value.toLowerCase())
    let matchesArchive = true;
    if (filterArchivPerms.value !== 'all') {
      matchesArchive = item.archive === (filterArchivPerms.value === 'true');
    }
    return matchesSearch && matchesArchive;
  })
})


const getStatusColor = (status: boolean) => {
  switch (status) {
    case false: return 'bg-success/20 text-success border-success/30'
    case true: return 'bg-muted text-muted-foreground border-border'
  }
}

const getStatusLabel = (status: boolean) => {

  switch (status) {
    case false: return 'Actif'
    case true: return 'Archivé'
  }
}



const filterChangeRole = (val: string ) => {
  filterArchivRole.value = val;
  currentPageRole.value = 1;
}


// const filterChangePerms = (val: string ) => {
//   filterArchivPerms.value = val;
//   currentPagePerms.value = 1;
// }

watch([currentPageRole, itemsPerPageRole, filterArchivRole], () => {
  getAllRoles();
});

watch([currentPagePerms, itemsPerPagePerms, filterArchivPerms], () => {
  getAllPermissions();
});

// Hook listes Permissions sans pagination
const {
  data:dataPermissionsNoPaginate,
  isLoading: loadingPermissionNoPaginate,
} = useGetPermissionsNoPaginate()


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



// Hook Role Restore & Archive
const {
  mutate : archiveRole,
  isPending: archibePendingRole,
  isError : isArchiveErrorRole,
  error : errorArchiveRole

} = useDeleteRole()



const {
  mutate : restoreRole,
  isPending: restorePendingRole,
  isError : isrestorErrorRole,
  error : errorRestorRle

} = useRestoreRole()



// Hook Perms Restore & Archive
const {
  mutate : archivePerms,
  isPending: archibePendingPerms,
  isError : isArchiveErrorPerms,
  error : errorArchivePerms

} = useDeletePermission()



const {
  mutate : restorePerms,
  isPending: restorePendingPerms,
  isError : isrestorErrorPerms,
  error : errorRestorPerms

} = useRestorePermission()






// Methode  archive && restore role
const archivedRole = (id: number) => {
  archiveRole(id,{
     onSuccess: async () => {
        getAllRoles();
        getAllPermissions();
        showToast('success', 'Role archivé avec success');
     },
     onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
  })
}



const restoredRole = (id: number) => {
  restoreRole(id,{
     onSuccess: async () => {
        getAllRoles();
        getAllPermissions();
        showToast('success', 'Role restoré avec success');
     },
     onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
  })
}





// Methode  archive && restore Perms
const archivedPerms = (id: number) => {
  archivePerms(id,{
     onSuccess: async () => {
        getAllRoles();
        getAllPermissions();
        showToast('success', 'Permission archivé avec success');
     },
     onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
  })
}



const restoredPerms = (id: number) => {
  restorePerms(id,{
     onSuccess: async () => {
        getAllRoles();
        getAllPermissions();
        showToast('success', 'Permission restoré avec success');
     },
     onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
  })
}


const handleRoleSuccess = () => {
  getAllRoles();
  getAllPermissions();
  isRoleModalOpen.value = false;
};

const handleRoleCancel = () => {
  isRoleModalOpen.value = false;
}




</script>


<template>

  <CompositionLoading v-if="loadingRole || loadingPermission || updateLoading || loadingPermissionNoPaginate || archibePendingRole || restorePendingRole || archibePendingPerms || restorePendingPerms" />

  <CompositionError
    v-else-if="ErrorRole || ErrorPermission || isErrorRole || isArchiveErrorRole || isrestorErrorRole || isArchiveErrorPerms || isrestorErrorPerms"
    :error="errorRole?.message || errorPermission?.message || errorRoleUpdate?.message || errorArchiveRole?.message || errorRestorRle?.message || errorArchivePerms?.message || errorRestorPerms?.message"
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

          <CompositionModal title="Role" v-model:open="isRoleModalOpen">
            <template #trigger>
              <div class="flex items-center gap-4">
                <Button class=" flex items-center rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
                  <Plus class="w-6 h-6 mr-2" />
                  Role
                </Button>
              </div>
            </template>
            <template #content>
              <RoleFormView @success="handleRoleSuccess" @cancel="handleRoleCancel"/>
            </template>
          </CompositionModal>
        </div>
      </template>
    </CompositionPageHeader>

    <main>

      <Tabs default-value="role">

        <div class="flex items-start">
            <TabsList class="flex space-x-4 py-4 px-2 font-medium text-sm rounded-none rounded-t-2xl border border-border">
              <TabsTrigger value="role" class="!shadow-none py-2 px-3 border border-border data-[state=active]:text-primary"> Roles </TabsTrigger>
              <TabsTrigger value="permission" class="!shadow-none py-2 px-3 border border-border data-[state=active]:text-primary"> Permissions </TabsTrigger>
            </TabsList>
        </div>

        <div class="card rounded-none p-4">
          <TabsContent value="role">
            <div class="p-2 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p class="mt-1 mb-4 text-center text-text font-medium ">Double-cliquez sur une carte pour modifier</p>
              <!-- <p class="font-bold text-text huge">Liste des utilisateurs</p> -->
              <div  class="mb-4">
                <Select v-model="filterArchivRole" @update:model-value="(val:any) => filterChangeRole(val as string)">
                  <SelectTrigger class="input-custom">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" class="select-item-custom">Tous</SelectItem>
                    <SelectItem value="false" class="select-item-custom">Active</SelectItem>
                    <SelectItem value="true" class="select-item-custom">Achivés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CompositionListEmpty v-if="roleResults.length === 0" title="Aucun role" description="Aucune donnée trouvée dans la base de données." :icon="ShieldCheck" />
              <div v-else>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div
                    v-for="role in roleResults"
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
                                  class="w-full relative flex items-center justify-center bg-background border-border font-normal h-8"
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
                                        v-for="p in dataPermissionsNoPaginate"
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

                        <CompositionVerifyButton :if="!role.archive">
                          <div v-if="editingId !== role.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click.stop="startEdit(role)" class="p-2 hover:bg-muted rounded-full text-text hover:text-primary">
                              <Pencil class="h-4 w-4" />
                            </button>
                            <CompositionConfirmDialog @confirm="archivedRole(role.id)" header="Suppression de role" description="Êtes-vous sûr de vouloir Archiver ?" cancelText="Annuler" actionText="Archiver" >
                               <template #dialogButton>
                                  <button class="p-2 hover:bg-muted rounded-full text-text hover:text-destructive transition-colors">
                                    <Archive class="h-4 w-4" />
                                  </button>
                               </template>
                            </CompositionConfirmDialog>
                          </div>
                        </CompositionVerifyButton>

                         <CompositionVerifyButton :if="role.archive">
                          <div v-if="editingId !== role.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CompositionConfirmDialog @confirm="restoredRole(role.id)" header="Restoration de role" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                              <template #dialogButton>
                                  <button class="p-2 hover:bg-muted rounded-full text-text hover:text-destructive transition-colors">
                                    <ArchiveRestore class="h-4 w-4" />
                                  </button>
                              </template>

                            </CompositionConfirmDialog>
                          </div>
                        </CompositionVerifyButton>

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
                <div class="flex items-center justify-end px-2 py-8">
                  <CompositionPagination
                    :total="totalItemsRole"
                    :limit="itemsPerPageRole"
                    v-model:perPage="itemsPerPageRole"
                    v-model:model-value="currentPageRole"

                  />
                </div>
              </div>

          </TabsContent>

          <TabsContent value="permission">

            <div class="rounded-none overflow-hidden">
              <div>
                <CompositionTable
                  :columns="columns"
                    :data="filteredData"
                    :total="totalItemsPermission"
                    v-model:limit="itemsPerPagePerms"
                    v-model:currentPage="currentPagePerms"

                    searchable
                    v-model:search="search"
                    searchPlaceholder="Rechercher par nom ou description..."

                    filterable
                    v-model:filterValue="filterArchivPerms"
                    :filterOptions="filterOptions"
                    filterPlaceholder="Statut"
                >

                  <template #cell-role="{ row }">
                    <div class="flex flex-wrap gap-1">
                      <Badge
                        v-for="role in row.roles"
                        variant="outline"
                        :key="role.id"
                        class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-warning text-warning border-warning"
                      >
                        {{ role.name }}
                      </Badge>
                    </div>
                  </template>
                  <template #cell-status="{ row }">
                    <Badge
                      variant="outline"
                      :class="cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', getStatusColor(row.archive))"
                    >
                      {{ getStatusLabel(row.archive) }}
                    </Badge>
                  </template>
                  <template #cell-actions="{ row }">

                    <CompositionVerifyButton :if="!row.archive">
                        <CompositionConfirmDialog @confirm="archivedPerms(row.id)" header="suppression d'une permission" description="Êtes-vous sûr de vouloir archiver ?" cancelText="Annuler" actionText="Archiver" >
                          <template #dialogButton>
                            <div class="flex justify-end ">
                                <button class="p-2 rounded text-text hover:text-destructive">
                                  <Archive :size="16"/>
                                </button>
                            </div>
                          </template>
                        </CompositionConfirmDialog>
                     </CompositionVerifyButton>

                     <CompositionVerifyButton :if="row.archive">
                        <CompositionConfirmDialog @confirm="restoredPerms(row.id)" header="Restoration d'une permission" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                          <template #dialogButton>
                            <div class="flex justify-end ">
                                <button class="p-2 rounded text-text hover:text-destructive">
                                  <ArchiveRestore :size="16"/>
                                </button>
                            </div>
                          </template>
                        </CompositionConfirmDialog>
                     </CompositionVerifyButton>
                  </template>
                </CompositionTable>
              </div>
            </div>

          </TabsContent>
        </div>

      </Tabs>

    </main>

  </div>


</template>
