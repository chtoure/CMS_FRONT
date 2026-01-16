import { ApiError } from "../api/apiError";
import { showToast } from "./toast";


export function handleError(error: unknown) {
    if (error instanceof ApiError) {
    const { erreurs, error: serverError, message } = error.data;

    // 1. Priorité : Messages Joi (Tableau)
    if (erreurs && erreurs.length > 0) {
      erreurs.slice(0, 2).forEach((msg) => showToast('error', msg));
      return;
    }

    // 2. Secondaire : Message d'erreur serveur (String)
    if (serverError) {
      showToast('error', serverError);
      return;
    }

    // 3. Tertiaire : Message global ou message d'instance
    showToast('error', message || error.message);
  } else if (error instanceof Error) {
    showToast('error', error.message);
  }
}
