import { unref, type Ref } from "vue";
import type { Page, PageFilter, PageRenderResponse } from "../type/page";
import { useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Pagination } from "../type/pagination";


const buildQueryParams = (filter?: Ref<PageFilter> | PageFilter) => {
  const params = unref(filter);
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) query.append("search", params.search);
  return query.toString();
};

const useGetPages = (filter?: Ref<PageFilter> | PageFilter) => {
  return useQuery({

    queryKey: ["pages", filter],

    queryFn: async () => {

      const queryString = buildQueryParams(filter);
      return handleResponse<Pagination<Page>>(
        await api(`/pages?${queryString}`)
      );
    },
  });
};


const useGetPage = (id: number | Ref<number>) => {
  return useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      const targetId = unref(id);
      return handleResponse<Page>(
        await api(`/pages/${targetId}`)
      );
    },
    enabled: !!unref(id)
  });
};



const UseRenderPage = (slug: string | Ref<string>) => {
  return useQuery({
    queryKey: ["renderPage", slug],
    queryFn: async () => {
      const targetSlug = unref(slug);
      return handleResponse<PageRenderResponse>(
        await api(`/renderPage/${targetSlug}`)
      );
    },
    enabled: !!unref(slug)
  });
};

export {
  useGetPages,
  useGetPage,
  UseRenderPage
};
