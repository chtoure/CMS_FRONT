

import { useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Permission } from "../type/permission";


// Hook get role list
export const useGetPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn:async () => {
      return handleResponse<Permission[]>(await api("/permissions"));
    }
  })
}
