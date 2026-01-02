import { userStore } from '../stores/user';
import type { Router } from 'vue-router';

export function setupAuthGuard(router: Router) {
  // Navigation Guards Globaux
  router.beforeEach((to, from, next) => {
    // Récupère le store utilisateur
    const store = userStore();

    // Vérifie les méta-données de la route
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

    // État de l'utilisateur
    const isAuthenticated = !!store.userInfo;

    // VERIFICATION : Doit-il changer son mot de passe ?
    // On vérifie s'il est connecté ET que isLoggedIn est false (première connexion)
    const needsPasswordChange = isAuthenticated && store.userInfo?.isLoggedIn === false;

    // 1. Si la page demande d'être connecté et que l'utilisateur ne l'est pas
    if (requiresAuth && !isAuthenticated) {
      return next({ name: 'auth.login' });
    }

    // 2. LOGIQUE FORCÉE : Première connexion (Changement de mot de passe obligatoire)
    if (isAuthenticated && needsPasswordChange) {
      // Si l'utilisateur tente d'aller ailleurs que sur la page de changement de mot de passe
      if (to.name !== 'auth.change-password') {
        return next({ name: 'auth.change-password' });
      }
      // S'il va sur 'auth.change-password', on laisse passer
      return next();
    }

    // 3. CONNECTÉ ET MDP DÉJÀ CHANGÉ (islogin === true)
    // S'il essaie d'aller sur 'change-password' alors qu'il n'en a plus besoin
    if (isAuthenticated && !needsPasswordChange && to.name === 'auth.change-password') {
      return next({ name: 'admin.dashboard' });
    }

    // 4. Si l'utilisateur est connecté, il n'a rien à faire sur les pages "Guest" (Login/Register)
    if (requiresGuest && isAuthenticated) {
      if (from.name) {
        return next(false);
      } else {
        return next({ name: 'admin.dashboard' });
      }
    }

    // Dans tous les autres cas, on laisse passer
    next();
  });
}
