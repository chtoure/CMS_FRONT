import router from "../router";
type CliquableAction = 'NAVIGATE_TO' | 'SHOW_ALERT' | 'OPEN_MODAL';


type NavigateAction = { action: 'NAVIGATE_TO'; action_params: { url: string } };
type AlertAction = { action: 'SHOW_ALERT'; action_params: { message: string } };
type ModalAction = { action: 'OPEN_MODAL'; action_params: { modalId: string } };

type Cliquable = NavigateAction | AlertAction | ModalAction;




export const executeAction = (cliquable: Cliquable) => {
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
      default:
        console.warn(`Action ${action} non reconnue`);
        break;
    }
};
