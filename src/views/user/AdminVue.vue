

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGetUsers } from '../../hook/user';
import type { UserProfile } from '../../type/user';
import { Users, UserPlus, Pencil, MoreHorizontal, Archive, ArchiveRestore } from 'lucide-vue-next';


// Composants convertis
import UserFormView from './UserFormView.vue';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import Button from '@/components/ui/button/Button.vue';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import CompositionTable from '../../components/composition/CompositionTable.vue';
import CompositionListEmpty from '../../components/composition/CompositionListEmpty.vue';
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue';
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue';
import { watch } from 'vue';
import { useDeleteUser, useRestoreUser } from '../../hook/user';
import { showToast } from '../../lib/toast';
import { getErrorMessage } from '../../lib/errorMessage';
import { userStore } from '../../stores/user';
import CompositionVerifyButton from '../../components/composition/CompositionVerifyButton.vue';




const search = ref('');
const isEditing = ref(false);
const selectedUser = ref<UserProfile | undefined>(undefined);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const filterArchiv = ref("all");
const storeUser = userStore();


  const filterParams = computed(() => ({
    archive: filterArchiv.value,
    page: currentPage.value,
    limit: itemsPerPage.value
  }));


  // 1. Données & États
const {
  data: users,
  isLoading,
  isError: isgetError,
  error: getError,
  refetch: refetchUsers
} = useGetUsers(filterParams);


  const filterChange = (val: string ) => {
    filterArchiv.value = val;
    currentPage.value = 1;
  }



const userResults = computed(() => users.value?.results || []);
const totalItems = computed(() => users.value?.count || 0);


  watch([currentPage, itemsPerPage, filterArchiv], () => {
    refetchUsers();
  });


const {
  mutate : archiveUser,
  isPending: archibePending,
  isError : isArchiveError,
  error : errorArchive

} = useDeleteUser()



const {
  mutate : restoreUser,
  isPending: restorePending,
  isError : isrestorError,
  error : errorRestor

} = useRestoreUser()



// 2. Recherche filtrée (équivalent de useMemo)
const filteredUsers = computed(() => {
  if (!userResults.value) return [];
  if (!search.value.trim()) return userResults.value;
  const query = search.value.toLowerCase();
  return userResults.value.filter((u:UserProfile) =>
    u.full_name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );
});



const archivedUser = (id: number) => {
  archiveUser(id,{
     onSuccess: async () => {
       refetchUsers();
        showToast('success', 'Utilisateur archivé avec success');
     },
     onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
  })
}



const restoredUser = (id: number) => {
  restoreUser(id,{
     onSuccess: async () => {
       refetchUsers();
        showToast('success', 'Utilisateur restoré avec success');
     },
     onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
  })
}


// 4. Actions
const openAddPage = () => {
  selectedUser.value = undefined;
  isEditing.value = true;
};

const openEditPage = (user: UserProfile) => {
  selectedUser.value = user;
  isEditing.value = true;
};

const closeForm = () => {
  isEditing.value = false;
  selectedUser.value = undefined;
  refetchUsers();
};


const columns = [
  { key: 'full_name', label: 'Nom'  },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', class: 'w-10' },
]


</script>

<template>

  <CompositionLoading v-if="isLoading || archibePending || restorePending" />
  <CompositionError v-else-if="isgetError || isArchiveError || isrestorError" :error="getError?.message || errorArchive?.message || errorRestor?.message" />


  <div v-else class="min-h-screen space-y-10 ">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex items-center gap-4">
            <Users class="h-6 w-6" />
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Gestion des utilisateurs</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez vos utilisateurs avec une précision chirurgicale.</p>
            </div>
          </div>

          <div class="flex items-center gap-4">

            <Button
              v-if="!isEditing"
              class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
              @click="openAddPage">
              <UserPlus class="w-6 h-6 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>
    <main>

      <section v-if="isEditing" class="animate-in fade-in slide-in-from-bottom-4 duration-300">

        <UserFormView
          :initial-data="selectedUser"
          :is-editing="!!selectedUser"
          @success="closeForm"
          @cancel="closeForm"

        />
      </section>

      <template v-else>

        <div class="card rounded-none overflow-hidden">
          <div class="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="font-bold text-text huge">Liste des utilisateurs</p>
            <div class="">
              <Select v-model="filterArchiv" @update:model-value="(val) => filterChange(val as string)">
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

          <div class="p-0">

             <CompositionListEmpty v-if="filteredUsers.length === 0" title="Aucun utilisateur" description="Aucune donnée trouvée dans la base de données." :icon="Users" />
               <div v-else class="p-6" >
                  <CompositionTable
                    :columns="columns"
                    :data="filteredUsers"
                    :total="totalItems"
                    v-model:current-page="currentPage"
                    v-model:limit="itemsPerPage"
                  >

                    <template #cell-role="{ row }">
                      <span>{{ row.role?.name }}</span>
                    </template>

                    <template #cell-status="{ row }">
                      <span v-if="row.archive">Archiver </span>
                      <span v-else>Active</span>
                    </template>

                    <template #cell-actions="{ row }">

                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="icon" @click.stop="console.log('Editer', row)">
                            <MoreHorizontal class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator/>
                          <CompositionVerifyButton :if="!row.archive">
                            <DropdownMenuLabel >
                            <button  @click="openEditPage(row)" class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                              <Pencil class="w-4 h-4" /> Modifier
                            </button>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>
                              <CompositionConfirmDialog @confirm="archivedUser(row.id)" header="Suppression de l'utilisateur" description="Êtes-vous sûr de vouloir Archiver ?" cancelText="Annuler" actionText="Archiver" >
                                <template #dialogButton>
                                  <button v-if="row.id !== storeUser.userInfo?.id" class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110">
                                    <Archive class="w-4 h-4"  /> Archiver
                                  </button>
                                </template>
                              </CompositionConfirmDialog>
                            </DropdownMenuLabel>
                          </CompositionVerifyButton>
                          <CompositionVerifyButton :if="row.archive">
                            <DropdownMenuLabel>
                              <CompositionConfirmDialog @confirm="restoredUser(row.id)" header="Restoration de l'utilisateur" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                                <template #dialogButton>
                                  <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110">
                                    <ArchiveRestore  class="w-4 h-4"  /> Restorer
                                  </button>
                                </template>
                              </CompositionConfirmDialog>
                            </DropdownMenuLabel>
                          </CompositionVerifyButton>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </template>

                  </CompositionTable>
                </div>

          </div>
        </div>
      </template>
    </main>
  </div>
</template>
