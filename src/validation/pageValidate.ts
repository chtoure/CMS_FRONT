import { z } from "zod";

export const pageSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  slug: z.string()
    .min(1, "Le slug est obligatoire")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des minuscules, chiffres et tirets")
    .max(100, "Le slug ne doit pas dépasser 100 caractères")
});

export type PageFormData = z.infer<typeof pageSchema>;
