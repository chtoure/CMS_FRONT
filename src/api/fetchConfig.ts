
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




import { userStore } from "@/stores/user";
import router from "../router";
import { ApiError, type ApiErrorData } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;



export async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: ApiErrorData & T;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {} as ApiErrorData & T;
  }

  if (!response.ok) {
    // Logique de message par défaut intelligente
    const errorMessage =
      data.error ||
      data.message ||
      (data.erreurs && data.erreurs.length > 0 ? data.erreurs[0] : null) ||
      `Erreur serveur (${response.status})`;

    throw new ApiError(errorMessage, data, response.status);
  }

  return data;
}


// export async function handleResponse<T>(response: Response): Promise<T> {
//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || data.error || "Une erreur est survenue");
//   }

//   return data;
// }

/**
 * Wrapper API personnalisé — Stratégie hybride Cookie + Bearer Token
 * - Cookie HttpOnly : utilisé automatiquement si HTTPS (credentials: "include")
 * - Bearer Token   : fallback automatique si cookies bloqués (HTTP cross-site)
 */
const api = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Gestion dynamique du Content-Type
  const isFormData = options.body instanceof FormData;

  // Fallback Bearer : injecte le header Authorization si un token est stocké
  const store = userStore();
  const bearerToken = store.accessToken;
  const bearerHeader: Record<string, string> = bearerToken
    ? { 'Authorization': `Bearer ${bearerToken}` }
    : {};

  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...bearerHeader,      // Header Bearer injecté si cookie absent
      ...options.headers,   // Les headers de l'appelant ont toujours la priorité
    },
    credentials: "include", // Toujours tenter les cookies (fonctionne si HTTPS)
  };

  const response = await fetch(url, defaultOptions);

  // Interception 401 → tentative de refresh automatique
  if (response.status === 401) {
    if (endpoint.includes('/refresh-token') || endpoint.includes('/login')) {
      return response;
    }

    try {
      // Fallback Bearer : envoie le refreshToken dans le body si cookie bloqué
      const storedRefreshToken = store.refreshToken;
      const refreshBody = storedRefreshToken
        ? JSON.stringify({ refreshToken: storedRefreshToken })
        : undefined;

      const refreshResponse = await fetch(`${BASE_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: refreshBody ? { 'Content-Type': 'application/json' } : {},
        body: refreshBody,
      });


      if (refreshResponse.ok) {
        // Si le backend renvoie un nouveau accessToken dans le JSON → le stocker
        try {
          const refreshData = await refreshResponse.clone().json();
          if (refreshData.accessToken) {
            store.setTokens(refreshData.accessToken, store.refreshToken);
            // Mettre à jour le header Bearer pour rejouer la requête
            if (defaultOptions.headers && typeof defaultOptions.headers === 'object') {
              (defaultOptions.headers as Record<string, string>)['Authorization'] =
                `Bearer ${refreshData.accessToken}`;
            }
          }
        } catch { /* Mode cookie-only : pas de token dans le body, c'est normal */ }

        // Rejeu de la requête originale avec les nouveaux credentials
        return await fetch(url, defaultOptions);
      } else {
        throw new Error("Refresh token expiré");
      }
    } catch (error) {
      const storeUser = userStore();
      storeUser.setUserInfo(null, []);
      storeUser.clearTokens(); // Nettoyage des tokens Bearer

      // On ne redirige vers le login que si la page actuelle l'exige
      const requiresAuth = router.currentRoute.value.matched.some(record => record.meta.requiresAuth);
      if (requiresAuth) {
        router.push({ name: 'auth.login' });
      }

      return Promise.reject(error);
    }
  }

  return response;
};

export default api;
