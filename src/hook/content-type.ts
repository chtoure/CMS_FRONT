import { useQuery, useMutation } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { ContentType, RegisterContentType, UpdateContentType } from "../type/content-type";

const useGetContentType = (id: number) => {
  return useQuery({
    queryKey: ['content-type', id],
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
    mutationFn: async (contentType: UpdateContentType) => {
      return handleResponse<ContentType>(await api(`/contents`, {
        method: 'PUT',
        body: JSON.stringify(contentType)
      }));
    }
  });
};




export {
  useGetContentType,
  useRegisterContentType,
  useUpdateContentType,
  useGetContentTypes
}

