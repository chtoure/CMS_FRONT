
import axios from "axios";
import router from "../router";
import { userStore } from "../stores/user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // INDISPENSABLE pour les cookies HTTP-only
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 ET que ce n'est pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {

      console.log("oui");


      // On évite de boucler à l'infini
      if (originalRequest.url.includes('/refresh-token') || originalRequest.url.includes('/login')) {
         return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // On appelle l'URL de refresh au Backend
        // Le navigateur enverra automatiquement le cookie refresh_token
        await api.post('/refresh-token');

        // Si ça réussit, le serveur a renvoyé de nouveaux cookies
        // On rejoue la requête initiale qui avait échoué
        return api(originalRequest);

      } catch (refreshError) {
        // Si le refresh échoue (Refresh Token expiré aussi)
        const storeUser = userStore();
        storeUser.setUserInfo(null);
        router.push({ name: 'auth.login' });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
