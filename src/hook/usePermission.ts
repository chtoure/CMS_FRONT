import { computed } from 'vue';
import { userStore } from '../stores/user';

export function usePermission() {
  const store = userStore();

  const userPermissions = computed(() => {
    return store.userPermissions?.map(p => p.name) || [];
  });

  console.log("user permissions", userPermissions.value);
  

  const hasPermission = (permissionName: string | string[]) => {
    if (!permissionName) return true;
    
    const permissionsToCheck = Array.isArray(permissionName) ? permissionName : [permissionName];

  
    console.log("valeurs", permissionsToCheck, userPermissions.value );
    
    console.log('a la permission',  permissionsToCheck.some(p => userPermissions.value.includes(p)));
    
    return permissionsToCheck.some(p => userPermissions.value.includes(p));
  };

  return {
    hasPermission,
    userPermissions
  };
}
