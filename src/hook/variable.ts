import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Collection, Variable, VariableType } from "../type/Variable";
import { toValue, type MaybeRefOrGetter } from "vue";
import api, { handleResponse } from "../api/fetchConfig";

const useGetCollections = (searchQuery?: MaybeRefOrGetter<string | undefined>) => {
  return useQuery({
    queryKey: ['collections', toValue(searchQuery)],
    queryFn: async () => {
      const search = toValue(searchQuery) || "";
      return handleResponse<Collection[]>(await api(`/collections?search=${search}`));
    }
  });
};

const useGetVariables = (searchQuery?: MaybeRefOrGetter<string | undefined>) => {
  return useQuery({
    queryKey: ['variables', toValue(searchQuery)],
    queryFn: async () => {
      const search = toValue(searchQuery) || "";
      return handleResponse<Variable[]>(await api(`/variables?search=${search}`));
    }
  });
};

const useCreateVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; value: string; collectionId: number }) => {
      return handleResponse<Variable>(await api(`/variables`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }));
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
      return handleResponse<Variable>(await api(`/variables/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }));
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
        return handleResponse(await api(`/variables`, {
          method: 'DELETE',
          body: JSON.stringify({ ids: payload })
        }));
      }
      return handleResponse(await api(`/variables/${payload}`, {
        method: 'DELETE'
      }));
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
      return handleResponse<Collection>(await api(`/collections`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }));
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
      return handleResponse(await api(`/collections/${id}`, {
        method: 'DELETE'
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    }
  });
};

export {
  useGetCollections,
  useGetVariables,
  useCreateCollection,
  useDeleteCollection,
  useCreateVariable,
  useUpdateVariable,
  useDeleteVariable
};
