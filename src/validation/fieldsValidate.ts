import { z } from 'zod';
import { FieldType, type IFieldDefinition, type ISelectConfig } from '../type/field';

export const buildZodSchema = (fields: IFieldDefinition[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case FieldType.TEXT:
        let s = z.string();
        if (field.minLength) s = s.min(field.minLength, `Minimum ${field.minLength} caractères`);
        if (field.maxLength) s = s.max(field.maxLength, `Maximum ${field.maxLength} caractères`);
        if (field.pattern) s = s.regex(new RegExp(field.pattern), "Format invalide");
        validator = s;
        break;

      case FieldType.NUMBER:
        let n = z.coerce.number();
        if (field.min !== undefined) n = n.min(field.min, `Minimum ${field.min}`);
        if (field.max !== undefined) n = n.max(field.max, `Maximum ${field.max}`);
        if (field.step) n = n.step(field.step, `Doit être un multiple de ${field.step}`);
        validator = n;
        break;

      case FieldType.BOOLEAN:
        validator = z.boolean().default((field.defaultValue as boolean) ?? false);
        break;

      case FieldType.SELECT: {
        const config = field as IFieldDefinition & ISelectConfig;
        const options = config.options;

        if (options.length === 0) {
          validator = config.multiple ? z.array(z.never()) : z.never();
        } else {
          const baseValidator = z.custom<string | number>((val) => {
            return options.includes(val as never);
          }, {
            message: "Option invalide"
          });

          validator = config.multiple
            ? z.array(baseValidator).min(config.required ? 1 : 0, "Sélectionnez au moins une option")
            : baseValidator;
        }
        break;
      }

      case FieldType.MEDIA:
        const mediaIdSchema = z.number({
          invalid_type_error: "L'identifiant du média doit être un nombre",
        }).positive();

        validator = field.multiple
          ? z.array(mediaIdSchema).min(field.required ? 1 : 0, "Au moins un média est requis")
          : mediaIdSchema;
        break;

      case FieldType.RICH_TEXT:
        validator = z.string().min(1, "Le contenu est requis");
        break;

      case FieldType.TAXONOMY:


      
      case FieldType.RELATION:
        const idSchema = z.union([z.string(), z.number(), z.object({ id: z.number() }).passthrough()]);
        validator = field.multiple ? z.array(idSchema) : idSchema;
        break;

      default:
        validator = z.unknown();
    }

    if (field.required) {
      shape[field.name] = validator;
    } else {
      shape[field.name] = validator.optional().nullable();
    }
  });

  return z.object(shape);
};
