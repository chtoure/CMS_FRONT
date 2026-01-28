import type { IContentEntry } from "./content-entry";
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
    entries?: IContentEntry[]
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
  archive?: string,
  page?: number
  limit?: number,
  search?: string
}



export type {
  ContentType,
  RegisterContentType,
  UpdateContentType,
  contentTypeFilter
}



