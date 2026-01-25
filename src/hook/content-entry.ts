import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { RegisterContentEntry, UpdateContentEntry, IContentEntry, ContentEntryFilter, EntryStatus } from "../type/content-entry";
import type { Pagination } from "../type/pagination";
import { unref, type Ref } from "vue";

/**
 * Utilitaire pour construire les QueryParams à partir d'un filtre (Ref ou objet)
 */
const buildQueryParams = (filter?: Ref<ContentEntryFilter> | ContentEntryFilter) => {
  const params = unref(filter);
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);
  return query.toString();
};

// GET /content-entries/slug/:slug (Anciennement getAllEntries)
const useGetContentEntriesBySlug = (slug: string | Ref<string>, filter?: Ref<ContentEntryFilter> | ContentEntryFilter) => {
  return useQuery({
    queryKey: ["content-entries", slug, filter],
    queryFn: async () => {
      const targetSlug = unref(slug);
      const queryString = buildQueryParams(filter);
      return handleResponse<Pagination<IContentEntry>>(
        await api(`/content-entries/slug/${targetSlug}?${queryString}`)
      );
    },
    enabled: !!unref(slug)
  });
};

// GET /content-entries/:id
const useGetContentEntry = (id: number | Ref<number>) => {
  return useQuery({
    queryKey: ["content-entry", id],
    queryFn: async () => {
      const targetId = unref(id);
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${targetId}`)
      );
    },
    enabled: !!unref(id)
  });
};

// POST /content-entries/:slug
const useCreateContentEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string, data: RegisterContentEntry }) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${slug}`, {
          method: "POST",
          body: JSON.stringify(data),
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
    },
  });
};

// PUT /content-entries/:id
const useUpdateContentEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: UpdateContentEntry }) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["content-entry", variables.id] });
    },
  });
};

// PATCH /content-entries/:id/status
const useSwitchStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: { status: EntryStatus } }) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify(status)
        })
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["content-entry", variables.id] });
    },
  });
};

// PUT /content-entries/:id/archive (Gère Archive et Restauration)
const useToggleArchive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archive }: { id: number, archive: boolean }) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${id}/archive`, {
          method: "PUT",
          body: JSON.stringify({ archive })
        })
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["archived-content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["content-entry", variables.id] });
    },
  });
};

// GET /content-entries-archived
const useGetArchivedContentEntries = (filter?: Ref<ContentEntryFilter> | ContentEntryFilter) => {
  return useQuery({
    queryKey: ["archived-content-entries", filter],
    queryFn: async () => {
      const queryString = buildQueryParams(filter);
      return handleResponse<Pagination<IContentEntry>>(
        await api(`/content-entries-archived?${queryString}`)
      );
    },
  });
};

// DELETE /content-entries/:id
const useDeleteContentEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${id}`, {
          method: "DELETE"
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["archived-content-entries"] });
    },
  });
};

export {
  useGetContentEntriesBySlug,
  useGetContentEntry,
  useCreateContentEntry,
  useUpdateContentEntry,
  useSwitchStatus,
  useToggleArchive,
  useGetArchivedContentEntries,
  useDeleteContentEntry
};
