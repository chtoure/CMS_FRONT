
<script setup lang="ts">
import { Pencil, Plus, ShieldCheck, Check, X, Shield, MoreHorizontal,Trash2, ChevronsUpDown } from 'lucide-vue-next';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import { ref } from 'vue';
import Popover from '../../components/ui/popover/Popover.vue';
import PopoverTrigger from '../../components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '../../components/ui/popover/PopoverContent.vue';
import Command from '../../components/ui/command/Command.vue';
import CommandInput from '../../components/ui/command/CommandInput.vue';
import CommandEmpty from '../../components/ui/command/CommandEmpty.vue';
import CommandList from '../../components/ui/command/CommandList.vue';
import CommandGroup from '../../components/ui/command/CommandGroup.vue';
import CommandItem from '../../components/ui/command/CommandItem.vue';
import { useElementSize } from '@vueuse/core';


interface Role {
  id: number,
  name : string,
  description : string,
  Permissions: Permission[] | null
}

interface Permission {
  id: number,
  name : string,
  description : string,
  roles : Role [] | null
}


const roles = ref<Role[]>([
  {
    id:1,
    name:"Administrateur",
    description: "",
    Permissions:[
       {
        id:1,
        name: "create_user",
        description: "Creation des utilisateurs",
        roles:null
       },
       {
        id:2,
    name: "read_page_admin",
    description: "Lecture page admin",
        roles:null
       },
       {
       id:3,
        name: "ipadate_page_admin",
        description: "Modifier les données de la page admin",
        roles:null
       }
    ]

  },
   {
    id:2,
    name:"Manager",
    description: "Gestion des magasins",
    Permissions:[
       {
        id:1,
        name: "create_user",
        description: "Creation des utilisateurs",
        roles:null
       },
       {
        id:2,
    name: "read_page_admin",
    description: "Lecture page admin",
        roles:null
       }
    ]
  },
   {
    id:3,
    name:"User",
    description: "Lecture seule",
    Permissions:[
       {
        id:2,
    name: "read_page_admin",
    description: "Lecture page admin",
        roles:null
       }
    ]
  }
])

const  permissions = ref<Permission[]>([
  {
    id:1,
    name: "create_user",
    description: "Creation des utilisateurs",
    roles:[
      {
        id:1,
        name:"Administrateur",
        description: "Gestion illimité",
        Permissions:null
      }
    ]
  },
   {
    id:2,
    name: "read_page_admin",
    description: "Lecture page admin",
    roles:[
      {
        id:1,
        name:"Administrateur",
        description: "Gestion illimité",
         Permissions:null
      },
      {
        id:2,
        name:"Manager",
        description: "Gestion des magasins",
         Permissions:null
      },
      {
        id:3,
        name:"User",
        description: "Lecture seule",
         Permissions:null
      }
    ]
  },
  {
    id:3,
    name: "ipadate_page_admin",
    description: "Modifier les données de la page admin",
    roles:[
      {
        id:1,
        name:"Administrateur",
        description: "Gestion illimité",
         Permissions:null
      },
      {
        id:2,
        name:"Manager",
        description: "Gestion des magasins",
         Permissions:null
      }
    ]
  }
])


const editingId = ref<number | null>(null);
const editForm = ref({ name: '', description: ''});
const open = ref(false)
const triggerRef = ref(null)
const { width } = useElementSize(triggerRef)



// Activer le mode édition au double-clic
const startEdit = (role: Role) => {
  editingId.value = role.id;
  editForm.value = {
    name: role.name,
    description: role.description
  };
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = (id: number) => {
  console.log("Sauvegarde de la permission", id, editForm.value);
  // Ici tu appelles ton API Update
  editingId.value = null;
};


</script>


<template>

  <div class="min-h-screen space-y-10">

    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex items-center gap-4">
            <ShieldCheck class="h-6 w-6" />
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Gestion des utilisateurs</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez les roles et permissions de votre systeme.</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <Button class=" flex items-center rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
              <Plus class="w-6 h-6 mr-2" />
              Role
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <main>

      <Tabs default-value="role">

        <div class="flex border-b border-border mb-4 items-start">
            <TabsList class="flex space-x-4 py-4 px-2 font-medium text-sm rounded-none rounded-t-2xl border border-border">
              <TabsTrigger value="role" class="!shadow-none py-2 px-3 border border-border data-[state=active]:text-primary"> Roles </TabsTrigger>
              <TabsTrigger value="permission" class="!shadow-none py-2 px-3 border border-border data-[state=active]:text-primary"> Permissions </TabsTrigger>
            </TabsList>
        </div>

        <!-- Partie Role -->
        <TabsContent value="role">
          <p class="mt-1 mb-4 text-center text-text font-medium ">Double-cliquez sur une carte pour modifier</p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="role in roles"
              :key="role.id"
              class="group cursor-pointer"
              @dblclick="startEdit(role)"
            >
              <div class="card p-5 h-auto transition-all hover:-translate-y-1 flex flex-col">

                <div class="flex items-start justify-between gap-4">

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <input
                        v-if="editingId === role.id"
                        v-model="editForm.name"
                        v-focus
                        class="bg-background border border-border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 ring-primary"
                        @keydown.enter="saveEdit(role.id)"
                        @keydown.esc="cancelEdit"
                      />
                      <div v-else class="flex text-primary items-center gap-2">
                        <ShieldCheck :size="16" />
                        <h3 class="text-lg font-medium leading-none tracking-tight text-text ">
                          {{ role.name }}
                        </h3>
                      </div>
                    </div>

                    <div>
                      <textarea
                        v-if="editingId === role.id"
                        v-model="editForm.description"
                        rows="1"
                        class="bg-background border border-border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 ring-primary resize-none"
                      />
                      <p v-else class="text-sm leading-relaxed text-text opacity-80 ">
                        {{ role.description || 'Aucune description disponible.' }}
                      </p>
                    </div>
                    <b></b>
                    <div v-if="editingId === role.id">
                      <label class="flex items-center gap-2 text-sm font-medium text-text">
                        Permissions
                      </label>

                      <Popover v-model:open="open" class="w-full">
                        <PopoverTrigger as-child>
                          <Button
                          ref="triggerRef"
                            variant="outline"
                            role="combobox"
                            :aria-expanded="open"
                            class="input-custom justify-between w-full font-normal"
                          >
                            <!-- {{  role.Permissions
                                ? role.Permissions.find((r) => r.name === role)?.description
                                : "Sélectionner un rôle..."
                            }} -->
                            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent :style="{ width: `${width}px` }">
                          <Command>
                            <CommandInput placeholder="Rechercher un rôle..." />
                            <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>

                            <CommandList>
                              <CommandGroup>
                                <CommandItem
                                  v-for="r in role.Permissions"
                                  :key="r.id"
                                  :name="r.name"
                                  class="select-item-custom cursor-pointer"
                                  @select="() => {
                                    role = r.name
                                    open = false
                                  }"
                                >
                                  <Check
                                    :class="cn(
                                      'mr-2 h-4 w-4',
                                      role === r.name ? 'opacity-100' : 'opacity-0'
                                    )"
                                  />
                                  {{ r.description }}
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div v-if="editingId !== role.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click.stop="startEdit(role)" class="p-2 hover:bg-muted rounded-full text-text hover:text-primary transition-colors">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button class="p-2 hover:bg-muted rounded-full text-text hover:text-destructive transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div v-if="editingId === role.id" class="mt-4 pt-4 border-t border-border/10 flex justify-center gap-6">
                  <button
                    @click="saveEdit(role.id)"
                    class="flex items-center gap-1 px-4 py-1 text-success hover:bg-muted rounded-md transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    <Check :size="16" stroke-width="3" /> Valider
                  </button>
                  <button
                    @click="cancelEdit"
                    class="flex items-center gap-1 px-4 py-1 text-destructive hover:bg-muted rounded-md transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    <X :size="16" stroke-width="3" /> Annuler
                  </button>
                </div>

              </div>
            </div>
          </div>
        </TabsContent>


        <!-- Partie Permission -->
        <TabsContent value="permission" class="mt-4">
          <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div>
                <h3 class="font-medium text-text">Permissions</h3>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left font-medium">
                <thead class="bg-muted/30 border-b border-border">
                  <tr>
                    <th class="p-4 text-xs font-medium text-text uppercase">Nom technique</th>
                    <th class="p-4 text-xs font-medium text-text uppercase">Description</th>
                    <th class="p-4 text-xs font-medium text-text uppercase">Rôles</th>
                    <th class="p-4 text-xs font-medium text-text uppercase">Status</th>
                    <th class="p-4 text-xs font-medium text-text uppercase text-right w-20"></th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-border">
                  <tr
                    v-for="permission in permissions"
                    :key="permission.id"
                    class="group hover:bg-muted/40"
                  >
                    <td class="p-4">
                      <!-- <input
                        v-if="editingId === permission.id"
                        v-model="editForm.name"
                        v-focus
                        class="bg-background border border-border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 ring-primary"
                        @keydown.enter="saveEdit(permission.id)"
                        @keydown.esc="cancelEdit"
                      /> -->
                      <div  class="flex items-center gap-2">
                        <Shield :size="14" class="text-text" />
                        <span class="text-sm font-medium tracking-tight">{{ permission.name }}</span>
                      </div>
                    </td>

                    <td class="p-4">
                      <!-- <input
                        v-if="editingId === permission.id"
                        v-model="editForm.description"
                        class="bg-background border border-border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 ring-primary"
                        @keydown.enter="saveEdit(permission.id)"
                        @keydown.esc="cancelEdit"
                      /> -->
                      <span  class="text-xs text-text line-clamp-1">
                        {{ permission.description }}
                      </span>
                    </td>

                    <td class="p-4">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="role in permission.roles"
                          :key="role.id"
                          class="text-[9px] px-2 py-0.5 rounded-full border border-border bg-muted font-bold"
                        >
                          {{ role.name }}
                        </span>
                      </div>
                    </td>

                    <td class="p-4">
                      <span class="text-[9px] px-2 py-0.5 rounded-full border border-border bg-muted font-bold"> Active </span>
                    </td>

                    <td class="p-4 text-right">
                      <!-- <div v-if="editingId === permission.id" class="flex justify-end gap-2">
                        <button @click="saveEdit(permission.id)" class="p-1 text-success hover:bg-muted rounded">
                          <Check :size="16" />
                        </button>
                        <button @click="cancelEdit" class="p-1 text-destructive hover:bg-muted rounded">
                          <X :size="16" />
                        </button>
                      </div> -->
                      <div class="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-1 hover:bg-muted rounded text-text hover:text-primary">
                            <MoreHorizontal :size="16" />
                        </button>
                        <b></b>
                         <button class="p-2 hover:bg-muted rounded text-text hover:text-destructive">
                            <Trash2 :size="16"/>
                          </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>



       </Tabs>

    </main>

  </div>


</template>
