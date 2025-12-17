import { toast, type ToastOptions } from "vue3-toastify";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  TriangleAlert
} from "lucide-vue-next";
import { h } from "vue";

type ToastType = "success" | "error" | "info" | "warning";

export function showToast(type: ToastType, message: string) {
  // Configuration des styles : bordure colorée à gauche + fond teinté léger
  const typeStyles: Record<ToastType, string> = {
    success: "border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10",
    error: "border-l-4 border-l-destructive bg-destructive/5 dark:bg-destructive/10",
    info: "border-l-4 border-l-blue-500 bg-blue-500/5 dark:bg-blue-500/10",
    warning: "border-l-4 border-l-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10",
  };

  const typeIcons = {
    success: { icon: CheckCircle2, color: "text-primary" },
    error: { icon: AlertCircle, color: "text-destructive" },
    info: { icon: Info, color: "text-blue-500" },
    warning: { icon: TriangleAlert, color: "text-yellow-500" },
  };

  const options: ToastOptions = {
    // Structure globale du toast
    toastClassName: `relative flex min-h-12 rounded-lg justify-between overflow-hidden cursor-pointer shadow-lg border border-border/40 mb-2 ${typeStyles[type]}`,

    // Style du texte (on utilise foreground pour être lisible partout)
    bodyClassName: "flex text-sm font-semibold p-3 text-foreground",

    // Désactivation de la barre de progression pour le minimalisme
    hideProgressBar: true,
    autoClose: 3000,
    theme: "auto",

    // Rendu de l'icône Lucide personnalisée
    icon: () => h(typeIcons[type].icon, {
      class: `w-5 h-5 flex-shrink-0 ${typeIcons[type].color}`
    })
  };

  toast[type](message, options);
}
