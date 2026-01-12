import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { RegisterContentEntry, UpdateContentEntry, IContentEntry } from "../type/content-entry";
import type { Pagination } from "../type/pagination";

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

const useCreateContentEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterContentEntry) => {
      return handleResponse<IContentEntry>(
        await api("/content-entries", {
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

const useUpdateContentEntry = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateContentEntry) => {
      return handleResponse<IContentEntry>(
        await api(`/content-entries/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-entries"] });
      queryClient.invalidateQueries({ queryKey: ["content-entry", id] });
    },
  });
};

export { useGetContentEntries, useCreateContentEntry, useUpdateContentEntry };
