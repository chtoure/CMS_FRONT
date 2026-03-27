import { unref, type Ref } from "vue";
import type { Page, PageFilter, PageRenderResponse, RegisterPage, UpdatePage } from "../type/page";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Pagination } from "../type/pagination";
import type { NavItem } from "../type/nav-item";


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
        await api(`/page/${targetId}`)
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
      const endpoint = targetSlug ? `/renderPage/${targetSlug}` : `/renderPage`;
      return handleResponse<PageRenderResponse>(
        await api(endpoint)
      );
    },
    // Ou on vérifie que slug n'est pas undefined/null
    enabled: unref(slug) !== undefined
  });
};

const useAddPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageData: RegisterPage) => {
      const response = await api("/page", {
        method: "POST",
        body: JSON.stringify(pageData),
      });
      return handleResponse<Page>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pageData }: { id: number; pageData: UpdatePage }) => {
      const response = await api(`/page/${id}`, {
        method: "PUT",
        body: JSON.stringify(pageData),
      });
      return handleResponse<Page>(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["page", variables.id] });
    },
  });
};

const useGetNavItems = () => {
  return useQuery({
    queryKey: ["nav-items"],
    queryFn: async () => {
      const response = await api("/api/nav-item");
      const data = await handleResponse<NavItem[]>(response);
      return data.map(item => ({
        label: item.label,
        value: item.value
      }));
    }
  });
};


export {
  useGetPages,
  useGetPage,
  UseRenderPage,
  useAddPage,
  useUpdatePage,
  useGetNavItems,
};
