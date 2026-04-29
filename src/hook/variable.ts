import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Collection, Variable, VariableType } from "../type/variable";
import { toValue, type MaybeRefOrGetter, computed } from "vue";
import type { VariableProperty } from "../type/component";
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
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
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
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
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
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
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

/**
 * Hook pour résoudre les valeurs des variables.
 * Utile pour le rendu des composants qui doivent afficher la valeur réelle (ex: couleur hex)
 * au lieu de la clé de la variable.
 */
const useVariableResolver = () => {
  const { data: variables, isLoading } = useGetVariables();

  const variableMap = computed(() => {
    if (!variables.value) return Object.create(null) as Record<string, string>;
    return variables.value.reduce<Record<string, string>>((acc, v) => {
      // Indexer uniquement par ID
      acc[String(v.id)] = v.value;
      return acc;
    }, {});
  });

  const resolveValue = <T>(prop: VariableProperty<T> | T | undefined): T | string | undefined => {
    if (!prop) return undefined;

    // Si c'est une VariableProperty
    if (typeof prop === 'object' && prop !== null && 'type' in prop && 'value' in prop) {
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const varProp = prop as VariableProperty<any>;
       if (varProp.type === 'variable') {
         // lookup value inside the map
         return (variableMap.value[String(varProp.value)] ?? varProp.value) as T | string;
       }
       // Récursion si la valeur interne est elle-même un wrapper (ex: { type: 'static', value: { type: 'variable' } })
       if (typeof varProp.value === 'object' && varProp.value !== null && 'type' in varProp.value) {
         return resolveValue(varProp.value);
       }
       return varProp.value;
    }
    
    // Valeur legacy ou simple
    return prop as T;
  };

  return { resolveValue, isLoading };
};

export {
  useGetCollections,
  useGetVariables,
  useCreateCollection,
  useDeleteCollection,
  useCreateVariable,
  useUpdateVariable,
  useDeleteVariable,
  useVariableResolver
};
