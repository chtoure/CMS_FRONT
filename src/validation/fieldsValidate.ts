import { z } from 'zod';
import { FieldType, type IFieldDefinition } from '../type/field';

export const buildZodSchema = (fields: IFieldDefinition[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case FieldType.TEXT:
        let s = z.string();
        if (field.minLength) s = s.min(field.minLength);
        if (field.maxLength) s = s.max(field.maxLength);
        if (field.pattern) s = s.regex(new RegExp(field.pattern));
        validator = s;
        break;

      case FieldType.NUMBER:
        let n = z.number();
        if (field.min !== undefined) n = n.min(field.min);
        if (field.max !== undefined) n = n.max(field.max);
        if (field.step) n = n.step(field.step);
        validator = n;
        break;

      case FieldType.BOOLEAN:
        validator = z.boolean().default(field.defaultValue ?? false);
        break;

      case FieldType.SELECT:
        const values = field.options.map(o => String(o.value)) as [string, ...string[]];
        validator = field.multiple ? z.array(z.enum(values)) : z.enum(values);
        break;

      case FieldType.MEDIA:
        const mediaObj = z.object({
          id: z.number(),
          file_path: z.string().optional(),
          type: z.enum(['image', 'video']).optional()
        }).passthrough();
        validator = field.multiple ? z.array(mediaObj) : mediaObj;
        break;

      case FieldType.RICH_TEXT:
        validator = z.string();
        break;

      case FieldType.TAXONOMY:
      case FieldType.RELATION:
        const idSchema = z.union([z.string(), z.number()]);
        validator = field.multiple ? z.array(idSchema) : idSchema;
        break;

      default:
        validator = z.any();
    }

    shape[field.name] = field.required ? validator : validator.optional().nullable();
  });

  return z.object(shape);
};
