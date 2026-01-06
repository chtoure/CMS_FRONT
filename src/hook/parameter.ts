import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Parameter, UpdateParameterPayload } from "../type/parameter";

import api, { handleResponse } from "../api/fetchConfig";

const useGetParameters = () => {
  return useQuery({
    queryKey: ['parameters'],
    queryFn: async () => {
      return handleResponse<Parameter>(await api('/parameters'));
    }
  });
};

const useUpdateParameters = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateParameterPayload) => {
      return handleResponse<Parameter>(await api('/parameters', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parameters'] })
  });
};
export {
  useGetParameters,
  useUpdateParameters
};
