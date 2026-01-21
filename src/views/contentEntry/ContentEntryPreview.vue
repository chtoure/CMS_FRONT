<script setup lang="ts">
import { computed } from 'vue'
import type { IContentEntry } from '../../type/content-entry'
import { FieldType } from '../../type/field'
import { Badge } from '../../components/ui/badge'
import {Tag, CheckCircle2, XCircle } from 'lucide-vue-next'
import MediaPreview from '../../components/composition/MediaPreview.vue'
import ContentEntryCard from './ContentEntryCard.vue'

const props = defineProps<{
  entry: IContentEntry
}>()


const fields = computed(() => props.entry.contentType?.fields_schema || [])

const getFieldValue = (fieldName: string) => {
  return props.entry.data_json[fieldName]
}

const getFieldValueAsArray = (fieldName: string) => {
  const value = props.entry.data_json[fieldName]
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
      <div class="space-y-2">

        <h2 class="text-2xl font-black tracking-tight capitalize">
          {{ props.entry.data_json.title || 'Sans titre' }}
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <div v-for="field in fields" :key="field.name" class="flex flex-col space-y-3 group">
        <div class="flex items-center gap-2">
            <label class="text-[10px] uppercase font-black">
                {{ field.label=='' ? 'Titre' : field.label }} :
            </label>
        </div>

        <div class="">
            <!-- Text & Number -->
            <div v-if="field.type === FieldType.TEXT || field.type === FieldType.NUMBER" class="text-foreground leading-relaxed whitespace-pre-wrap">
                {{ getFieldValue(field.name) || '—' }}
            </div>

            <!-- Rich Text -->
            <div v-else-if="field.type === FieldType.RICH_TEXT"
                 class="prose prose-sm prose-invert max-w-none text-foreground leading-relaxed"
                 v-html="getFieldValue(field.name) || '<i>Aucun contenu</i>'">
            </div>

            <!-- Media -->
            <div v-else-if="field.type === FieldType.MEDIA" class="flex flex-wrap gap-3">
                <template v-if="getFieldValue(field.name)">
                    <MediaPreview v-for="(id, idx) in getFieldValueAsArray(field.name)"
                                  :key="String(id) + idx"
                                  :mediaId="Number(id)" />
                </template>
                <span v-else class="text-xs italic text-muted-foreground">Aucun média</span>
            </div>

            <!-- Taxonomy -->
            <div v-else-if="field.type === FieldType.TAXONOMY" class="flex flex-wrap gap-2">
                <template v-if="getFieldValue(field.name)">
                    <Badge v-for="(tag, idx) in getFieldValueAsArray(field.name)"
                           :key="String(tag) + idx"
                           variant="outline"
                           class="flex items-center gap-1.5 py-1 px-2.5 bg-muted/50 border-border/50 text-foreground/80 hover:bg-muted transition-colors">
                        <Tag class="w-3 h-3" />
                        {{ tag }}
                    </Badge>
                </template>
                <span v-else class="text-xs italic text-muted-foreground">Aucune taxonomie</span>
            </div>

            <!-- Boolean -->
            <div v-else-if="field.type === FieldType.BOOLEAN" class="flex items-center gap-2">
                <template v-if="getFieldValue(field.name) !== undefined">
                    <CheckCircle2 v-if="getFieldValue(field.name) === true" class="w-5 h-5 text-success" />
                    <XCircle v-else class="w-5 h-5 text-destructive" />
                    <span class="text-sm font-medium">{{ getFieldValue(field.name) ? 'Oui' : 'Non' }}</span>
                </template>
                <span v-else class="text-xs italic text-muted-foreground">—</span>
            </div>

            <!-- Select -->
            <div v-else-if="field.type === FieldType.SELECT" class="flex flex-wrap gap-2">
                <template v-if="getFieldValue(field.name)">
                    <Badge v-for="(opt, idx) in getFieldValueAsArray(field.name)"
                           :key="String(opt) + idx"
                           variant="outline"
                           class="px-3 py-1 bg-primary/5 text-primary border-primary/20">
                        {{ opt }}
                    </Badge>
                </template>
                <span v-else class="text-xs italic text-muted-foreground">—</span>
            </div>

            <!-- Relation -->
            <div v-else-if="field.type === FieldType.RELATION" class="flex flex-wrap gap-2">
                <template v-if="getFieldValue(field.name)">
                    <ContentEntryCard v-for="(opt, idx) in getFieldValueAsArray(field.name)"
                           :entryId="Number(opt)"
                           :key="String(opt) + idx"
                           class="px-3 py-1 bg-primary/5 text-primary border-primary/20">
                        {{ opt }}
                    </ContentEntryCard>
                </template>
                <span v-else class="text-xs italic text-muted-foreground">Aucune relation</span>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
    --tw-prose-body: var(--foreground);
    --tw-prose-headings: var(--foreground);
    --tw-prose-links: var(--primary);
}
</style>
