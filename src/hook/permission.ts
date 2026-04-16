

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Permission, permsFilter } from "../type/permission";
import { computed, unref, type Ref } from "vue";
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
const useGetPermissions = (filter?: Ref<permsFilter> | permsFilter) => {
  return useQuery({
    queryKey: ["permissions",filter],
    queryFn:async () => {
      const query = buildQueryParams(filter)
      const response = await api(`/permissions?${query}`)

      return handleResponse<Pagination<Permission>>(response)
    }
  })
}


const useGetPermissionsByRoleId = (roleId: Ref<number> | number) => {
  return useQuery({
    // On s'assure que la clé est réactive si roleId change
    queryKey: computed(() => ["permissions", unref(roleId)]),
    
    queryFn: async () => {
      const id = unref(roleId)
      const response = await api(`/permissionsByRoleId/${id}`)
      return handleResponse<Permission[]>(response)
    },

    // CONDITION CRUCIALE : 
    // La requête ne s'exécute que si l'ID est différent de 0
    enabled: computed(() => unref(roleId) !== 0),
    
    // Optionnel : si l'ID est 0, on peut vouloir que 'data' soit un tableau vide
    // au lieu de 'undefined' pendant que la requête est désactivée.
    placeholderData: [] as Permission[] 
  })
}




// Archiver un permission
const useDeletePermission = () => {
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
const useRestorePermission = () => {
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

export {
  useGetPermissions,
  useGetPermissionsByRoleId,
  useDeletePermission,
  useRestorePermission
}


