<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGetContentEntry, useSwitchStatus } from '../../hook/content-entry'
import { Archive, ArrowLeft, Calendar, Edit2, Lock, User } from 'lucide-vue-next'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import ContentEntryPreview from './ContentEntryPreview.vue'
import CompositionError from '../../components/composition/CompositionError.vue'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'
import { getErrorMessage } from '../../lib/errorMessage'
import Card from '../../components/ui/card/Card.vue'
import CardHeader from '../../components/ui/card/CardHeader.vue'
import CardTitle from '../../components/ui/card/CardTitle.vue'
import CardContent from '../../components/ui/card/CardContent.vue'
import Button from '../../components/ui/button/Button.vue'
import { EntryStatus } from '../../type/content-entry'
import { showToast } from '../../lib/toast'

const router = useRouter()
const entryId = computed(() => Number(router.currentRoute.value.params.id))

const { data: contentEntry, isLoading, error, refetch: refetchContentEntry } = useGetContentEntry(entryId.value)
const { mutate: switchStatusMutation, isPending: isSwitchStatusPending } = useSwitchStatus();

const handleSwitchStatus = () => {
  const currentStatus = contentEntry.value?.status;
  if (!currentStatus) return;

  const nextStatus = currentStatus === EntryStatus.DRAFT
    ? EntryStatus.PUBLISHED
    : EntryStatus.DRAFT;

  switchStatusMutation({
    id: entryId.value,
    status: { status: nextStatus }
  }, {
    onSuccess: async () => {
      showToast('success', 'Statut modifié');
      await refetchContentEntry();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}



const handleArchiveContentEntry = (id: number) => {
  switchStatusMutation({
    id,
    status: { status: EntryStatus.ARCHIVED }
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu archivé');
      refetchContentEntry();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}

const handleRestoreContentEntry = (id: number) => {
  switchStatusMutation({
    id,
    status: { status: EntryStatus.DRAFT }
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu restauré');
      refetchContentEntry();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-8">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex gap-4 items-center">
            <div
              class="hover:cursor-pointer hover:text-primary transition-colors p-2 bg-background/10 rounded-full"
              @click="$router.back()"
            >
              <ArrowLeft />
            </div>
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none">
                <span class="text-primary italic">Aperçu du contenu</span>
              </h1>
              <p class="text-background opacity-80 text-lg font-medium">Visualisation détaillée de l'entrée de contenu.</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Button
              :disabled="isSwitchStatusPending" @click="router.push({ name: 'admin.content-entry.update', params: { id: entryId } })"
              class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              <Edit2 class="w-5 h-5 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div v-if="isLoading" class="flex items-center justify-center p-20">
      <CompositionLoading />
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto">
      <CompositionError :error="getErrorMessage(error)" />
    </div>

    <div v-else-if="contentEntry" class="grid grid-cols-1 lg:grid-cols-6 gap-2">
      <div class="lg:col-span-4 space-y-6">
        <div class="card rounded-none p-6">
          <ContentEntryPreview :entry="contentEntry" />
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <!-- Carte Publier -->
        <Card class="rounded-none shadow-sm border-border">
            <CardHeader class="p-4 border-b border-border bg-muted/20">
                <CardTitle class="text-sm font-bold">Informations</CardTitle>
            </CardHeader>
            <CardContent class="p-4 space-y-4">

                <div class="space-y-3 py-4 text-sm text-muted-foreground">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Lock class="w-4 h-4" /> État :
                        </div>
                        <span class="font-medium text-primary">{{ contentEntry.status }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <User class="w-4 h-4" /> Créé par :
                        </div>
                        <span class="font-medium text-primary">{{ contentEntry.user?.full_name || 'Inconnu' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Calendar class="w-4 h-4" /> Créé le :
                        </div>
                        <span class="font-medium text-primary">{{ formatDate(contentEntry.createdAt) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Calendar class="w-4 h-4" /> Modifié le :
                        </div>
                        <span class="font-medium text-primary">{{ formatDate(contentEntry.updatedAt) }}</span>
                    </div>
                </div>
            </CardContent>
            <div class="p-4 border-t border-border flex justify-end gap-2">
                <Button class="text-white" :disabled="isSwitchStatusPending" @click="handleSwitchStatus()">
                      <Lock  class="w-3 h-3 mr-2" />
                      {{ contentEntry.status === EntryStatus.DRAFT ? 'Publier' : 'Brouillon' }}
                </Button>
                <Button v-if="contentEntry.status !== EntryStatus.ARCHIVED" class="text-white" :disabled="isSwitchStatusPending" @click="handleArchiveContentEntry(entryId)">
                      <Archive  class="w-3 h-3 mr-2" />
                      {{ isSwitchStatusPending ? 'Archiver' : 'Archiver' }}
                </Button>
                <Button v-else class="text-white" :disabled="isSwitchStatusPending" @click="handleRestoreContentEntry(entryId)">
                      <Archive  class="w-3 h-3 mr-2" />
                      {{ isSwitchStatusPending ? 'Restaurer' : 'Restaurer' }}
                </Button>

            </div>
        </Card>
      </div>

    </div>
  </div>
</template>
