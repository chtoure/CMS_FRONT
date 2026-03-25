<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import Select from '../../../components/ui/select/Select.vue';
import SelectTrigger from '../../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../../components/ui/select/SelectValue.vue';
import SelectContent from '../../../components/ui/select/SelectContent.vue';
import SelectItem from '../../../components/ui/select/SelectItem.vue';
import { Button } from '../../../components/ui/button';
import { Link as LinkIcon } from 'lucide-vue-next';
import { ValueSource, type IContenusField, type IParentField } from '../../../type/params';
import { useGetContentTypes } from '../../../hook/content-type';
import { FieldType, TypesMedia } from '../../../type/field';
import * as Icons from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
  getCompatibleParentParams: (childParam: any, childElement?: any) => any[];
}>();

const emit = defineEmits(['update-child-linked-query', 'update-child-param-source', 'force-aria-hidden', 'update-child-bg-image-key']);

const { data: contentTypeOptions } = useGetContentTypes();

const getIcon = (name: string) => {
  if (name in Icons) {
    const maybeIcon = (Icons as any)[name];
    if (typeof maybeIcon === 'function' || typeof maybeIcon === 'object') {
      return maybeIcon;
    }
  }
  return Icons.HelpCircle;
};

// Récupère les champs du CMS compatibles avec un type de paramètre enfant
const getCompatibleCMSFields = (parentParamName: string | undefined, childParam: any, childId: string) => {
  const params = props.element.params || [];
  let contentTypeId: number | undefined;

  if (parentParamName === '_inherited_query') {
    contentTypeId = (props.element.data as any).linkedQueryContentTypeId;
  } else if (parentParamName) {
    const parentParam = params.find(p => p.name === parentParamName);
    if (parentParam?.type.source === ValueSource.CONTENUS) {
      contentTypeId = parentParam.type.contentTypeId;
    }
  } else {
    const findChild = (nodes: AnyComponentInstance[]): AnyComponentInstance | null => {
      for (const node of nodes) {
        if (node.id === childId) return node;
        if (node.children) {
          const found = findChild(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const childNode = findChild(props.element.children || []);
    const linkedQuery = (childNode?.data as any)?.linkedQueryParamName;
    if (linkedQuery) {
      const parentParam = params.find(p => p.name === linkedQuery);
      if (parentParam?.type.source === ValueSource.CONTENUS) {
        contentTypeId = parentParam.type.contentTypeId;
      }
    }
  }

  if (!contentTypeId) return [];
  const contentType = contentTypeOptions.value?.results?.find((ct: any) => ct.id === contentTypeId);
  if (!contentType) return [];

  const childType = childParam.type.source === ValueSource.PARENT
                    ? (childParam.type as IParentField).targetType
                    : childParam.type.source;

  return contentType.fields_schema.filter((f: any) => {
    if (childType === ValueSource.STATIC) {
      return [FieldType.TEXT, 'text', 'string', FieldType.NUMBER, 'number', FieldType.RICH_TEXT, 'richtext', FieldType.BOOLEAN, 'boolean'].includes(f.type);
    }
    if (childType === ValueSource.IMAGE) {
      const isMedia = f.type === FieldType.MEDIA || f.type === 'media';
      if (!isMedia) return false;
      const allowed = f.allowedTypes || [];
      return allowed.includes(TypesMedia.IMAGE) || allowed.includes('image');
    }
    return false;
  }).map((f: any) => ({ label: f.label || f.name, value: f.name }));
};

// Retourne les champs MEDIA/image du ContentType associé à linkedQueryParamName d'un child container
const getMediaCMSFields = (child: AnyComponentInstance) => {
  const linkedQueryName = (child.data as any).linkedQueryParamName;
  if (!linkedQueryName) return [];

  const parentParam = props.element.params?.find(p => p.name === linkedQueryName);
  const contentTypeId = parentParam?.type.source === ValueSource.CONTENUS
    ? parentParam.type.contentTypeId
    : undefined;

  if (!contentTypeId) return [];
  const contentType = contentTypeOptions.value?.results?.find((ct: any) => ct.id === contentTypeId);
  if (!contentType) return [];

  return contentType.fields_schema
    .filter((f: any) => f.type === FieldType.MEDIA || f.type === 'media')
    .filter((f: any) => {
      const allowed = f.allowedTypes || [];
      return allowed.length === 0 || allowed.includes(TypesMedia.IMAGE) || allowed.includes('image');
    })
    .map((f: any) => ({ label: f.label || f.name, value: f.name }));
};
</script>

<template>
  <div v-if="element.family === 'container' && element.children && element.children.length > 0 && (element.params?.some(p => p.type.source === ValueSource.CONTENUS) || !!(element.data as any).linkedQueryParamName)" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Liaison Enfants" :icon="LinkIcon" :open="true">
      <div class="space-y-4">
        <div v-for="child in element.children" :key="child.id" class="p-3 bg-builder-bar-background/30 rounded border border-builder-bar-border/50 space-y-3 mb-2">
          <div class="flex items-center justify-between border-b border-builder-bar-border/30 pb-2">
            <div class="flex items-center gap-2">
              <component :is="getIcon(child.icon)" class="h-3.5 w-3.5 text-primary/70" />
              <span class="text-[10px] font-mono font-bold text-builder-bar-text/80 uppercase tracking-tighter">{{ child.name }}</span>
            </div>
            <div v-if="child.family === 'container'" class="flex items-center gap-2">
               <Select
                  :model-value="(child.data as any).linkedQueryParamName"
                  :modal="false"
                  @update:model-value="(val) => emit('update-child-linked-query', child.id, val as string)"
                  @update:open="(val) => emit('force-aria-hidden', val)"
               >
                  <SelectTrigger class="h-6 text-[9px] bg-builder-input-bg border-builder-bar-border w-28">
                    <SelectValue placeholder="Lier liste..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="null">
                      <span class="text-[9px]">Aucune</span>
                    </SelectItem>
                    <SelectItem
                      v-for="p in element.params.filter(p => p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'query')"
                      :key="p.name"
                      :value="p.name"
                    >
                      <span class="text-[9px]">{{ p.label }}</span>
                    </SelectItem>
                  </SelectContent>
               </Select>
            </div>
          </div>

          <!-- Liaison Arrière-plan pour containers avec CMS query lié -->
          <div v-if="child.family === 'container' && (child.data as any).linkedQueryParamName && getMediaCMSFields(child).length > 0" class="space-y-1 flex flex-col">
            <label class="text-[8px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Arrière-plan (champ CMS)</label>
            <Select
              :model-value="(child.data as any).linkedBgImageKey || null"
              :modal="false"
              @update:model-value="(val) => emit('update-child-bg-image-key', child.id, val as string)"
              @update:open="(val) => emit('force-aria-hidden', val)"
            >
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Choisir un champ image..." />
              </SelectTrigger>
              <SelectContent :modal="false">
                <SelectItem :value="null">
                  <span class="text-[9px]">Aucun</span>
                </SelectItem>
                <SelectItem v-for="f in getMediaCMSFields(child)" :key="f.value" :value="f.value">
                  <span class="text-[9px]">{{ f.label }}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-for="p in child.params" :key="p.name" class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">{{ p.label }}</label>
              <Button
                size="sm"
                variant="ghost"
                class="h-6 text-[9px] px-2 font-bold transition-all"
                :class="p.type.source === 'parent' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'hover:bg-white/5 opacity-50'"
                @click="(e: MouseEvent) => {
                  emit('update-child-param-source', child.id, p.name, p.type.source === 'parent' ? ValueSource.STATIC : ValueSource.PARENT);
                  (e.currentTarget as HTMLElement)?.blur();
                }"
              >
                {{ p.type.source === 'parent' ? 'LIÉ' : 'LIER' }}
              </Button>
            </div>

            <div v-if="p.type.source === 'parent'" :key="`link-${child.id}-${p.name}`" class="pl-2 border-l border-primary/30 space-y-3 pt-1">
              <div class="space-y-1 flex flex-col">
                <label class="text-[8px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Paramètre Parent</label>
                <Select
                    :model-value="(p.type as IParentField).parentParamName"
                    :modal="false"
                    @update:model-value="(val) => emit('update-child-param-source', child.id, p.name, ValueSource.PARENT, val as string)"
                    @update:open="(val) => emit('force-aria-hidden', val)"
                 >
                    <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="pp in getCompatibleParentParams(p, child)" :key="pp.name" :value="pp.name">
                        <span class="text-[10px]">{{ pp.label }}</span>
                      </SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div v-if="(p.type as IParentField).parentParamName && (
                (p.type as IParentField).parentParamName === '_inherited_query' ||
                element.params.find(pp => pp.name === (p.type as IParentField).parentParamName)?.type.source === ValueSource.CONTENUS
              )" class="space-y-1 flex flex-col">
                <label class="text-[8px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Champ Source (CMS)</label>
                 <Select
                  :model-value="(p.type as IParentField).parentKey"
                  :modal="false"
                  @update:model-value="(val) => emit('update-child-param-source', child.id, p.name, ValueSource.PARENT, (p.type as IParentField).parentParamName, val as string)"
                  @update:open="(val) => emit('force-aria-hidden', val)"
                >
                  <SelectTrigger
                    class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border"
                    :class="{ 'border-red-500/50': !(p.type as IParentField).parentKey }"
                  >
                    <SelectValue placeholder="Choisir le champ..." />
                  </SelectTrigger>
                  <SelectContent :modal="false">
                    <SelectItem v-for="cf in getCompatibleCMSFields((p.type as IParentField).parentParamName, p, child.id)" :key="cf.value" :value="cf.value">
                      <span class="text-[10px]">{{ cf.label }}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="!(p.type as IParentField).parentKey" class="text-[8px] text-red-400 italic font-medium">Sélectionnez un champ pour activer la liaison</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
