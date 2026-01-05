

<script setup lang="ts">
import type { UserProfile } from '../../type/user';
import { Users } from 'lucide-vue-next';
import UserCardView from './UserCardView.vue';
import CompositionListEmpty from '../../components/composition/CompositionListEmpty.vue';

interface UserListProps {
  users: UserProfile[]; // Utilisation du nouveau type
}



defineProps<UserListProps>();

const emit = defineEmits<{
  edit: [user: UserProfile],
  delete: [id: number] // L'ID est maintenant un number selon ton type
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
</template>
