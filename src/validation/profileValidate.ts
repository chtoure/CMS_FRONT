

import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";


const validationSchemaProfile = toTypedSchema(
  z.object({
    full_name:z.string().min(2,"Nom Complet obligatoire"),
    email:z.string().min(1,"L'Email est obligatoire").email(),
    password: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().min(8, "Minimum 8 caractères").optional()
    ),
  })
)


export {
  validationSchemaProfile
}
