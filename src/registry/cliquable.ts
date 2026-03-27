import type { CliquableAction } from '../type/component';
import router from '../router';

export const executeAction = (cliquable: CliquableAction) => {
  if (!cliquable || !cliquable.action) return;
  const { action, action_params } = cliquable;

  switch (action) {
    case 'NAVIGATE_TO': {
      const url = action_params?.url;
      if (url) {
        router.push(url).catch(err => {
          // Ignore NavigationDuplicated errors
          if (err?.name !== 'NavigationDuplicated') console.warn('Navigation error:', err);
        });
      } else {
        console.warn('[executeAction] NAVIGATE_TO: url manquante');
      }
      break;
    }
    case 'SHOW_ALERT':
      alert(action_params?.message ?? '');
      break;
    case 'OPEN_MODAL':
      console.log('Open modal:', action_params?.modalId);
      break;
    case 'TOGGLE_VISIBILITY':
      // Géré directement dans le composant (ButtonBuilder etc.) via builderState.toggleVisibility
      console.log('Toggle visibility (géré par le composant):', action_params?.targetId);
      break;
    default:
      console.warn(`Action "${(action as string)}" non reconnue`);
      break;
  }
};
