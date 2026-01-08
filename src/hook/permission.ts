

import { useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { Permission, permsFilter } from "../type/permission";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";


// Hook get role list avec pagination
export const useGetPermissions = (filter: Ref<permsFilter> | permsFilter) => {
  return useQuery({
    queryKey: ["permissions",filter],
    queryFn:async () => {
      const params = unref(filter)
      const query = new URLSearchParams()

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
