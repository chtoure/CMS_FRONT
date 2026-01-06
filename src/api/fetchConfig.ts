
// import axios from "axios";
// import router from "../router";
// import { userStore } from "../stores/user";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
//   withCredentials: true, // INDISPENSABLE pour les cookies HTTP-only
// });


// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Si erreur 401 ET que ce n'est pas déjà une tentative de refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {

//       console.log("oui");


//       // On évite de boucler à l'infini
//       if (originalRequest.url.includes('/refresh-token') || originalRequest.url.includes('/login')) {
//          return Promise.reject(error);
//       }

//       originalRequest._retry = true;

//       try {
//         // On appelle l'URL de refresh au Backend
//         // Le navigateur enverra automatiquement le cookie refresh_token
//         await api.post('/refresh-token');

//         // Si ça réussit, le serveur a renvoyé de nouveaux cookies
//         // On rejoue la requête initiale qui avait échoué
//         return api(originalRequest);

//       } catch (refreshError) {
//         // Si le refresh échoue (Refresh Token expiré aussi)
//         const storeUser = userStore();
//         storeUser.setUserInfo(null);
//         router.push({ name: 'auth.login' });
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;




import router from "../router";
import { userStore } from "../stores/user";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Gère la réponse JSON et les erreurs du Backend
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    // On récupère le message d'erreur envoyé par ton Backend (Joi, etc.)
    throw new Error(data.message || data.error || "Une erreur est survenue");
  }

  return data;
}

/**
 * Wrapper API personnalisé
 */
const api = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Gestion dynamique du Content-Type
  // Si on envoie du FormData (pour les images), on laisse le navigateur gérer le header
  const isFormData = options.body instanceof FormData;

  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    credentials: "include",
  };

  const response = await fetch(url, defaultOptions);

  // Interception 401 (Refresh Token)
  if (response.status === 401) {
    if (endpoint.includes('/refresh-token') || endpoint.includes('/login')) {
      return response;
    }

    try {
      const refreshResponse = await fetch(`${BASE_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        // Rejeu de la requête
        return await fetch(url, defaultOptions);
      } else {
        throw new Error("Refresh token expiré");
      }
    } catch (error) {
      const storeUser = userStore();
      storeUser.setUserInfo(null);
      router.push({ name: 'auth.login' });
      return Promise.reject(error);
    }
  }

  return response;
};

export default api;
