

import { useMutation, useQuery } from "@tanstack/vue-query";
import { AxiosError } from "axios";
import api from "../api/axiosConfig";
import type { LoginCredentials, AuthResponse, UserProfile } from "../type/user";
import type { UpdateProfileData, UpdateProfileResponse } from "../type/user";



// Hook personnalisé pour la mutation de connexion
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // On envoie email et password
      const response = await api.post<AuthResponse>("/login", credentials);
      return response.data;
    }
  });
};


//Hook personnalisé pour la mutation de déconnexion
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await api.post("/logout");

      // Avec un statut 204, response.data sera vide.
      // On retourne simplement true pour indiquer le succès.
      return true;
    }
  });
}


// Hook update profil utilisateur
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (userData:
      {
        profileData : UpdateProfileData;
        id: number
      }
    ) => {
      const response = await api.put<UpdateProfileResponse>(`/users/${userData.id}`, userData.profileData);
      return response.data;
    }
  });
}


// Hook get users list
export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<UserProfile[]>("/users");
      return response.data;
    }
  });
}
