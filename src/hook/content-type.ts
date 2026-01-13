import { useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { ContentType } from "../type/content-type";

const useGetContentType = () => {
  return useQuery({
    queryKey: ['content-types'],
    queryFn: async () => {
      return handleResponse<ContentType>(await api(`/mock/content-type`));
    }
  });
};

export {
  useGetContentType
}

