

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { LoginCredentials, AuthResponse, UserProfile, AddUserData, ChangePasswordData,UpdateProfileData, VerifyCode } from "../type/user";


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
export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn:async () => {
      return handleResponse<UserProfile[]>(await api("/users"));
    }
  })
}




// Hook addUser
export const useAddUser = () => {
  return useMutation({
    mutationFn:async (newUser: AddUserData) => {
      return handleResponse<AuthResponse>(await api("/register", {
        method: 'POST',
        body: JSON.stringify(newUser)
      }));
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
