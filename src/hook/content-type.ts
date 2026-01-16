import { useQuery, useMutation } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { ContentType, RegisterContentType, UpdateContentType, contentTypeFilter } from "../type/content-type";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";

const useGetContentType = () => {
  return useQuery({
    queryKey: ['content-types'],
    queryFn: async () => {
      return handleResponse<ContentType>(await api(`/mock/content-type`));
    }
  });
};

const useGetContentTypeById = (id: number | string) => {
  return useQuery({
    queryKey: ['content-types', id],
    queryFn: async () => {
      return handleResponse<ContentType>(await api(`/contents/${id}`));
    }
  });
};


const useGetContentTypes = () => {
  return useQuery({
    queryKey: ['contentTypes'],
    queryFn: async () => {
      return handleResponse<ContentType[]>(await api(`/contentsNoPaginate`));
    }
  })
}


// Hook get users list
export const useGetContentsPaginate = (filter: Ref<contentTypeFilter> | contentTypeFilter) => {
  return useQuery({
    queryKey: ["contents",filter],
    queryFn:async () => {
      const params = unref(filter)
      const query = new URLSearchParams()

      if (params.archive) query.append('archive', params.archive.toString())
      if (params.page) query.append('page', params.page.toString())
      if (params.limit) query.append('limit', params.limit.toString())


      const response = await api(`/contents?${query.toString()}`)

      return handleResponse<Pagination<ContentType>>(response)
    }
  })
}



const useRegisterContentType = () => {
  return useMutation({
    mutationFn: async (contentType: RegisterContentType) => {
      return handleResponse<ContentType>(await api(`/contents`, {
        method: 'POST',
        body: JSON.stringify(contentType)
      }));
    }
  });
};

const useUpdateContentType = () => {
  return useMutation({
    mutationFn: async (data: {contentType: UpdateContentType,id: number}) => {
      return handleResponse<ContentType>(await api(`/contents/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.contentType)
      }));
    }
  });
};




export {
  useGetContentType,
  useGetContentTypeById,
  useRegisterContentType,
  useUpdateContentType,
  useGetContentTypes
}

