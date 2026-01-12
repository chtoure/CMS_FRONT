
import { useMutation, useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { AddRole, Role, roleFilter } from "../type/role";
import type { RoleUpdate } from "../type/role";
import type { Permission } from "../type/permission";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";


// Hook get role list Avec pagination
export const useGetRoles = (filter: Ref<roleFilter> | roleFilter) => {
  return useQuery({
    queryKey: ["roles",filter],
    queryFn:async () => {
      const params = unref(filter)
      const query = new URLSearchParams()

      if (params.archive) query.append('archive', params.archive.toString())
      if (params.page) query.append('page', params.page.toString())
      if (params.limit) query.append('limit', params.limit.toString())

      console.log(query.toString());


      const response = await api(`/roles?${query.toString()}`)

      return handleResponse<Pagination<Role>>(response)
    }
  })
}


// Hook get role list sans pagination
export const useGetRolesNoPaginate = () => {
  return useQuery({
    queryKey: ["rolesNoPaginate"],
    queryFn:async () => {
      return handleResponse<Role[]>(await api("/rolesNoPaginate"));
    }
  })
}


// Hook update role
export const useUpdateRole = () => {
  return useMutation ({
    mutationFn: async (dataRoles:{
      dataRole : RoleUpdate;
      id: number
    })=> {
      return handleResponse<Role>(await api(`/roles/${dataRoles.id}`, {
        method: 'PUT',
        body: JSON.stringify(dataRoles.dataRole)
      }));
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
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/archiveRoles/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
  });
};


// Restorer un role
export const useRestoreRole = () => {
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/restoreRoles/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
  });
};
