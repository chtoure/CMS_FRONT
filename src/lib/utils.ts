import type { ClassValue } from "clsx"
import type { Ref } from "vue"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

type Updater<T> = T | ((prev: T) => T)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<unknown>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === "function"
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les environnements non sécurisés (HTTP)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
