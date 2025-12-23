import { userStore } from '../stores/user';
import type {Router} from 'vue-router';

export function setupAuthGuard(router : Router) {

    // Navigation Guards Globaux
    router.beforeEach((to, from, next) => {

      // Récupère le store utilisateur
      const store = userStore();

      // Vérifie si l'url demandé (C'est a dire la route ou l'utilisateur vas )  ou l'un de ses parents a "requiresAuth"
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

      // Vérifie si l'url demandé (C'est a dire la route ou l'utilisateur vas )  ou l'un de ses parents a "requiresGuest"
      const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

      // si user existe isAuthenticated sera true, sinon false
      const isAuthenticated = !!store.userInfo;

      //Si la page demande d'être connecté (requiresAuth) ET que l'utilisateur ne l'est pas (!isAuthenticated),
      // on le bloque et on le renvoie de force vers la page de Login.
      if (requiresAuth && !isAuthenticated) {

        // Redirige vers login si on tente d'accéder à l'admin sans être connecté
        next({ name: 'auth.login' });

      }
      // si user est connecté il n'a rien a faire dans la page de login (requiresGuest)
      else if (requiresGuest && isAuthenticated) {

        // Si la page d'où il vient (from) a un nom (donc il était déjà sur le site)
        if (from.name) {
          // On annule la navigation : il reste sur sa page actuelle
          next(false);
        } else {
          // S'il n'y a pas de page précédente (ex: il vient de taper l'URL direct dans le navigateur)
          // On le renvoie vers le dashboard par défaut
          next({ name: 'admin.dashboard' });
        }

      } else {
        // Dans tous les autres cas (ex: 404), on laisse passer
        next();
      }
    });
}
