<<<<<<< HEAD
import router from "../router";
type CliquableAction = 'NAVIGATE_TO' | 'SHOW_ALERT' | 'OPEN_MODAL';
=======
import type { CliquableAction } from '../type/component';
>>>>>>> 7700cfe75fe36402794d4c48a9a2da39f049762c

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
      default:
        console.warn(`Action ${(action as string)} non reconnue`);
        break;
    }
};
