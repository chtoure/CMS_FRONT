
import { useMutation, useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { AddRole, Role } from "../type/role";
import type { RoleUpdate } from "../type/role";
import type { Permission } from "../type/permission";


// Hook get role list
export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn:async () => {
      return handleResponse<Role[]>(await api("/roles"));
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

