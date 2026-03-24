

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useArchiveUser, useGetUsers, useResendConfirmEmail } from '../../hook/user';
import type { User } from '../../type/user';
import { Users, UserPlus, Pencil, MoreHorizontal, Archive, ArchiveRestore, Send, Trash2 } from 'lucide-vue-next';

import CompositionError from '../../components/composition/CompositionError.vue';
import Button from '@/components/ui/button/Button.vue';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import CompositionTable from '../../components/composition/CompositionTable.vue';
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue';
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue';
import { useDeleteUser, useRestoreUser } from '../../hook/user';
import { showToast } from '../../lib/toast';
import { userStore } from '../../stores/user';
import CompositionVerifyButton from '../../components/composition/CompositionVerifyButton.vue';
import { cn } from '../../lib/utils';
import Badge from '../../components/ui/badge/Badge.vue';
import { handleError } from '../../lib/error';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';




const currentPage = ref(1);
const itemsPerPage = ref(10);
const filterArchiv = ref("all");
const storeUser = userStore();
const search = ref('')



const filterOptions = [
  { label: 'Actifs', value: 'false' },
  { label: 'Archivés', value: 'true' }
]

const filterParams = computed(() => ({
    archive: filterArchiv.value,
    page: currentPage.value,
    limit: itemsPerPage.value,
    search: search.value
}));


  // 1. Données & États
const {
  data: users,
  isLoading,
  isError: isgetError,
  error: getError,
  refetch: refetchUsers
} = useGetUsers(filterParams);



  // watch([currentPage, itemsPerPage, filterArchiv], () => {
  //   refetchUsers();
  // });


const {
  mutate : archiveUser,
  isPending: archibePending,
} = useArchiveUser()


const {
  mutate : deleteUser,
  isPending: deletePending,
} = useDeleteUser()


const {
  mutate : restoreUser,
  isPending: restorePending,
} = useRestoreUser()


const {
  mutate : resendConfirmEmail,
  isPending: resendConfirmEmailPending,
} = useResendConfirmEmail()


const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-success/20 text-success border-success/30'
    case 'EN_ATTENTE': return 'bg-warning/20 text-warning border-warning/30'
    case 'INACTIVE': return 'bg-muted text-muted-foreground border-border'
  }
}

const getStatusLabel = (row: User) => {
  if(row.status === 'ACTIVE' && row.archive === false) return 'Actif'
  if(row.status === 'EN_ATTENTE' && row.archive === false) return 'En attente'
  if(row.archive === true) return 'Archivé'

}


const getDateLabel =(row: User) => {
  if(row.status === 'ACTIVE' && row.archive === false) return row.isActiveAt
  if(row.status === 'EN_ATTENTE' && row.archive === false) return row.isPendingAt
  if(row.archive === true) return row.archivedAt
}



const archivedUser = (id: number) => {
  archiveUser(id,{
     onSuccess: async () => {
       refetchUsers();
        showToast('success', 'Utilisateur archivé avec success');
     },
     onError: (error: Error) => {
      handleError(error)
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
      handleError(error)
      }
  })
}


const deletedUser = (id: number) => {
  deleteUser(id,{
     onSuccess: async () => {
       refetchUsers();
        showToast('success', 'Utilisateur supprimé avec success');
     },
     onError: (error: Error) => {
      handleError(error)
      }
  })
}


const resendConfirmEmailUser = (id: number) => {
  resendConfirmEmail(id,{
     onSuccess: async () => {
       refetchUsers();
        showToast('success', 'Email de confirmation re-envoyé avec success');
     },
     onError: (error: Error) => {
      handleError(error)
      }
  })
}



const columns = [
  { key: 'full_name', label: 'Nom'  },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Durée' },
  { key: 'actions', label: 'Actions', class: 'w-10' },
]


const convertDateInTemps = (dateInput: Date | string | null | undefined) => {
  if (!dateInput) return '-';

  // Conversion forcée en objet Date (si c'est une string, ça crée une Date, si c'est déjà une Date, ça la clone)
  const date = new Date(dateInput);

  // Vérification si la date est valide (pour éviter NaN)
  if (isNaN(date.getTime())) return '-';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} h`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)} j`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 604800)} sem`;
  } else if (diffInSeconds < 31536000) {
    return `${Math.floor(diffInSeconds / 2592000)} mois`;
  } else {
    return `${Math.floor(diffInSeconds / 31536000)} ans`;
  }
}

</script>

<template>

  <CompositionError v-if="isgetError" :error="getError?.message" />
  <CompositionLoading v-else-if="isLoading || archibePending || restorePending || resendConfirmEmailPending || deletePending" />

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
              class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
              @click="$router.push({ name: 'admin.users.create' })">
              <UserPlus class="w-6 h-6 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>
    <main>

        <div class="card rounded-none overflow-hidden">
          <div class="p-0">
               <div class="p-6" >
                  <CompositionTable
                    :columns="columns"
                    :data="users?.results || []"
                    :total="users?.count || 0"
                    v-model:limit="itemsPerPage"
                    v-model:currentPage="currentPage"

                    searchable
                    v-model:search="search"
                    searchPlaceholder="Rechercher par nom ou email..."

                    filterable
                    v-model:filterValue="filterArchiv"
                    :filterOptions="filterOptions"
                    filterPlaceholder="Statut"

                    :isLoading="isLoading || archibePending || restorePending"
                  >

                    <template #cell-role="{ row }">
                      <span>{{ row.role?.name }}</span>
                    </template>

                   <template #cell-status="{ row }">
                    <Badge
                      variant="outline"
                      :class="cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', getStatusColor(row.status))"
                    >
                      {{ getStatusLabel(row) }}
                    </Badge>
                  </template>

                  <template #cell-date="{ row }">
                    {{ convertDateInTemps(getDateLabel(row)) }}
                  </template>

                    <template #cell-actions="{ row }">

                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator/>
                          <CompositionVerifyButton :if="!row.archive">
                            <DropdownMenuLabel >
                            <button  @click="()=>$router.push({ name: 'admin.users.edit', params: { id: row.id } })" class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-primary">
                              <Pencil class="w-4 h-4" /> Modifier
                            </button>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>
                              <CompositionConfirmDialog @confirm="archivedUser(row.id)" header="Suppression de l'utilisateur" description="Êtes-vous sûr de vouloir Archiver ?" cancelText="Annuler" actionText="Archiver" >
                                <template #dialogButton>
                                  <button v-if="row.id !== storeUser.userInfo?.id" class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-primary">
                                    <Archive class="w-4 h-4"  /> Archiver
                                  </button>
                                </template>
                              </CompositionConfirmDialog>
                            </DropdownMenuLabel>
                          </CompositionVerifyButton>
                          <CompositionVerifyButton :if="row.archive || row.status === 'EN_ATTENTE'">
                            <DropdownMenuLabel>
                              <CompositionConfirmDialog v-if="row.archive" @confirm="restoredUser(row.id)" header="Restoration de l'utilisateur" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                                <template #dialogButton>
                                  <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-primary">
                                    <ArchiveRestore  class="w-4 h-4"  /> Restorer
                                  </button>
                                </template>
                              </CompositionConfirmDialog>
                              <button v-if="row.status==='EN_ATTENTE'"  @click="resendConfirmEmailUser(row.id)" class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-primary">
                                <Send class="w-4 h-4"  /> Renvoyer la confirmation
                              </button>
                              <CompositionConfirmDialog @confirm="deletedUser(row.id)" header="Suppression de l'utilisateur" description="Êtes-vous sûr de vouloir supprimer ?" cancelText="Annuler" actionText="Supprimer" >
                                <template #dialogButton>
                                  <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-destructive">
                                    <Trash2  class="w-4 h-4"  /> Supprimer
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
    </main>
  </div>
</template>
