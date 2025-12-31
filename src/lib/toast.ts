import { toast, type ToastOptions } from "vue3-toastify";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  TriangleAlert
} from "lucide-vue-next";
import { h } from "vue";

type ToastType = "success" | "error" | "info" | "warning";

function showToast(type: ToastType, message: string) {
  const typeStyles: Record<ToastType, string> = {
    success: "border-l-4 border-l-green-600 !bg-background !text-text",
    error: "border-l-4 border-l-destructive !bg-background !text-text",
    info: "border-l-4 border-l-blue-500 !bg-background !text-text",
    warning: "border-l-4 border-l-yellow-500 !bg-background !text-text",
  };

  const typeIcons = {
    success: { icon: CheckCircle2, color: "text-green-600" },
    error: { icon: AlertCircle, color: "text-destructive" },
    info: { icon: Info, color: "text-blue-500" },
    warning: { icon: TriangleAlert, color: "text-yellow-500" },
  };

  const options: ToastOptions = {
    toastClassName: `relative flex min-h-12 rounded-lg justify-between overflow-hidden cursor-pointer shadow-lg border border-border/40 mb-2 ${typeStyles[type]}`,

    bodyClassName: "flex text-sm font-semibold p-3 !text-text",

    hideProgressBar: true,
    autoClose: 3000,
    theme: "auto",

    icon: () => h(typeIcons[type].icon, {
      class: `w-5 h-5 flex-shrink-0 ${typeIcons[type].color}`
    })
  };

  toast[type](message, options);
}


export {
  showToast,
  type ToastType
}
