import { useQuery } from "@tanstack/vue-query";
import { type AnyComponent, type ContainerStyles, type InteractiveStyles, type StaticStyles } from "../type/component";
import api, { handleResponse } from "../api/fetchConfig";
import type { Pagination } from "../type/pagination";
import type { BlocTemplate } from "../type/bloc-template";
import { INJECTED_COMPONENTS } from "../lib/constants/components";

type AnyStyle = ContainerStyles | StaticStyles | InteractiveStyles;

const useGetComponents = () => {
  return useQuery({
    queryKey: ['builder-components'],
    queryFn: async () => {
      const response = await handleResponse<Pagination<AnyComponent>>(
        await api(`/components`, {
          method: 'GET'
        })
      );

      // Injection dynamique des composants absents (en attendant le backend)
      if (response && response.results) {
        INJECTED_COMPONENTS.forEach(injected => {
          const exists = response.results.some(c => c.tag === injected.tag);
          if (!exists) {
            response.results.push(injected);
          }
        });
      }

      return response;
    }
  });
};

const useGetBlocTemplatesComponentCustom = () => {
  return useQuery({
    queryKey: ['builder-bloc-templates-custom'],
    queryFn: async () => {
      return handleResponse<BlocTemplate[]>(
        await api(`/bloc-templates-components-custom`, {
          method: 'GET'
        })
      );
    }
  });
};

export {
  useGetComponents,
  useGetBlocTemplatesComponentCustom
}
