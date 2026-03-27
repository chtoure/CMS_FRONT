import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { ContentType, RegisterContentType, UpdateContentType, contentTypeFilter } from "../type/content-type";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";




const buildQueryParams = (filter?: Ref<contentTypeFilter> | contentTypeFilter) => {
  const params = unref(filter);
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.archive) query.append("archive", params.archive.toString());
  if (params?.search) query.append("search", params.search.toString());

  return query.toString();
};


const useGetContentType = (id: number) => {
  return useQuery({
    queryKey: ['content-type', id],
    queryFn: async () => {
      return handleResponse<ContentType>(await api(`/contents/${id}`));
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


const useGetContentTypeBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['content-type', slug],
    queryFn: async () => {
      return handleResponse<ContentType>(await api(`/contentsSlug/${slug}`));
    }
  });
}


const useGetContentTypes = (filter?: Ref<contentTypeFilter> | contentTypeFilter) => {

  return useQuery({
    queryKey: ['contentTypes', filter],
    queryFn: async () => {
      const query = buildQueryParams(filter)
      const response = await api(`/contents?${query}`)

      return handleResponse<Pagination<ContentType>>(response)
    }
  })
}




// Hook get content type excepted
const useGetContentTypesExcepted = (id: number) => {
  return useQuery({
    queryKey: ['contentTypesExcepted', id],
    queryFn: async () => {
      return handleResponse<ContentType[]>(await api(`/contentsExcepted/${id}`));
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
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["content-type"] });
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
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["content-type"] });
    },
  });
};




// Archiver un content type
const useArchiveContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api(`/archiveContents/${id}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["contentTypesArchived"] });
    },
  });
};


// Restorer un content type
const useRestoreContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api(`/restoreContents/${id}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["contentTypesArchived"] });
    },
  });
};


// Delete un contentType
const useDeleteContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api(`/contents/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      queryClient.invalidateQueries({ queryKey: ["contentTypesArchived"] });
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
  useArchiveContentType,
  useGetContentTypeBySlug,
  useGetContentTypesExcepted
}

