import type { IFieldDefinition } from "./field";

interface ContentType {
    id: number,
    name: string,
    slug: string,
    description: string | null,
    fields_schema: IFieldDefinition[],
    createdAt: Date;
    updatedAt: Date;
    archive: boolean;
    archivedAt: Date | null;
}


interface RegisterContentType {
    name: string,
    slug: string,
    description: string | null,
    fields_schema: IFieldDefinition[],
    archive: boolean | null;
}


interface UpdateContentType {
    name?: string,
    slug?: string,
    description?: string | null,
    fields_schema?: IFieldDefinition[],
    archive?: boolean | null;
}

interface contentTypeFilter {
  archive: string,
  page?: number
  limit?: number
}



export type {
  ContentType,
  RegisterContentType,
  UpdateContentType,
  contentTypeFilter
}



