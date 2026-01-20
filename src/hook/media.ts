import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { type Ref, unref } from "vue";
import type { Media, MediaFilter, SaveMediaPayload } from "../type/media";
import api, { handleResponse } from "../api/fetchConfig";
import type { Pagination } from "../type/pagination";


const useCreateMedia = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return handleResponse<Media>(
        await api(`/media`, {
          method: 'POST',
          body: formData
        })
      );
    },
  })
}


const useGetMedia = (id : number) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: async ()=> {
      return handleResponse<Media>(
        await api(`/media/${id}`)
      );
    },
    staleTime: 1000 * 60,
   })
}


const useGetMediaList = (filter?: Ref<MediaFilter> | MediaFilter) => {
  return useQuery({
    queryKey: ['medias', filter],
    queryFn: async () => {
      const params = unref(filter)
      const query = new URLSearchParams()

      if (params?.type) query.append('type', params.type)
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())

      console.log(query.toString());


      const response = await api(`/medias?${query.toString()}`)

      return handleResponse<Pagination<Media>>(response)
    }
  })
}

const useDeleteMedia = () => {
  return useMutation({
    mutationFn: async (payload: number | number[]) => {
      if (Array.isArray(payload)) {
        const response = await api(`/media`, {
          method: 'DELETE',
          body: JSON.stringify({ ids: payload })
        });
        return handleResponse(response);
      }
      const response = await api(`/media/${payload}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
  });
};

const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({payload, mediaId}: {payload: SaveMediaPayload, mediaId: number}) => {

      console.log('data', mediaId, payload);

      const response = await api(`/media/${mediaId}`, {
        method: 'PUT',
        body: JSON.stringify(payload.operations)
      });
      return handleResponse(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['media', variables] });
    },
    onError: (error) => {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  });
}



export {
  useCreateMedia,
  useGetMedia,
  useGetMediaList,
  useDeleteMedia,
  useUpdateMedia
}
