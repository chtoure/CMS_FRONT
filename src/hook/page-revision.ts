import { unref, type Ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Pagination } from "../type/pagination";
import type { PageRevision, PageRevisionFilter, RegisterPageRevision } from "../type/page-revision";


const buildQueryParams = (filter?: Ref<PageRevisionFilter> | PageRevisionFilter) => {
  const params = unref(filter);
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) query.append("search", params.search);
  return query.toString();
};

const useGetPageRevisions = (pageId:number | Ref<number>, filter?: Ref<PageRevisionFilter> | PageRevisionFilter) => {
  return useQuery({

    queryKey: ["pages", filter],

    queryFn: async () => {

      const queryString = buildQueryParams(filter);
      const targetId = unref(pageId);
      return handleResponse<Pagination<PageRevision>>(
        await api(`/page-revisions/page/${targetId}?${queryString}`)
      );
    },
    enabled: !!unref(pageId)
  });
};


const useGetPageRevision = (id: number | Ref<number>) => {
  return useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      const targetId = unref(id);
      return handleResponse<PageRevision>(
        await api(`/page-revision/${targetId}`)
      );
    },
    enabled: !!unref(id)
  });
};

const useRegisterPageRevision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterPageRevision) => {
      return handleResponse<PageRevision>(
        await api("/page-revision", {
          method: "POST",
          body: JSON.stringify(data),
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export {
  useGetPageRevisions,
  useGetPageRevision,
  useRegisterPageRevision
};
