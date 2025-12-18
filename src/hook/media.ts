import { useMutation, useQuery } from "@tanstack/vue-query";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

const useCreateMedia = () => {

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post(`${BASE_URL}/media`, formData);
      return response.data;
    },
  })

}

export { useCreateMedia }
