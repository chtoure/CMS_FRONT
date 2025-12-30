
<script setup lang="ts">
  import { Trash2 } from 'lucide-vue-next';
  import { Pencil } from 'lucide-vue-next';
  import CompositionLoading from '@/components/composition/CompositionLoading.vue';
  import CompositionError from '@/components/composition/CompositionError.vue';
  import CompositionModal from '@/components/composition/CompositionModal.vue';
  import Button from '@/components/ui/button/Button.vue';
  import { useGetUsers } from '../../hook/user';




  const {
    data: usersData,
    isPending: isLoadingListUsers,
    isError: isErroUsers,
    error: fetchError,
    refetch: refetchUsers
  } = useGetUsers();


</script>

<template>

  <CompositionLoading v-if="isLoadingListUsers" />

  <CompositionError v-else-if="isErroUsers" :error="fetchError?.message"/>

  <div class="p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="sm:flex sm:items-center mb-8">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Users</h1>
          <p class="mt-2 text-sm text-gray-600">
            A list of all the users in your account including their name, title, email and role.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <CompositionModal title="Ajouter un utilisateur">
            <template #trigger>
              <Button>Ajouter</Button>
            </template>
            <template #content>
              <div class="p-4">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Ajouter un utilisateur</h2>
                <!-- Formulaire d'ajout d'utilisateur -->
                <form class="space-y-4">
                  <div>
                    <label for="full_name" class="block text-sm font-medium text-gray-700">Nom complet</label>
                    <input type="text" name="full_name" id="    full_name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                  <div>
                    <label for="role" class="block text-sm font-medium text-gray-700">Rôle</label>
                    <select id="role" name="role" class="mt-1 block                                     w-full border border-gray-300 rounded-md shadow-sm p-2">
                      <option>Administrateur</option>
                      <option>Éditeur</option>
                      <option>Utilisateur</option>
                    </select>
                  </div>
                  <div class="flex justify-end">
                    <Button type="submit" class="bg-indigo-600 text-white hover:bg-indigo-  700">Ajouter</Button>
                  </div>
                </form>
              </div>
            </template>
          </CompositionModal>
        </div>
      </div>

      <div class="flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300 ">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span class="sr-only">Edit</span>
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span class="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in usersData" :key="user.id" class="hover:bg-gray-50 transition-colors">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    {{ user.full_name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                   <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      Active
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <a href="#">
                      <Pencil class="w-5 h-5 text-indigo-600 hover:text-indigo-900"/>
                    </a>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <a href="#" >
                      <Trash2 class="w-5 h-5 text-red-600 hover:text-red-900"/>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
