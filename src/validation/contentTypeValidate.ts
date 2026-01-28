import { z } from "zod";

export const contentTypeSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),
  slug: z.string()
    .min(2, "Le slug doit contenir au moins 2 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des minuscules, chiffres et tirets")
    .max(50, "Le slug ne doit pas dépasser 50 caractères"),
  description: z.string()
    .max(500, "La description ne doit pas dépasser 500 caractères")
    .optional()
    .or(z.literal('')),
  archive: z.boolean().default(false)
});

export type ContentTypeFormData = z.infer<typeof contentTypeSchema>;
