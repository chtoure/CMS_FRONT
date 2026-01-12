
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";


const validationSchemaLogin = toTypedSchema(
  z.object({
    email:z.string().min(1,"L'Email est obligatoire").email(),
    password:z.string().min(1,"Mot de passe est obligatoire")
  })
)


export {
  validationSchemaLogin
}
