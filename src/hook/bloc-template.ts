import { ref } from 'vue';
import type { AnyComponent, AnyComponentInstance } from '../type/component';
import type { BlocTemplate, RegisterBlocTemplate, UpdateBlocTemplate } from '../type/bloc-template';
import api, { handleResponse } from '../api/fetchConfig';
import { useSection } from './section';
import type { AnySectionInstance } from '../type/section';

export function useBlockTemplate() {
  const isSaving = ref(false);
  const lastSavedState = ref<string>('');
  const saveTimeout = ref<number | null>(null);
  const { useCreateSection, useUpdateSection, useGetSections, useDeleteSection } = useSection();

  /**
   * Crée un nouveau BlockTemplate via l'API
   */
  const useCreateBlockTemplate = async (component: AnyComponentInstance, parentId: number | null, order: number, sectionId: number, is_custom = false): Promise<BlocTemplate> => {
    if (!component.componentDefinitionId) {
      throw new Error(`Component definition ID missing for component ${component.name}`);
    };

    const payload: RegisterBlocTemplate = {
      componentId: component.componentDefinitionId!,
      order: order,
      parentId: parentId, // On envoie tel quel (number ou null)
      sectionId: is_custom ? undefined : sectionId,
      is_custom: is_custom,
      props: {
        styles: component.styles,
        data: component.data
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
  const useUpdateBlockTemplate = async (component: AnyComponentInstance, parentId: number | null, order: number, sectionId: number, is_custom = false) => {
    if (!component.blocTemplateId) return;

    const payload: UpdateBlocTemplate = {
      order: order,
      parentId: parentId, // On envoie tel quel (number ou null)
      sectionId: is_custom ? undefined : sectionId,
      is_custom: is_custom,
      props: {
        styles: component.styles,
        data: component.data
      }
    };

    const response = await api(`/bloc-template/${component.blocTemplateId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

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
                const newSection = await useCreateSection(section as AnySectionInstance, pageRevisionId);
                currentSectionId = newSection.id;
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
  const useSyncTree = async (nodes: AnyComponentInstance[], parentId: number | null, sectionId: number, is_custom = false): Promise<AnyComponentInstance[]> => {
    const syncedNodes: AnyComponentInstance[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = { ...nodes[i] } as AnyComponentInstance; 
      
      try {
        let currentBlocTemplateId = node.blocTemplateId;

        if (!currentBlocTemplateId) {
          const newBlock = await useCreateBlockTemplate(node, parentId, i, sectionId, is_custom);
          currentBlocTemplateId = newBlock.id;
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
   * Sauvegarde ou met à jour l'arbre complet (Mode Page)
   */
  const autoSave = (sections: AnySectionInstance[], pageRevisionId: number): Promise<AnySectionInstance[] | void> => {
    const currentState = JSON.stringify(sections);
    if (currentState === lastSavedState.value) return Promise.resolve();

    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value);
    }

    return new Promise((resolve) => {
      saveTimeout.value = window.setTimeout(async () => {
        isSaving.value = true;
        try {
          const syncedTree = await useSyncAll(sections, pageRevisionId);
          lastSavedState.value = JSON.stringify(syncedTree);
          console.log('Auto-save success');
          resolve(syncedTree);
        } catch (error) {
          console.error('Auto-save failed', error);
          resolve();
        } finally {
          isSaving.value = false;
          saveTimeout.value = null;
        }
      }, 1000);
    });
  };

  /**
   * Sauvegarde l'arbre de la bibliothèque (Mode Bibliothèque)
   */
  const autoSaveLibrary = (nodes: AnyComponentInstance[]): Promise<AnyComponentInstance[] | void> => {
    const currentState = JSON.stringify(nodes);
    if (currentState === lastSavedState.value) return Promise.resolve();

    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value);
    }

    return new Promise((resolve) => {
      saveTimeout.value = window.setTimeout(async () => {
        isSaving.value = true;
        try {
          // Pour la bibliothèque, parentId est null au début, sectionId est 0 (ignoré car is_custom=true)
          const syncedTree = await useSyncTree(nodes, null, 0, true);
          lastSavedState.value = JSON.stringify(syncedTree);
          console.log('Library auto-save success');
          resolve(syncedTree);
        } catch (error) {
          console.error('Library auto-save failed', error);
          resolve();
        } finally {
          isSaving.value = false;
          saveTimeout.value = null;
        }
      }, 1000);
    });
  };

  /**
   * Force une sauvegarde immédiate
   */
  const forceSave = async (sections: AnySectionInstance[], pageRevisionId: number): Promise<AnySectionInstance[]> => {
    if (saveTimeout.value) clearTimeout(saveTimeout.value);
    isSaving.value = true;
    try {
      const syncedTree = await useSyncAll(sections, pageRevisionId);
      lastSavedState.value = JSON.stringify(syncedTree);
      return syncedTree;
    } catch (error) {
      console.error('Force save failed', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Construit un arbre de composants à partir d'une liste de templates
   */
  const buildTreeFromTemplates = async (templates: BlocTemplate[]): Promise<AnyComponentInstance[]> => {
    try {
      const componentsResponse = await api(`/components`, { method: 'GET' });
      const componentsResult = await handleResponse<{ results: AnyComponent[] }>(componentsResponse);
      const componentMap = new Map(componentsResult.results?.map(c => [c.id, c]));

      templates.sort((a, b) => a.order - b.order);

      const nodeMap = new Map<number, AnyComponentInstance>();
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
          children: []
        };
        nodeMap.set(t.id, node);
      }

      for (const t of templates) {
        const node = nodeMap.get(t.id);
        if (!node) continue;

        if (t.parentId && nodeMap.has(t.parentId)) {
          const parent = nodeMap.get(t.parentId)!;
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }

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
      const templates: BlocTemplate[] = Array.isArray(data) ? data : (data.results || []);
      return buildTreeFromTemplates(templates);
    } catch (error) {
      console.error('Failed to fetch tree:', error);
      return [];
    }
  };

  /**
   * Récupère l'arbre complet de tous les composants personnalisés (is_custom: true)
   */
  const fetchCustomTree = async (): Promise<AnyComponentInstance[]> => {
    try {
      const templates = await fetchCustomBlocks();
      return buildTreeFromTemplates(templates);
    } catch (error) {
      console.error('Failed to fetch custom tree:', error);
      return [];
    }
  };

  /**
   * Récupère l'arbre complet (Sections + Blocs)
   */
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

  /**
   * Supprime un BlockTemplate du backend
   */
  const deleteBlockTemplate = async (blocTemplateId: number) => {
    try {
      const response = await api(`/bloc-template/${blocTemplateId}`, {
        method: 'DELETE'
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Failed to delete block ${blocTemplateId}:`, error);
      throw error;
    }
  };

  /**
   * Récupère tous les BlocTemplates personnalisés (is_custom: true)
   */
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

  /**
   * Enregistre un composant existant comme un nouveau composant personnalisé (is_custom: true)
   * Inclut récursivement tous les enfants.
   */
  const saveAsCustom = async (component: AnyComponentInstance): Promise<AnyComponentInstance> => {
    // 1. Cloner pour ne pas impacter l'instance sur la page
    const clone = JSON.parse(JSON.stringify(component)) as AnyComponentInstance;

    // 2. Fonction récursive pour nettoyer les IDs existants (on veut créer des nouveaux templates)
    const stripIds = (node: AnyComponentInstance) => {
      delete node.blocTemplateId;
      if (node.children && node.children.length > 0) {
        node.children.forEach(stripIds);
      }
    };
    
    stripIds(clone);

    // 3. Utiliser useSyncTree pour sauvegarder tout l'arbre avec is_custom: true
    // parentId: null, sectionId: 0 (ignoré), is_custom: true
    const results = await useSyncTree([clone], null, 0, true);
    
    if (results.length > 0) {
      return results[0]!;
    }
    throw new Error("Failed to save component and its children as custom");
  };

  return {
    autoSave,
    autoSaveLibrary,
    forceSave,
    fetchAll,
    fetchCustomBlocks,
    fetchCustomTree,
    saveAsCustom,
    deleteBlockTemplate,
    useDeleteSection,
    isSaving
  };
}
