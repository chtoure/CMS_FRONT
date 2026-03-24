
import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserProfile } from "../type/user";
import type { Permission } from "../type/permission";



export const userStore = defineStore("user", () => {

    const userInfo = ref< UserProfile | null>(null);
    const userPermissions = ref< Permission[] | null>(null);

    const setUserInfo = (info: UserProfile | null, permisions: Permission[]) => {
        userInfo.value = info;
        userPermissions.value = permisions;
        console.log("user  Permissionssssssssssss",userPermissions.value);

        userPermissions.value.forEach(p=> console.log(p.name))
        
    }
    return {
        userInfo,
        setUserInfo,
        userPermissions
    }
}, {persist: true});
