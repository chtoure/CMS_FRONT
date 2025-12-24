import { useMutation, useQuery } from "@tanstack/vue-query";
import { type Ref, unref } from "vue";
import axios from "axios";
import type { Media } from "../type/media";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";


const useCreateMedia = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<Media>(`${BASE_URL}/media`, formData);
      return response.data;
    },
  })
}


const useGetMedia = (id : number) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: async ()=> {
      const response = await axios.get<Media>(`${BASE_URL}/media/${id}`);
      return response.data;
    },
    staleTime: 1000 * 60,
   })
}


const useGetMediaList = (filter : Ref<{type : 'image' | 'video' | null | undefined}> | {type : 'image' | 'video' | null | undefined}) =>{
  return useQuery({
    queryKey: ['medias', filter],
    queryFn: async () => {
      const type = unref(filter).type;
      const response = await axios.get<Media[]>(`${BASE_URL}/medias`, {
        params: type ? { type } : {}
      });
      return response.data;
    }
  })
}

const useDeleteMedia = () => {
  return useMutation({
    mutationFn: async (payload: number | number[]) => {
      if (Array.isArray(payload)) {
        const response = await axios.delete(`${BASE_URL}/media`, {
          data: { ids: payload }
        });
        return response.data;
      } 
      const response = await axios.delete(`${BASE_URL}/media/${payload}`);
      return response.data;
    },
  });
};

export { useCreateMedia, useGetMedia, useGetMediaList, useDeleteMedia }
