

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Permission, permsFilter } from "../type/permission";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";



const buildQueryParams = (filter?: Ref<permsFilter> | permsFilter) => {
  const params = unref(filter)
  const query = new URLSearchParams()

  if (params?.archive) query.append('archive', params.archive.toString())
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  return query.toString()
}




// Hook get permission list avec pagination
export const useGetPermissions = (filter?: Ref<permsFilter> | permsFilter) => {
  return useQuery({
    queryKey: ["permissions",filter],
    queryFn:async () => {
      const query = buildQueryParams(filter)
      const response = await api(`/permissions?${query}`)

      return handleResponse<Pagination<Permission>>(response)
    }
  })
}




// Archiver un permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/archivePermissions/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    }
  });
};


// Restorer un permission
export const useRestorePermission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/restorePermissions/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    }
  });
};
