import type { CliquableAction } from '../type/component';
import router from '../router';

export const executeAction = (cliquable: CliquableAction) => {
  const { action, action_params } = cliquable;

    switch (action) {
      case 'NAVIGATE_TO':
        router.push(action_params.url);
        break;
      case 'SHOW_ALERT':
        alert(action_params.message);
        break;
      case 'OPEN_MODAL':
        console.log("Open:", action_params.modalId);
        break;
      case 'TOGGLE_VISIBILITY':
        console.log("Toggle visibility in generic executor (no-op here, handled in builder component):", action_params.targetId);
        break;
      case 'TOGGLE_VISIBILITY':
        console.log("Toggle visibility in generic executor (no-op here, handled in builder component):", action_params.targetId);
        break;
      default:
        console.warn(`Action ${(action as string)} non reconnue`);
        console.warn(`Action ${(action as string)} non reconnue`);
        break;
    }
};
