

import { useMutation, useQuery } from "@tanstack/vue-query";
import api, { handleResponse } from "../api/fetchConfig";
import type { LoginCredentials, AuthResponse, UserProfile, AddUserData, ChangePasswordData,UpdateProfileData, VerifyCode } from "../type/user";



// export const useLogin = () => {
//   return useMutation({
//     mutationFn: async (credentials: LoginCredentials) => {
//       // On envoie email et password
//       const response = await api.post<AuthResponse>("/login", credentials);
//       return response.data;
//     }
//   });
// };


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



// export const useLogout = () => {
//   return useMutation({
//     mutationFn: async () => {
//       await api.post("/logout");

//       return true;
//     }
//   });
// }


//Hook personnalisé pour la mutation de déconnexion
export const useLogout = () =>{
  return useMutation({
    mutationFn: async () =>{
      await api('/logout', {
      method:'POST'
      });

      return true;
    }
  })
}


// export const useUpdateProfile = () => {
//   return useMutation({
//     mutationFn: async (userData:
//       {
//         profileData : UpdateProfileData;
//         id: number
//       }
//     ) => {
//       const response = await api.put<UpdateProfileResponse>(`/users/${userData.id}`, userData.profileData);
//       return response.data;
//     }
//   });
// }


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


// export const useGetUsers = () => {
//   return useQuery({
//     queryKey: ["users"],
//     queryFn: async () => {
//       const response = await api.get<UserProfile[]>("/users");
//       return response.data;
//     }
//   });
// }



// Hook get users list
export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn:async () => {
      return handleResponse<UserProfile[]>(await api("/users"));
    }
  })
}



// export const useAddUser = () => {
//   return useMutation({
//     mutationFn: async (newUser: AddUserData) => {
//       const response = await api.post<AddUserResponse>("/register", newUser);
//       return response.data;
//     }
//   });
// }


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



// export const useChangePassword = () => {
//   return useMutation({
//     mutationFn: async (data: { passwordData: ChangePasswordData; id: number }) => {
//       const response = await api.put<ChangePasswordResponse>(`/change-password/${data.id}`, data.passwordData);
//       return response.data;
//     }
//   });
// }


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


// Hook forgot password(Send code to email)
// export const useForgotPassword = () => {
//   return useMutation({
//     mutationFn: async (toEmail: string) => {
//       const response = await api.post("/send-verification-code", { toEmail });
//       return response.data;
//     }
//   });
// }


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



// export const useVerifyCode = () => {
//   return useMutation({
//     mutationFn: async (data:{id: number, code: string}) => {
//       const response = await api.post(`/verify-code/${data.id}`, { code: data.code });
//       return response.data;
//     }
//   });
// }



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


// export const useResetPassword = () => {
//   return useMutation({
//     mutationFn: async (data: { resetData: LoginCredentials, id: number }) => {
//       const response = await api.post<AuthResponse>(`/reset-password/${data.id}`, data.resetData);
//       return response.data;
//     }
//   });
// }


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
