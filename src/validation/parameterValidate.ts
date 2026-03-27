import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

const parameterSchema = toTypedSchema(
  z.object({
    entity_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    title: z.string().min(5, "Le titre est trop court pour le SEO"),
    description: z.string().max(160, "La description SEO ne doit pas dépasser 160 caractères").optional().or(z.literal('')),
    mediaId: z.number({ required_error: "Veuillez sélectionner un média" }),
    family_name: z.string().optional().or(z.literal(''))
  })
)


export {
  parameterSchema
}
