import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { RegisterContentEntry, UpdateContentEntry, IContentEntry, ContentEntryFilter } from "../type/content-entry";
import type { Pagination } from "../type/pagination";
import { unref, type Ref } from "vue";

const useGetContentEntries = (params: { contentTypeSlug?: string, page?: number, limit?: number }) => {
  return useQuery({
    queryKey: ["content-entries", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.contentTypeSlug) query.append("contentTypeSlug", params.contentTypeSlug);
      if (params.page) query.append("page", params.page.toString());
      if (params.limit) query.append("limit", params.limit.toString());

      return handleResponse<Pagination<IContentEntry>>(
        await api(`/content-entries?${query.toString()}`)
      );
    },
  });
};

const useGetContentEntryByContentTypeId = ({id, filter}: {id: number, filter?: Ref<ContentEntryFilter> | ContentEntryFilter}) => {
  return useQuery({
    queryKey: ["content-entry", id, filter],
    queryFn: async () => {
      const query = new URLSearchParams();
      const params = unref(filter)
      if (params?.type) query.append("type", params.type);
      if (params?.page) query.append("page", params.page.toString());
      if (params?.limit) query.append("limit", params.limit.toString());
      if (params?.search) query.append("search", params.search);
      return handleResponse<IContentEntry[]>(
        await api(`/content-entry/content-type/${id}?${query.toString()}`)
      );
    },
  });
};

const useGetContentEntry = (id: number) => {
  return useQuery({
    queryKey: ["content-entry-detail", id],
    queryFn: async () => {
      return handleResponse<IContentEntry>(
        await api(`/content-entry/${id}`)
      );
    },
    enabled: !!id
  });
};

const useCreateContentEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({slug, data}: {slug: string, data: RegisterContentEntry}) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entry/${slug}`, {
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

const useUpdateContentEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: number, data: UpdateContentEntry}) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entry/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["content-entry"] });
    },
  });
};

export {
  useGetContentEntries,
  useCreateContentEntry,
  useUpdateContentEntry,
  useGetContentEntryByContentTypeId,
  useGetContentEntry,
};
