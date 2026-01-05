
<script setup lang="ts">
import { Plus, ShieldCheck,  } from 'lucide-vue-next';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import Tabs from '../../components/ui/tabs/Tabs.vue';
import TabsList from '../../components/ui/tabs/TabsList.vue';
import TabsTrigger from '../../components/ui/tabs/TabsTrigger.vue';
import TabsContent from '../../components/ui/tabs/TabsContent.vue';
import { ref } from 'vue';


interface Role {
  id: number,
  name : string,
  description : string
}


const roles = ref<Role[]>([
  {
    id:1,
    name:"Administrateur",
    description: "Gestion illimité"
  },
   {
    id:2,
    name:"Manager",
    description: "Gestion des magasins"
  },
   {
    id:3,
    name:"User",
    description: "Lecture seule"
  }
])

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

        <div class="flex border-b border-border mb-8 items-start">
            <TabsList class="flex space-x-4 py-4 px-2 font-medium text-sm rounded-none rounded-t-2xl border border-border">
              <TabsTrigger value="role" class="!shadow-none py-2 px-3 border border-border"> Roles </TabsTrigger>
              <TabsTrigger value="permission" class="!shadow-none py-2 px-3 border border-border"> Permissions </TabsTrigger>
            </TabsList>
        </div>


       <!-- Partie Role -->
      <TabsContent value="role" class="">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        </div>
      </TabsContent>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="role in roles"
            :key="role.id"
            class="group relative"
          >
            <div class="card p-5 flex items-start justify-between gap-4 h-full hover:-translate-y-1 transition-all duration-300">

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <h3 class="text-lg font-bold leading-none tracking-tight">
                    {{ role.name }}
                  </h3>
                </div>

                <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {{ role.description || 'Aucune description disponible pour ce rôle.' }}
                </p>
              </div>

              <button

                class="shrink-0 p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Supprimer le rôle"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

       </Tabs>

    </main>

  </div>


</template>
