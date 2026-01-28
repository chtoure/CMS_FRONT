

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { LoginCredentials, AuthResponse, UserProfile, AddUserData, ChangePasswordData,UpdateProfileData, VerifyCode, userFilter } from "../type/user";
import { unref, type Ref } from "vue";
import type { Pagination } from "../type/pagination";



const buildQueryParams = (filter?: Ref<userFilter> | userFilter) => {
  const params = unref(filter);
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) query.append("search", params.search.toString());
  if (params?.archive) query.append("archive", params.archive.toString());
  return query.toString();
};


// Hook get users list
export const useGetUsers = (filter?: Ref<userFilter> | userFilter) => {
  return useQuery({
    queryKey: ["users",filter],
    queryFn:async () => {
      const query = buildQueryParams(filter)
      const response = await api(`/users?${query}`)

      return handleResponse<Pagination<UserProfile>>(response)
    }
  })
}


// Hook personnalisé pour la mutation de connexion
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return handleResponse<AuthResponse>(await api('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }));
    }
  })
}



//Hook personnalisé pour la mutation de déconnexion
export const useLogout = () =>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>{
      await api('/logout', {
      method:'POST'
      });
      return true;
    },
    onSuccess(){
      queryClient.clear();
    },
    onError(){
      queryClient.clear();
    }
  })
}



// Hook update profil utilisateur
export const useUpdateProfile = () => {
  return useMutation ({
    mutationFn: async (userData:{
      profileData : UpdateProfileData;
      id: number
    })=> {
      return handleResponse<AuthResponse>(await api(`/users/${userData.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData.profileData)
      }));
    }
  })
}




// Hook get users list
// export const useGetUsers = (filter: Ref<userFilter> | userFilter) => {
//   return useQuery({
//     queryKey: ["users",filter],
//     queryFn:async () => {
//       const params = unref(filter)
//       const query = new URLSearchParams()

//       if (params.archive) query.append('archive', params.archive.toString())
//       if (params.page) query.append('page', params.page.toString())
//       if (params.limit) query.append('limit', params.limit.toString())

//       console.log(query.toString());


//       const response = await api(`/users?${query.toString()}`)

//       return handleResponse<Pagination<UserProfile>>(response)
//     }
//   })
// }




// Hook addUser
export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:async (newUser: AddUserData) => {
      return handleResponse<AuthResponse>(await api("/register", {
        method: 'POST',
        body: JSON.stringify(newUser)
      }));
    },
    onSuccess(){
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  })
}



// Hook change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { passwordData: ChangePasswordData; id: number }) => {
      return handleResponse<AuthResponse>(await api(`/change-password/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.passwordData)
      }));
    }
  })
}


//  Hook forgot password(Send code to email)
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (toEmail: string) => {
      return handleResponse<AuthResponse>(await api("/send-verification-code", {
        method: 'POST',
        body: JSON.stringify({toEmail})
      }));
    }
  });
}





// Hook verify code of forgot password
export  const useVerifyCode = () => {
  return useMutation({
    mutationFn: async (data:{id: number, code: string}) => {
      return handleResponse<VerifyCode>(await api(`/verify-code/${data.id}`, {
        method: 'POST',
        body: JSON.stringify({ code: data.code })
      }));
    }
  })
}


// Hook reset password && login
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { resetData: LoginCredentials, id: number }) => {
      return handleResponse<AuthResponse>(await api(`/reset-password/${data.id}`, {
        method: 'POST',
        body: JSON.stringify(data.resetData)
      }));
    }
  })
}


// Archiver un user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/archiveUsers/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess(){
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
};


// Restorer un user
export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idUser: number) => {
      const response = await api(`/restoreUers/${idUser}`, {
        method: 'PUT',
      });
      return handleResponse(response);
    },
    onSuccess(){
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
};
