

import { useMutation, useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Permission, permsFilter } from "../type/permission";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";


// Hook get permission list avec pagination
export const useGetPermissions = (filter: Ref<permsFilter> | permsFilter) => {
  return useQuery({
    queryKey: ["permissions",filter],
    queryFn:async () => {
      const params = unref(filter)
      const query = new URLSearchParams()

      if (params.archive) query.append('archive', params.archive.toString())
      if (params.page) query.append('page', params.page.toString())
      if (params.limit) query.append('limit', params.limit.toString())

      console.log(query.toString());


      const response = await api(`/permissions?${query.toString()}`)

      return handleResponse<Pagination<Permission>>(response)
    }
  })
}


// Hook get role list sans pagination
export const useGetPermissionsNoPaginate = () => {
  return useQuery({
    queryKey: ["permissionsNoPaginate"],
    queryFn:async () => {
      return handleResponse<Permission[]>(await api("/permissionsNoPaginate"));
    }
  })
}




// Archiver un permission
export const useDeletePermission = () => {
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/archivePermissions/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
  });
};


// Restorer un permission
export const useRestorePermission = () => {
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/restorePermissions/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
  });
};
