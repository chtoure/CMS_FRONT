<script setup lang="ts">
import { useGetContentEntry } from '../../hook/content-entry';
import { AlertCircle, Calendar, User } from 'lucide-vue-next';
import { Badge } from '../../components/ui/badge';

const props = defineProps<{
  entryId: number;
}>()

const { data: entry, isLoading: isPending, error: isError } = useGetContentEntry(props.entryId)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

</script>

<template>
  <div class="card rounded-none">

    <div v-if="isPending" class="p-6 space-y-4 animate-pulse">
      <div class="h-4 w-1/4 bg-muted rounded"></div>
      <div class="h-8 w-3/4 bg-muted rounded"></div>
      <div class="space-y-2 pt-2">
        <div class="h-4 w-full bg-muted rounded"></div>
        <div class="h-4 w-2/3 bg-muted rounded"></div>
      </div>
    </div>

    <div v-else-if="isError" class="p-8 flex flex-col items-center justify-center text-center space-y-3">
      <div class="p-3 rounded-full bg-destructive/10">
        <AlertCircle class="w-6 h-6 text-destructive" />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-foreground">Erreur de chargement</p>
        <p class="text-xs text-muted-foreground">Impossible de récupérer l'entrée #{{ props.entryId }}</p>
      </div>
      <button @click.prevent="() => {}" class="text-xs underline text-primary hover:text-primary/80">Réessayer</button>
    </div>

    <div v-else-if="entry" class="group">
      <div class="">
        <div class="flex items-center gap-2 mb-3">
          <Badge variant="outline" class="text-[10px] uppercase tracking-wider font-bold">
            {{ entry.contentType?.name || 'Contenu' }}
          </Badge>
          <span class="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar class="w-3 h-3" /> {{ formatDate(entry.createdAt) }}
          </span>
        </div>

        <h3 class="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {{ entry.data_json.title || 'Sans titre' }}
        </h3>

        <p v-if="entry.data_json.description" class="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {{ entry.data_json.description }}
        </p>

        <div class="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User class="w-3 h-3 text-primary" />
            </div>
            <span class="text-xs font-medium text-foreground/80">{{ entry.user?.full_name || 'Auteur inconnu' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
