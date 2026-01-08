

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
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';



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
  return users.value.filter((u:UserProfile) =>
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

        <div class="bg-background border border-border  shadow-sm overflow-hidden">
          <div class="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 class="font-bold text-text">Liste des utilisateurs</h3>
            <div class="">
              <Select>
                <SelectTrigger class="input-custom">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" class="select-item-custom">Tous</SelectItem>
                  <SelectItem value="active" class="select-item-custom">Active</SelectItem>
                  <SelectItem value="archive" class="select-item-custom">Achivés</SelectItem>
                </SelectContent>
              </Select>
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
