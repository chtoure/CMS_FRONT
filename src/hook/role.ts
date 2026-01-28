
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { AddRole, Role, roleFilter } from "../type/role";
import type { RoleUpdate } from "../type/role";
import type { Permission } from "../type/permission";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";



const buildQueryParams = (filter?: Ref<roleFilter> | roleFilter) => {
  const params = unref(filter)
  const query = new URLSearchParams()

  if (params?.archive) query.append('archive', params.archive.toString())
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  return query.toString()
}



export const useGetRoles = (filter?: Ref<roleFilter> | roleFilter) => {
  return useQuery({
    queryKey: ["roles",filter],
    queryFn:async () => {
      const query = buildQueryParams(filter)
      const response = await api(`/roles?${query}`)

      return handleResponse<Pagination<Role>>(response)
    }
  })
}




// Hook update role
export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  return useMutation ({
    mutationFn: async (dataRoles:{
      dataRole : RoleUpdate;
      id: number
    })=> {
      return handleResponse<Role>(await api(`/roles/${dataRoles.id}`, {
        method: 'PUT',
        body: JSON.stringify(dataRoles.dataRole)
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    }
  })
}


// Hook Add Role
export const useAddRole = () => {
  return useMutation({
    mutationFn:async (newRole: AddRole) => {
      return handleResponse<Role>(await api("/roles", {
        method: 'POST',
        body: JSON.stringify(newRole)
      }));
    }
  })
}


// Hook get Permissions d'un role
export const useGetPermissionsRole = (id : number) => {
  return useQuery({
    queryKey: ['permissionsRole', id],
    queryFn: async ()=> {
      return handleResponse<Permission[]>(
        await api(`/permissionsRole/${id}`)
      );
    },
   })
}



// Archiver un role
export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/archiveRoles/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    }
  });
};


// Restorer un role
export const useRestoreRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/restoreRoles/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    }
  });
};
