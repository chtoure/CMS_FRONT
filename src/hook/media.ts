import { useMutation, useQuery } from "@tanstack/vue-query";
import axios from "axios";
import type { Media } from "../type/media";
import api from "../api/axiosConfig";


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


const useGetMediaList = () =>{
  return useQuery({
    queryKey: ['medias'],
    queryFn: async () => {
      const response = await api.get<Media[]>('/medias');
      return response.data;
    }
  })
}


export { useCreateMedia, useGetMedia, useGetMediaList }
