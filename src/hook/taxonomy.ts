import { useQuery, useMutation } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Taxonomy, RegisterTaxonomy, UpdateTaxonomy, taxonomyFilter } from "../type/taxonomy";
import { unref, type Ref, computed } from "vue";
import type { Pagination } from "../type/pagination";


const buildQueryParams = (filter?: Ref<taxonomyFilter> | taxonomyFilter) => {

  const params = unref(filter);
  const query = new URLSearchParams();

  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.archive) query.append("archive", params.archive.toString());
  if (params?.search) query.append("search", params.search.toString());
  return query.toString();
};



export const useGetTaxonomies = (filter?: Ref<taxonomyFilter> | taxonomyFilter) => {
  return useQuery({
    queryKey: ["taxonomies", filter],
    queryFn: async () => {
      const query = buildQueryParams(filter)
      const response = await api(`/taxonomies?${query}`)
      return handleResponse<Pagination<Taxonomy>>(response)
    }
  })
}


export const useRegisterTaxonomy = () => {
  return useMutation({
    mutationFn: async (taxonomy: RegisterTaxonomy) => {
      return handleResponse<Taxonomy>(await api(`/taxonomies`, {
        method: 'POST',
        body: JSON.stringify(taxonomy)
      }));
    }
  });
};

export const useUpdateTaxonomy = () => {
  return useMutation({
    mutationFn: async (taxonomy: UpdateTaxonomy) => {
      const { id, ...data } = taxonomy;
      return handleResponse<Taxonomy>(await api(`/taxonomies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }));
    }
  });
};

export const useGetTaxonomy = (id: Ref<number | string | null> | number | string | null) => {
  return useQuery({
    queryKey: ['taxonomy', id],
    queryFn: async () => {
      const taxonomyId = unref(id);
      if (!taxonomyId) return null;
      return handleResponse<Taxonomy>(await api(`/taxonomies/${taxonomyId}`));
    },
    enabled: computed(() => !!unref(id))
  });
};


export const useArchiveTaxonomy = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      return handleResponse<Taxonomy>(await api(`/archiveTaxonomies/${id}`, {
        method: 'PUT'
      }));
    }
  });
};

export const useRestoreTaxonomy = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      return handleResponse<Taxonomy>(await api(`/restoreTaxonomies/${id}`, {
        method: 'PUT'
      }));
    }
  });
};

export const useDeleteTaxonomy = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      return handleResponse<Taxonomy>(await api(`/taxonomies/${id}`, {
        method: 'DELETE'
      }));
    }
  });
};


export const useGetTaxonomyBySlug = (slug: Ref<string | null> | string | null) => {
  return useQuery({
    queryKey: ['taxonomyBySlug', slug],
    queryFn: async () => {
      const taxonomySlug = unref(slug);
      if (!taxonomySlug) return null;
      return handleResponse<Taxonomy>(await api(`/taxonomiesSlug/${taxonomySlug}`));
    },
    enabled: computed(() => !!unref(slug))
  });
};
