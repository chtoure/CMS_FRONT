import type { Router } from 'vue-router';
import { usePermission } from '../hook/usePermission';

function setupPermissionGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const { hasPermission } = usePermission();

    console.log("permisions meta", to.meta.permissions);
    

    const requiredPermissions = to.meta.permissions as string | string[] | undefined;

    if (requiredPermissions && !hasPermission(requiredPermissions)) {
      // Éviter la redirection infinie si on est déjà sur la page de destination
      // ou si on vient de là.
      if (to.name !== 'admin.dashboard') {
        return next({ name: 'admin.dashboard' });
      }
      
      // Si on est déjà bloqué sur le dashboard par manque de permission, 
      // on laisse passer cette fois pour éviter le crash, 
      // l'interface UI (v-permission) s'occupera de masquer les éléments.
      return next();
    }

    next();
  });
}

export {
  setupPermissionGuard
}
