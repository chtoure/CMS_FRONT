
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Role {
  id: string
  name: string
  description: string
  created_at: string
}

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  created_at: string
}

interface RolePermission {
  role_id: string
  permission_id: string
}

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const rolePermissions = ref<RolePermission[]>([])
const loading = ref(true)
const activeTab = ref<'roles' | 'permissions'>('roles')

const newRole = ref({ name: '', description: '' })
const newPermission = ref({ name: '', description: '', resource: '', action: '' })
const showRoleModal = ref(false)
const showPermissionModal = ref(false)
const showAssignModal = ref(false)
const selectedRole = ref<Role | null>(null)

// const fetchData = async () => {
//   loading.value = true
//   try {
//     const [rolesRes, permsRes, rolePermsRes] = await Promise.all([
//       supabase.from('roles').select('*').order('created_at', { ascending: false }),
//       supabase.from('permissions').select('*').order('created_at', { ascending: false }),
//       supabase.from('role_permissions').select('*')
//     ])

//     if (rolesRes.data) roles.value = rolesRes.data
//     if (permsRes.data) permissions.value = permsRes.data
//     if (rolePermsRes.data) rolePermissions.value = rolePermsRes.data
//   } catch (error) {
//     console.error('Error fetching data:', error)
//   } finally {
//     loading.value = false
//   }
// }

// const createRole = async () => {
//   if (!newRole.value.name) return

//   const { error } = await supabase
//     .from('roles')
//     .insert([{ name: newRole.value.name, description: newRole.value.description }])

//   if (!error) {
//     showRoleModal.value = false
//     newRole.value = { name: '', description: '' }
//     fetchData()
//   }
// }

// const createPermission = async () => {
//   if (!newPermission.value.name || !newPermission.value.resource || !newPermission.value.action) return

//   const { error } = await supabase
//     .from('permissions')
//     .insert([{
//       name: newPermission.value.name,
//       description: newPermission.value.description,
//       resource: newPermission.value.resource,
//       action: newPermission.value.action
//     }])

//   if (!error) {
//     showPermissionModal.value = false
//     newPermission.value = { name: '', description: '', resource: '', action: '' }
//     fetchData()
//   }
// }

// const deleteRole = async (id: string) => {
//   if (!confirm('Are you sure you want to delete this role?')) return

//   const { error } = await supabase
//     .from('roles')
//     .delete()
//     .eq('id', id)

//   if (!error) fetchData()
// }

// const deletePermission = async (id: string) => {
//   if (!confirm('Are you sure you want to delete this permission?')) return

//   const { error } = await supabase
//     .from('permissions')
//     .delete()
//     .eq('id', id)

//   if (!error) fetchData()
// }

const openAssignModal = (role: Role) => {
  selectedRole.value = role
  showAssignModal.value = true
}

const getRolePermissions = (roleId: string) => {
  const permIds = rolePermissions.value
    .filter(rp => rp.role_id === roleId)
    .map(rp => rp.permission_id)
  return permissions.value.filter(p => permIds.includes(p.id))
}

const isPermissionAssigned = (roleId: string, permId: string) => {
  return rolePermissions.value.some(rp => rp.role_id === roleId && rp.permission_id === permId)
}

// const togglePermission = async (roleId: string, permId: string) => {
//   const isAssigned = isPermissionAssigned(roleId, permId)

//   if (isAssigned) {
//     const { error } = await supabase
//       .from('role_permissions')
//       .delete()
//       .eq('role_id', roleId)
//       .eq('permission_id', permId)

//     if (!error) fetchData()
//   } else {
//     const { error } = await supabase
//       .from('role_permissions')
//       .insert([{ role_id: roleId, permission_id: permId }])

//     if (!error) fetchData()
//   }
// }

// onMounted(() => {
//   fetchData()
// })
</script>

<template>
  <div class="p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Roles & Permissions</h1>
        <p class="text-gray-400">Manage system roles and their associated permissions</p>
      </div>

      <div class="border-b border-gray-700 mb-8">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'roles'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            ]"
          >
            Roles
          </button>
          <button
            @click="activeTab = 'permissions'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            ]"
          >
            Permissions
          </button>
        </nav>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="text-gray-400 mt-4">Loading...</p>
      </div>

      <div v-else-if="activeTab === 'roles'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white">Roles ({{ roles.length }})</h2>
          <button
            @click="showRoleModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
          >
            Add Role
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="role in roles"
            :key="role.id"
            class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-white mb-1">{{ role.name }}</h3>
                <p class="text-sm text-gray-400">{{ role.description || 'No description' }}</p>
              </div>
              <button
                @click="deleteRole(role.id)"
                class="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="mb-4">
              <p class="text-xs text-gray-500 mb-2">Permissions:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="perm in getRolePermissions(role.id)"
                  :key="perm.id"
                  class="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs"
                >
                  {{ perm.name }}
                </span>
                <span v-if="getRolePermissions(role.id).length === 0" class="text-xs text-gray-500">
                  No permissions assigned
                </span>
              </div>
            </div>

            <button
              @click="openAssignModal(role)"
              class="w-full mt-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
            >
              Manage Permissions
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'permissions'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white">Permissions ({{ permissions.length }})</h2>
          <button
            @click="showPermissionModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
          >
            Add Permission
          </button>
        </div>

        <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-750">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Resource
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="perm in permissions" :key="perm.id" class="hover:bg-gray-750 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {{ perm.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span class="px-2 py-1 bg-gray-700 rounded text-xs">{{ perm.resource }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span class="px-2 py-1 bg-gray-700 rounded text-xs">{{ perm.action }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-400">
                  {{ perm.description || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    @click="deletePermission(perm.id)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="showRoleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showRoleModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <h3 class="text-xl font-semibold text-white mb-4">Create New Role</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              v-model="newRole.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Manager"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              v-model="newRole.description"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Describe this role..."
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showRoleModal = false"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="createRole"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showPermissionModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showPermissionModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <h3 class="text-xl font-semibold text-white mb-4">Create New Permission</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              v-model="newPermission.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., content:write"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Resource</label>
            <input
              v-model="newPermission.resource"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., content"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Action</label>
            <input
              v-model="newPermission.action"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., write"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              v-model="newPermission.description"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Describe this permission..."
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showPermissionModal = false"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="createPermission"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showAssignModal && selectedRole"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showAssignModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700">
        <h3 class="text-xl font-semibold text-white mb-2">Manage Permissions for {{ selectedRole.name }}</h3>
        <p class="text-sm text-gray-400 mb-6">Toggle permissions on or off for this role</p>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="perm in permissions"
            :key="perm.id"
            class="flex items-center justify-between p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div class="flex-1">
              <p class="text-white font-medium">{{ perm.name }}</p>
              <p class="text-sm text-gray-400">{{ perm.description }}</p>
              <div class="flex gap-2 mt-1">
                <span class="px-2 py-0.5 bg-gray-600 rounded text-xs text-gray-300">{{ perm.resource }}</span>
                <span class="px-2 py-0.5 bg-gray-600 rounded text-xs text-gray-300">{{ perm.action }}</span>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                :checked="isPermissionAssigned(selectedRole.id, perm.id)"
                @change="togglePermission(selectedRole.id, perm.id)"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="showAssignModal = false"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
