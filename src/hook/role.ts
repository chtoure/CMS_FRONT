
import { useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Role } from "../type/role";


// Hook get role list
export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn:async () => {
      return handleResponse<Role[]>(await api("/roles"));
    }
  })
}
