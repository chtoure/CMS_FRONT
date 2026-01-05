

<script setup lang="ts">
import type { UserProfile } from '../../type/user';
import { Users } from 'lucide-vue-next';
import UserCardView from './UserCardView.vue';

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
  <div v-if="users.length === 0" class="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <Users class="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-semibold text-foreground mb-1">Aucun utilisateur</h3>
    <p class="text-muted-foreground text-sm max-w-sm">
      Aucune donnée trouvée dans la base de données.
    </p>
  </div>

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
