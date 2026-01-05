import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import axios from "axios";
import type { Collection, Variable, VariableType } from "../type/Variable";
import { toValue, type MaybeRefOrGetter } from "vue";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const useGetCollections = (searchQuery?: MaybeRefOrGetter<string | undefined>) => {
  return useQuery({
    queryKey: ['collections', toValue(searchQuery)],
    queryFn: async () => {
      const search = toValue(searchQuery) || "";
      const response = await axios.get<Collection[]>(`${BASE_URL}/collections?search=${search}`);
      return response.data;
    }
  });
};

// const useCreateCollection = () => {
//   return useMutation({
//     mutationFn: async (payload: { name: string; type: VariableType }) => {
//       const response = await axios.post<Collection>(`${BASE_URL}/collections`, payload);
//       return response.data;
//     }
//   });
// };

// const useDeleteCollection = () => {
//   return useMutation({
//     mutationFn: async (id: number) => {
//       const response = await axios.delete(`${BASE_URL}/collections/${id}`);
//       return response.data;
//     }
//   });
// };

const useCreateVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; value: string; collectionId: number }) => {
      const response = await axios.post<Variable>(`${BASE_URL}/variables`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', 'collections'] });
    }
  });
};

const useUpdateVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({data, id}: {data:Partial<Variable> ; id: number }) => {
      const response = await axios.put<Variable>(`${BASE_URL}/variables/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', 'collections'] });
    }
  });
};

const useDeleteVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: number | number[]) => {
      if (Array.isArray(payload)) {
        const response = await axios.delete(`${BASE_URL}/variables`, {
          data: { ids: payload }
        });
        return response.data;
      }
      const response = await axios.delete(`${BASE_URL}/variables/${payload}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', 'collections'] });
    }
  });
};

const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; type: VariableType }) => {
      const response = await axios.post<Collection>(`${BASE_URL}/collections`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    }
  });
};


const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`${BASE_URL}/collections/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    }
  });
};

export {
  useGetCollections,
  useCreateCollection,
  useDeleteCollection,
  useCreateVariable,
  useUpdateVariable,
  useDeleteVariable
};
