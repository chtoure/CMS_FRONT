<!--

<script setup lang="ts">
import type { UserProfile } from '../../type/user';
import CompositionListEmpty from '../../components/composition/CompositionListEmpty.vue';
import { Users } from 'lucide-vue-next';


interface UserListProps {
  users: UserProfile[];
  items: number
}



defineProps<UserListProps>();

const emit = defineEmits<{
  edit: [user: UserProfile],
  delete: [id: number]
}>();




</script>

<template>
  <CompositionListEmpty v-if="users.length === 0" title="Aucun utilisateur" description="Aucune donnée trouvée dans la base de données." :icon="Users" />

  <div v-else class="space-y-3">
    <UserCardView
      v-for="(user, index) in users"
      :key="user.id"
      :user="user"
      :index="index"
      @edit="emit('edit', user)"
      @delete="emit('delete', user.id)"
    />
  </div>

</template> -->
