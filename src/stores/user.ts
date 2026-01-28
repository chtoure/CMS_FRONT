
import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserProfile } from "../type/user";



export const userStore = defineStore("user", () => {

    const userInfo = ref< UserProfile | null>(null);

    const setUserInfo = (info: UserProfile | null) => {
        userInfo.value = info;
    }
    return {
        userInfo,
        setUserInfo
    }
}, {persist: true});
