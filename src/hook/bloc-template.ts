/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue';
import { type AnyComponentInstance } from '../type/component';
import type { BlocTemplate, RegisterBlocTemplate, UpdateBlocTemplate } from '../type/bloc-template';
import api, { handleResponse } from '../api/fetchConfig';
import { useSection } from './section';
import type { AnySectionInstance } from '../type/section';
import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { unref } from 'vue';

export function useBlockTemplate() {
  const queryClient = useQueryClient();

  const isSaving = ref(false);
  const lastSavedState = ref<string>('');
  
  // Variables pour le Latest-State Lock
  let isExecuting = false;
  let pendingSaveArg: any = null;
  let pendingSaveResolveFn: ((val: any) => void) | null = null;
  let pendingSaveRejectFn: ((err: any) => void) | null = null;

  const processQueue = async (mode: 'page' | 'library') => {
    if (isExecuting || !pendingSaveArg) return;
    
    isExecuting = true;
    isSaving.value = true;
    
    const argToProcess = pendingSaveArg;
    const resolve = pendingSaveResolveFn!;
    const reject = pendingSaveRejectFn!;
    
    pendingSaveArg = null;
    pendingSaveResolveFn = null;
    pendingSaveRejectFn = null;

    try {
      let syncedTree;
      if (mode === 'page') {
        syncedTree = await useSyncAll(argToProcess.sections, argToProcess.pageRevisionId);
      } else {
        syncedTree = await useSyncTree(argToProcess.nodes, null, undefined, true);
      }
      
      lastSavedState.value = JSON.stringify(syncedTree);
      console.log(mode === 'page' ? 'Auto-save success' : 'Library auto-save success');
      resolve(syncedTree);
    } catch (error) {
      console.error(mode === 'page' ? 'Auto-save failed' : 'Library auto-save failed', error);
      reject(error);
    } finally {
      isExecuting = false;
      // S'il y a une demande en attente accumulée pendant l'exécution, on la traite
      if (pendingSaveArg) {
        processQueue(mode);
      } else {
        isSaving.value = false;
      }
    }
  };
  const { useCreateSection, useUpdateSection, useGetSections, useDeleteSection } = useSection();

  /**
   * Crée un nouveau BlockTemplate via l'API
   */
  const useCreateBlockTemplate = async (component: AnyComponentInstance, parentId: number | null, order: number, sectionId: number | undefined, is_custom = false): Promise<BlocTemplate> => {

    if (!component.componentDefinitionId) {
      throw new Error(`Component definition ID missing for component ${component.name}`);
    };



    const payload: RegisterBlocTemplate = {
      componentId: component.componentDefinitionId!,
      order: order,
      parentId: parentId,
      sectionId: is_custom ? undefined : sectionId,
      is_custom: is_custom,
      modelId: component.modelId,
      props: {
        styles: component.styles,
        data: component.data,
        params: component.params
      }
    };

    const response = await api('/bloc-template', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return handleResponse<BlocTemplate>(response);
  };

  /**
   * Met à jour un BlockTemplate existant
   */
  const useUpdateBlockTemplate = async (component: AnyComponentInstance, parentId: number | null, order: number, sectionId: number | undefined, is_custom = false) => {
    if (!component.blocTemplateId) return;

    const payload: UpdateBlocTemplate = {
      order: order,
      parentId: parentId,
      sectionId: is_custom ? undefined : sectionId,
      is_custom: is_custom,
      props: {
        styles: component.styles,
        data: component.data,
        params: component.params
      }
    };

    const response = await api(`/bloc-template/${component.blocTemplateId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (is_custom) queryClient.invalidateQueries({ queryKey: ['builder-bloc-templates-custom', 'library-bloc-templates'] });

    return handleResponse<BlocTemplate>(response);
  };

  /**
   * Synchronise l'ensemble de l'arbre (Sections -> Blocs)
   */
  const useSyncAll = async (sections: AnySectionInstance[], pageRevisionId: number): Promise<AnySectionInstance[]> => {
    const syncedSections: AnySectionInstance[] = [];

    for (let i = 0; i < sections.length; i++) {
        const section = { ...sections[i] };
        try {
            let currentSectionId = section.sectionId;

            if (!currentSectionId) {
                if (section.order === undefined) {
                    section.order = i;
                }
                const newSection = await useCreateSection(section as AnySectionInstance, pageRevisionId);
                currentSectionId = newSection.id;

                // CONTOURNEMENT BACKEND: Le POST ignore les styles/bloc_json. On force un Update juste après.
                try {
                    await useUpdateSection(currentSectionId, section);
                } catch (e) {
                    console.error("Failed to force update after create section", e);
                }
            } else {
                await useUpdateSection(currentSectionId, section);
            }

            // Synchroniser les blocs de cette section
            const syncedChildren = await useSyncTree(section.children || [], null, currentSectionId);

            syncedSections.push({
                ...section,
                id: section.id || crypto.randomUUID(),
                order: section.order ?? i,
                family: 'section',
                sectionId: currentSectionId,
                styles: section.styles || {},
                children: syncedChildren
            });
        } catch (error) {
            console.error(`Error syncing section ${section.id}`, error);
            syncedSections.push({
                ...section,
                id: section.id || crypto.randomUUID(),
                order: section.order ?? i,
                family: 'section',
                styles: section.styles || {},
                children: section.children || []
            });
        }
    }

    return syncedSections;
  };

  /**
   * Fonction récursive pour synchroniser l'arbre des composants
   */
  const useSyncTree = async (nodes: AnyComponentInstance[], parentId: number | null, sectionId: number | undefined, is_custom = false): Promise<AnyComponentInstance[]> => {
    const syncedNodes: AnyComponentInstance[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = { ...nodes[i] } as AnyComponentInstance;

      try {
        let currentBlocTemplateId = node.blocTemplateId;

        if (!currentBlocTemplateId) {
          const newBlock = await useCreateBlockTemplate(node, parentId, i, sectionId, is_custom);
          currentBlocTemplateId = newBlock.id;

          // CONTOURNEMENT BACKEND: Le POST ignore les props (styles, data, params). On force un Update juste après la création.
          try {
              await useUpdateBlockTemplate({ ...node, blocTemplateId: currentBlocTemplateId } as AnyComponentInstance, parentId, i, sectionId);
          } catch (e) {
              console.error("Failed to force update after create block", e);
          }
        } else {
          await useUpdateBlockTemplate(node, parentId, i, sectionId, is_custom);
        }

        let syncedChildren: AnyComponentInstance[] = [];
        if (node.children && node.children.length > 0) {
          syncedChildren = await useSyncTree(node.children, currentBlocTemplateId, sectionId, is_custom);
        }

        syncedNodes.push({
          ...node,
          blocTemplateId: currentBlocTemplateId,
          children: syncedChildren
        } as AnyComponentInstance);

      } catch (error) {
        console.error(`Error syncing node ${node.name} (${node.id})`, error);
        syncedNodes.push(node);
      }
    }

    return syncedNodes;
  };

  /**
   * Hook de mutation pour l'auto-sauvegarde (Mode Page)
   */
  const useAutoSave = () => {
    return useMutation({
      mutationFn: async ({ sections, pageRevisionId }: { sections: AnySectionInstance[], pageRevisionId: number }) => {
        const currentState = JSON.stringify(sections);
        if (currentState === lastSavedState.value) return Promise.resolve(undefined);

        return new Promise<AnySectionInstance[] | void>((resolve, reject) => {
          if (pendingSaveResolveFn) {
            // Résoudre discrètement l'ancienne requête ignorée pour ne pas bloquer Vue-Query
            pendingSaveResolveFn(undefined);
          }
          
          pendingSaveArg = { sections, pageRevisionId };
          pendingSaveResolveFn = resolve;
          pendingSaveRejectFn = reject;
          
          processQueue('page');
        });
      },
      onSuccess: (data, variables) => {
        if (data) {
          queryClient.invalidateQueries({ queryKey: ['page-tree', variables.pageRevisionId] });
        }
      }
    });
  };

  /**
   * Hook de mutation pour l'auto-sauvegarde (Mode Bibliothèque)
   */
  const useAutoSaveLibrary = () => {
    return useMutation({
      mutationFn: async (nodes: AnyComponentInstance[]) => {
        const currentState = JSON.stringify(nodes);
        if (currentState === lastSavedState.value) return Promise.resolve(undefined);

        return new Promise<AnyComponentInstance[] | void>((resolve, reject) => {
          if (pendingSaveResolveFn) {
            pendingSaveResolveFn(undefined);
          }
          
          pendingSaveArg = { nodes };
          pendingSaveResolveFn = resolve;
          pendingSaveRejectFn = reject;
          
          processQueue('library');
        });
      },
      onSuccess: (data) => {
        if (data) {
          queryClient.invalidateQueries({ queryKey: ['library-tree'] });
          queryClient.invalidateQueries({ queryKey: ['custom-blocks'] });
        }
      }
    });
  };

  /**
   * Hook de mutation pour la sauvegarde immédiate
   */
  const useForceSave = () => {
    return useMutation({
      mutationFn: async ({ sections, pageRevisionId }: { sections: AnySectionInstance[], pageRevisionId: number }) => {
        // En mode Force Save, si une file d'attente existe, on l'écrase
        if (pendingSaveResolveFn) pendingSaveResolveFn(undefined);
        
        isExecuting = true;
        isSaving.value = true;
        try {
          const syncedTree = await useSyncAll(sections, pageRevisionId);
          lastSavedState.value = JSON.stringify(syncedTree);
          return syncedTree;
        } catch (error) {
          console.error('Force save failed', error);
          throw error;
        } finally {
          isExecuting = false;
          // S'il y a quelque chose empilé pendant ce temps, process Queue relancera
          if (pendingSaveArg) {
            processQueue('page');
          } else {
            isSaving.value = false;
          }
        }
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['page-tree', variables.pageRevisionId] });
      }
    });
  };

  const flattenTemplates = (list: BlocTemplate[], parentId: number | null = null): BlocTemplate[] => {
    const output: BlocTemplate[] = [];
    for (const t of list) {
      const { children, ...rest } = t as any;
      output.push({ ...rest, parentId } as BlocTemplate);
      if (children && Array.isArray(children) && children.length) {
        output.push(...flattenTemplates(children, t.id));
      }
    }
    return output;
  };

  /**
   * Construit un arbre de composants à partir d'une liste de templates
   */
  const buildTreeFromTemplates = async (templates: BlocTemplate[]): Promise<AnyComponentInstance[]> => {
    try {
      const response = await api(`/components`, { method: 'GET' });
      const componentsResult = await handleResponse<{ results: any[] }>(response);

      const componentResults = componentsResult.results || [];


      const componentMap = new Map(componentResults.map(c => [c.id, c]));
      const nodeMap = new Map<number | string, AnyComponentInstance>();
      const rootNodes: AnyComponentInstance[] = [];

      for (const t of templates) {
        const def = componentMap.get(t.componentId);
        if (!def) continue;

        const node: AnyComponentInstance = {
          id: crypto.randomUUID(),
          blocTemplateId: t.id,
          componentDefinitionId: t.componentId,
          name: t.name || def.name,
          tag: def.tag,
          icon: def.icon,
          family: def.family,
          supportedActions: def.supportedActions,
          styles: t.props?.styles || {},
          data: t.props?.data || {},
          params: t.props?.params || def.defaultProps?.params || [],
          // Restaurer modelId pour que les instances de modèles custom
          // conservent leur référence au modèle après un refresh de page
          modelId: t.modelId ?? undefined,
          children: []
        };
        nodeMap.set(t.id, node);
      }

      for (const t of templates) {
        const node = nodeMap.get(t.id);
        if (!node) continue;

        if (t.parentId != null) {
          const parent = nodeMap.get(t.parentId);
          if (parent) {
            parent.children.push(node);
          } else {
            rootNodes.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      }

      const orderMap = new Map(templates.map(t => [t.id, t.order]));
      for (const node of nodeMap.values()) {
        if (node.children && node.children.length > 1) {
          node.children.sort((a, b) => (orderMap.get(a.blocTemplateId!) ?? 0) - (orderMap.get(b.blocTemplateId!) ?? 0));
        }
      }
      rootNodes.sort((a, b) => (orderMap.get(a.blocTemplateId!) ?? 0) - (orderMap.get(b.blocTemplateId!) ?? 0));

      return rootNodes;
    } catch (error) {
      console.error('Failed to build tree from templates:', error);
      return [];
    }
  };

  /**
   * Récupère l'arbre des composants pour une section donnée
   */
  const fetchTree = async (sectionId: number): Promise<AnyComponentInstance[]> => {
    try {
      const response = await api(`/bloc-template-tree/${sectionId}`, { method: 'GET' });
      const data = await handleResponse<BlocTemplate[] | { results: BlocTemplate[] }>(response);
      let templates: BlocTemplate[] = Array.isArray(data) ? data : (data.results || []);

      templates = flattenTemplates(templates);
      return await buildTreeFromTemplates(templates);
    } catch (error) {
      console.error('Failed to fetch tree:', error);
      return [];
    }
  };

  const fetchCustomTree = async (): Promise<AnyComponentInstance[]> => {
    try {
      let templates = await fetchCustomBlocks();
      templates = flattenTemplates(templates);
      return buildTreeFromTemplates(templates);
    } catch (error) {
      console.error('Failed to fetch custom tree:', error);
      return [];
    }
  };

  const fetchAll = async (pageRevisionId: number): Promise<AnySectionInstance[]> => {
    try {
      const sections = await useGetSections(pageRevisionId);
      const syncedSections: AnySectionInstance[] = [];
      for (const s of sections) {
          const rootNodes = await fetchTree(s.id);
          syncedSections.push({
              id: crypto.randomUUID(),
              sectionId: s.id,
              order: s.order,
              family: 'section',
              styles: s.block_json?.styles || {},
              children: rootNodes
          });
      }
      lastSavedState.value = JSON.stringify(syncedSections);
      return syncedSections;
    } catch (error) {
      console.error('Failed to fetch full tree:', error);
      return [];
    }
  };

  const fetchCustomBlocks = async (): Promise<BlocTemplate[]> => {
    try {
      const response = await api('/bloc-templates-components-custom', { method: 'GET' });
      const data = await handleResponse<BlocTemplate[] | { results: BlocTemplate[] }>(response);
      return Array.isArray(data) ? data : (data.results || []);
    } catch (error) {
      console.error('Failed to fetch custom blocks:', error);
      return [];
    }
  };

  const useGetCustomBlocks = () => {
    return useQuery({
      queryKey: ['custom-blocks'],
      queryFn: async () => {
        return await fetchCustomBlocks();
      },
      staleTime: 1000 * 60,
    });
  };

  const useGetPageTree = (pageRevisionId: number | Ref<number>) => {
    return useQuery({
      queryKey: ['page-tree', unref(pageRevisionId)],
      queryFn: async () => {
        const revId = unref(pageRevisionId);
        if (!revId) return [];
        return await fetchAll(revId);
      },
      staleTime: 1000 * 60,
      enabled: !!unref(pageRevisionId)
    });
  };

  const useGetLibraryTree = () => {
    return useQuery({
      queryKey: ['library-tree'],
      queryFn: async () => {
        return await fetchCustomTree();
      },
      staleTime: 1000 * 60,
    });
  };

  const useDeleteBlockTemplate = () => {
    return useMutation({
      mutationFn: async (blocTemplateId: number) => {
        const response = await api(`/bloc-template/${blocTemplateId}`, {
          method: 'DELETE'
        });
        return await handleResponse(response);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['custom-blocks'] });
        queryClient.invalidateQueries({ queryKey: ['library-tree'] });
      },
      onError: (error, blocTemplateId) => {
        console.error(`Failed to delete block ${blocTemplateId}:`, error);
      }
    });
  };

  const useSaveAsCustom = () => {
    return useMutation({
      mutationFn: async (component: AnyComponentInstance): Promise<AnyComponentInstance> => {
        const results = await useSyncTree([component], null, component.sectionId, true);
        if (results.length > 0) {
          return results[0]!;
        }
        throw new Error("Failed to save component and its children as custom");
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['custom-blocks'] });
        queryClient.invalidateQueries({ queryKey: ['library-tree'] });
      }
    });
  };

  return {
    useAutoSave,
    useAutoSaveLibrary,
    useForceSave,
    fetchAll,
    fetchCustomBlocks,
    fetchCustomTree,
    useGetPageTree,
    useGetLibraryTree,
    useGetCustomBlocks,
    useSaveAsCustom,
    useDeleteBlockTemplate,
    useDeleteSection,
    useSyncAll,
    isSaving
  };
}
