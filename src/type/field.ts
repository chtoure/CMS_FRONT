import { type JsonValue } from './content-entry';

enum FieldType {
  TEXT = 'text',
  RICH_TEXT = 'richtext',
  NUMBER = 'number',
  MEDIA = 'media',
  TAXONOMY = 'taxonomy',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  RELATION = 'relation'
}

interface IBaseField {
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  colSpan?: 1 | 2;
  defaultValue?: JsonValue; // Use imported JsonValue
}

interface ITextConfig {
  type: FieldType.TEXT;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface INumberConfig {
  type: FieldType.NUMBER;
  min?: number;
  max?: number;
  step?: number;
}

interface IMediaConfig {
  type: FieldType.MEDIA;
  allowedTypes: ('image' | 'video')[];
  multiple: boolean;
  maxSize?: number;
}

interface ITaxonomyConfig {
  type: FieldType.TAXONOMY;
  taxonomy_slug: string;
  multiple: boolean;
  renderType: 'combobox' | 'badges' | 'checkbox';
}

interface ISelectOption {
  label: string;
  value: string | number;
}

interface ISelectConfig {
  type: FieldType.SELECT;
  options: ISelectOption[];
  multiple: boolean;
}

interface IBooleanConfig {
  type: FieldType.BOOLEAN;
  defaultValue?: boolean;
}

interface IRichTextConfig {
  type: FieldType.RICH_TEXT;
  toolbar?: 'minimal' | 'full';
}

interface IRelationConfig {
  type: FieldType.RELATION;
  targetContentTypeSlug: string;
  multiple: boolean;
}

type IFieldDefinition = IBaseField & (
  | ITextConfig
  | INumberConfig
  | IMediaConfig
  | ITaxonomyConfig
  | ISelectConfig
  | IBooleanConfig
  | IRichTextConfig
  | IRelationConfig
);


export {
  FieldType,
  type IBaseField,
  type ITextConfig,
  type INumberConfig,
  type IMediaConfig,
  type ITaxonomyConfig,
  type ISelectOption,
  type ISelectConfig,
  type IBooleanConfig,
  type IRichTextConfig,
  type IRelationConfig,
  type IFieldDefinition
}
