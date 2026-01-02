

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGetUsers } from '../../hook/user';
import type { UserProfile } from '../../type/user';
import { Users, UserPlus } from 'lucide-vue-next';


// Composants convertis
import UserListView from './UserListView.vue';
import UserFormView from './UserFormView.vue';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import Button from '@/components/ui/button/Button.vue';



// 1. Données & États
const {
  data: users,
  isLoading,
  isError: isgetError,
  error: getError,
  refetch: refetchUsers
} = useGetUsers();


const search = ref('');
const isEditing = ref(false);
const selectedUser = ref<UserProfile | undefined>(undefined);

// 2. Recherche filtrée (équivalent de useMemo)
const filteredUsers = computed(() => {
  if (!users.value) return [];
  if (!search.value.trim()) return users.value;
  const query = search.value.toLowerCase();
  return users.value.filter(u =>
    u.full_name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );
});


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
</script>

<template>

  <CompositionLoading v-if="isLoading" />
  <CompositionError v-else-if="isgetError" :error="getError?.message" />


  <div class="min-h-screen pb-12">
    <header class="border-b bg-white sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary text-white">
            <Users class="h-6 w-6" />
          </div>
          <h1 class="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        </div>
        <Button
          v-if="!isEditing"
          @click="openAddPage"
          class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium"
        >
          <UserPlus class="size-4" /> Ajouter
        </Button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <section v-if="isEditing" class="animate-in fade-in slide-in-from-bottom-4 duration-300">

        <UserFormView
          :initial-data="selectedUser"
          :is-editing="!!selectedUser"
          @success="closeForm"
          @cancel="closeForm"

        />
      </section>

      <template v-else>

        <div class="bg-white border border-gray-200  shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 class="font-bold text-gray-900">Liste des utilisateurs</h3>
            <div class="w-full sm:w-72">
               <!-- <SearchBar v-model="search" placeholder="Rechercher..." /> -->
            </div>
          </div>

          <div class="p-0">
             <UserListView
               :users="filteredUsers"
               @edit="openEditPage"
             />
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
