
<script setup lang="ts">
import { computed } from 'vue';
import type { UserProfile } from '../../type/user';
import { Pencil, Trash2, Mail } from 'lucide-vue-next';

const props = defineProps<{
  user: UserProfile;
  index: number;
}>();


const emit = defineEmits<{
  edit: [user: UserProfile],
  delete: [id: number]
}>();

// Calcul des initiales sur 'full_name'
const initials = computed(() => {
  return props.user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
});


</script>

<template>
  <div
    class="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white  border border-border shadow-sm hover:shadow-md transition-all duration-300"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <div class="h-12 w-12 rounded-full ring-2 ring-gray-100 bg-indigo-50 text-indigo-600  flex items-center justify-center">
        {{ initials }}
      </div>

      <div class="min-w-0 flex-1">
        <h3 class=" text-gray-900 truncate">{{ user.full_name }}</h3>
        <div class="flex items-center gap-2 text-gray-500 text-sm">
          <Mail class="h-3.5 w-3.5 flex-shrink-0" />
          <span class="truncate">{{ user.email }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-3">
      <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        {{ user.role ? user.role.name : 'Aucun rôle' }}
      </span>

       <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        Active
      </span>

      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="emit('edit', user)" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-indigo-600">
          <Pencil class="h-4 w-4" />
        </button>
        <button @click="emit('delete', user.id)" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-600">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
