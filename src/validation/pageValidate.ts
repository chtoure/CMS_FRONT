import { z } from "zod";

export const pageSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  slug: z.string()
    .min(1, "L'URL est obligatoire")
    .regex(/^[a-z0-9-/]+$/, "L'URL ne doit contenir que des minuscules, chiffres et tirets")
    .max(100, "L'URL ne doit pas dépasser 100 caractères")
});

export type PageFormData = z.infer<typeof pageSchema>;
