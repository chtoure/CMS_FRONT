
import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserProfile } from "../type/user";
import type { Permission } from "../type/permission";



export const userStore = defineStore("user", () => {

    const userInfo = ref<UserProfile | null>(null);
    const userPermissions = ref<Permission[] | null>(null);

    // Tokens pour le fallback Bearer (si cookies bloqués en HTTP cross-site)
    // Initialisés depuis le localStorage pour survivre aux rechargements de page
    const accessToken = ref<string | null>(localStorage.getItem('_at'));
    const refreshToken = ref<string | null>(localStorage.getItem('_rt'));

    const setUserInfo = (info: UserProfile | null, permisions: Permission[]) => {
        userInfo.value = info;
        userPermissions.value = permisions;
    }

    // Sauvegarde les tokens après login / register / refresh
    const setTokens = (access: string | null, refresh: string | null) => {
        accessToken.value = access;
        refreshToken.value = refresh;
        if (access) localStorage.setItem('_at', access);
        else localStorage.removeItem('_at');
        if (refresh) localStorage.setItem('_rt', refresh);
        else localStorage.removeItem('_rt');
    };

    // Nettoyage complet lors du logout ou d'une session expirée
    const clearTokens = () => {
        setTokens(null, null);
    };

    return {
        userInfo,
        setUserInfo,
        userPermissions,
        accessToken,
        refreshToken,
        setTokens,
        clearTokens,
    }
}, {persist: true});
