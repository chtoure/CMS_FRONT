


import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";


const validationSchemaRole = toTypedSchema(
  z.object({
    name:z.string().min(2,"Nom est obligatoire"),
    description: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().min(8, "Minimum 8 caractères").optional()
    ),
    permissionIds: z.array(z.number())
      .min(1, "Veuillez sélectionner au moins une permission")
      .default([])
  })
)


export {
  validationSchemaRole
}
