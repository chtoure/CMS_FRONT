import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contentType: RegisterContentType) => {
      return handleResponse<ContentType>(await api(`/contents`, {
        method: 'POST',
        body: JSON.stringify(contentType)
      }));
    },
     onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
};

const useUpdateContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {contentType: UpdateContentType,id: number}) => {
      return handleResponse<ContentType>(await api(`/contents/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.contentType)
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
};




// Archiver un content type
const useArchiveContentType = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api(`/archiveContents/${id}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
  });
};


// Restorer un content type
const useRestoreContentType = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api(`/restoreContents/${id}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
  });
};


// Delete un contentType
const useDeleteContentType = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api(`/contents/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
  });
};




export {
  useGetContentType,
  useGetContentTypeById,
  useRegisterContentType,
  useUpdateContentType,
  useGetContentTypes,
  useDeleteContentType,
  useRestoreContentType,
  useArchiveContentType
}

