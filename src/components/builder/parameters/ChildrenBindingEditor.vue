<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
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
      if (linkedQuery === '_inherited_query') {
        contentTypeId = (props.element.data as any).linkedQueryContentTypeId;
      } else {
        const parentParam = params.find(p => p.name === linkedQuery);
        if (parentParam?.type.source === ValueSource.CONTENUS) {
          contentTypeId = parentParam.type.contentTypeId;
        }
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

  let contentTypeId: number | undefined;

  if (linkedQueryName === '_inherited_query') {
    contentTypeId = (props.element.data as any).linkedQueryContentTypeId;
  } else {
    const parentParam = props.element.params?.find(p => p.name === linkedQueryName);
    contentTypeId = parentParam?.type.source === ValueSource.CONTENUS
      ? parentParam.type.contentTypeId
      : undefined;
  }

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
  <div v-if="(element.family === 'container' || element.tag === 'SliderBuilder') && element.children && element.children.length > 0 && (element.params?.some(p => p.type.source === ValueSource.CONTENUS) || !!(element.data as any).linkedQueryParamName)" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Liaison Enfants" :icon="LinkIcon" :open="true">
      <div class="space-y-4">
        <div v-for="child in element.children" :key="child.id" class="p-3 bg-builder-bar-background/30 rounded border border-builder-bar-border/50 space-y-3 mb-2">
          <div class="flex items-center justify-between border-b border-builder-bar-border/30 pb-2">
            <div class="flex items-center gap-2">
              <component :is="getIcon(child.icon)" class="h-3.5 w-3.5 text-primary/70" />
              <span class="text-[10px] font-mono font-bold text-builder-bar-text/80 uppercase tracking-tighter">{{ child.name }}</span>
            </div>
            <div v-if="child.family === 'container'" class="flex items-center gap-2">
               <select
                  :value="(child.data as any).linkedQueryParamName"
                  @change="(e) => emit('update-child-linked-query', child.id, (e.target as HTMLSelectElement).value)"
                  class="h-6 text-[9px] bg-builder-input-bg border border-builder-bar-border rounded w-28 outline-none focus:border-primary"
               >
                  <option :value="null">Aucune</option>
                  <option
                    v-if="(element.data as any).linkedQueryContentTypeId"
                    value="_inherited_query"
                  >
                    Requête Héritée
                  </option>
                  <option
                    v-for="p in element.params.filter(p => p.type.source === ValueSource.CONTENUS && ( (p.type as IContenusField).config.mode === 'query' || (p.type as IContenusField).config.mode === 'single'))"
                    :key="p.name"
                    :value="p.name"
                  >
                    {{ p.label }}
                  </option>
               </select>
            </div>
          </div>

          <!-- Liaison Arrière-plan pour containers avec CMS query lié -->
          <div v-if="child.family === 'container' && (child.data as any).linkedQueryParamName && getMediaCMSFields(child).length > 0" class="space-y-1 flex flex-col">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Arrière-plan (champ CMS)</label>
            <select
              :value="(child.data as any).linkedBgImageKey || null"
              @change="(e) => emit('update-child-bg-image-key', child.id, (e.target as HTMLSelectElement).value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
              <option :value="null">Aucun</option>
              <option v-for="f in getMediaCMSFields(child)" :key="f.value" :value="f.value">
                {{ f.label }}
              </option>
            </select>
          </div>

          <div v-for="p in child.params" :key="p.name" class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">{{ p.label }}</label>
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
                <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Paramètre Parent</label>
                <select
                    :value="(p.type as IParentField).parentParamName"
                    @change="(e) => emit('update-child-param-source', child.id, p.name, ValueSource.PARENT, (e.target as HTMLSelectElement).value)"
                    class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
                 >
                    <option value="" disabled>Choisir...</option>
                    <option v-for="pp in getCompatibleParentParams(p, child)" :key="pp.name" :value="pp.name">
                      {{ pp.label }}
                    </option>
                </select>
              </div>

              <div v-if="(p.type as IParentField).parentParamName && (
                (p.type as IParentField).parentParamName === '_inherited_query' ||
                element.params.find(pp => pp.name === (p.type as IParentField).parentParamName)?.type.source === ValueSource.CONTENUS
              )" class="space-y-1 flex flex-col">
                <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Champ Source (CMS)</label>
                <select
                  :value="(p.type as IParentField).parentKey"
                  @change="(e) => emit('update-child-param-source', child.id, p.name, ValueSource.PARENT, (p.type as IParentField).parentParamName, (e.target as HTMLSelectElement).value)"
                  class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
                  :class="{ 'border-red-500/50': !(p.type as IParentField).parentKey }"
                >
                  <option value="" disabled>Choisir le champ...</option>
                  <option v-for="cf in getCompatibleCMSFields((p.type as IParentField).parentParamName, p, child.id)" :key="cf.value" :value="cf.value">
                    {{ cf.label }}
                  </option>
                </select>
                <p v-if="!(p.type as IParentField).parentKey" class="text-[8px] text-red-400 italic font-medium">Sélectionnez un champ pour activer la liaison</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
