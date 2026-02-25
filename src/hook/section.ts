import { ref } from 'vue';
import type { Section, RegisterSection, UpdateSection, AnySectionInstance } from '../type/section';
import api, { handleResponse } from '../api/fetchConfig';

export function useSection() {
  const isSaving = ref(false);

  const useCreateSection = async (section: AnySectionInstance, pageRevisionId: number): Promise<Section> => {
    const payload: RegisterSection = {
      pageRevisionId,
      order: section.order,
      block_json: { styles: section.styles }
    };

    const response = await api('/section', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return handleResponse<Section>(response);
  };

  const useUpdateSection = async (sectionId: number, data: Partial<AnySectionInstance>): Promise<Section> => {
    const payload: UpdateSection = {
      order: data.order,
      block_json: data.styles ? { styles: data.styles } : undefined
    };

    const response = await api(`/section/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    return handleResponse<Section>(response);
  };

  const useDeleteSection = async (sectionId: number): Promise<void> => {
    const response = await api(`/section/${sectionId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  };

  const useGetSections = async (pageRevisionId: number): Promise<Section[]> => {
    const response = await api(`/section/revision/${pageRevisionId}`, {
      method: 'GET'
    });
    const data = await handleResponse<Section[] | { results: Section[] }>(response);
    console.log(data);

    return Array.isArray(data) ? data : (data.results || []);
  };

  return {
    useCreateSection,
    useUpdateSection,
    useDeleteSection,
    useGetSections,
    isSaving
  };
}
